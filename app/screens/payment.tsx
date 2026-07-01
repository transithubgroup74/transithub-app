import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { darkColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const PAYSTACK_PUBLIC_KEY = 'pk_test_ce7e4e8adb4bef6510fbe1fb7bf04d52b2f7c001';

const MOMO = [
  { id: 'mtn', label: 'MTN', sub: 'MoMo', color: '#FFCC00' },
  { id: 'telecel', label: 'Telecel', sub: 'Cash', color: '#E53E3E' },
  { id: 'airteltigo', label: 'AirtelTigo', sub: 'Money', color: '#3182CE' },
];
const CARDS = [
  { id: 'visa', label: 'Visa', color: '#1A56DB' },
  { id: 'mastercard', label: 'Mastercard', color: '#F56565' },
];
const BANKS = [
  { id: 'gcb', label: 'GCB Bank' }, { id: 'ecobank', label: 'Ecobank' },
  { id: 'fidelity', label: 'Fidelity' }, { id: 'absa', label: 'Absa' },
  { id: 'stanbic', label: 'Stanbic' }, { id: 'zenith', label: 'Zenith' },
  { id: 'access', label: 'Access Bank' }, { id: 'calbank', label: 'Cal Bank' },
  { id: 'nib', label: 'NIB' }, { id: 'prudential', label: 'Prudential Bank' },
];

// Ghana mobile prefixes per network — used to catch wrong-network numbers.
const MOMO_PREFIXES: Record<string, string[]> = {
  mtn: ['024', '025', '053', '054', '055', '059'],
  telecel: ['020', '050'],
  airteltigo: ['026', '027', '056', '057'],
};

// Accepts 024..., +233 24..., 233 24... and normalizes to 0XXXXXXXXX.
const normalizeGhanaNumber = (raw: string) => {
  let n = (raw || '').replace(/[^\d+]/g, '');
  if (n.startsWith('+233')) n = '0' + n.slice(4);
  else if (n.startsWith('233')) n = '0' + n.slice(3);
  return n;
};

// Luhn checksum — catches mistyped card numbers.
const luhnValid = (num: string) => {
  let sum = 0, dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
};

const cardBrand = (digits: string) => {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  return null;
};

export default function Payment() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const p = useLocalSearchParams<{ from: string; to: string; total: string; seat: string; op: string; dep: string; arr: string; date: string; busClass: string; scheduleId: string }>();
  const [selected, setSelected] = useState('');
  const [momoNum, setMomoNum] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const isMomo = ['mtn', 'telecel', 'airteltigo'].includes(selected);
  const isCard = ['visa', 'mastercard'].includes(selected);

  const processPayment = async () => {
    if (!selected) return Alert.alert('Select a payment method');
    if (isMomo) {
      const label = selected === 'mtn' ? 'MTN MoMo' : selected === 'telecel' ? 'Telecel Cash' : 'AirtelTigo Money';
      const num = normalizeGhanaNumber(momoNum);
      if (!num) return Alert.alert('Enter your MoMo number');
      if (!/^0\d{9}$/.test(num)) return Alert.alert('Invalid number', 'Enter a valid 10-digit Ghana number, e.g. 024 123 4567.');
      const prefixes = MOMO_PREFIXES[selected] || [];
      if (!prefixes.includes(num.slice(0, 3))) {
        return Alert.alert(`Not a ${label} number`, `${label} numbers start with ${prefixes.join(', ')}. Check the number or switch networks.`);
      }
    }
    if (isCard) {
      const digits = cardNum.replace(/\D/g, '');
      if (!digits) return Alert.alert('Enter card number');
      const brand = cardBrand(digits);
      if (digits.length < 13 || digits.length > 19 || !brand || !luhnValid(digits)) {
        return Alert.alert('Invalid card number', 'Check the card number and try again.');
      }
      if (brand !== selected) {
        const brandLabel = brand === 'visa' ? 'Visa' : 'Mastercard';
        return Alert.alert(`Not a ${selected === 'visa' ? 'Visa' : 'Mastercard'} card`, `This looks like a ${brandLabel} number — select ${brandLabel} instead.`);
      }
      const exp = cardExp.trim().replace(/\s/g, '');
      const expMatch = exp.match(/^(0[1-9]|1[0-2])\/?(\d{2})$/);
      if (!expMatch) return Alert.alert('Invalid expiry', 'Enter the expiry as MM/YY.');
      const expYear = 2000 + parseInt(expMatch[2], 10);
      const expMonth = parseInt(expMatch[1], 10);
      const now = new Date();
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
        return Alert.alert('Card expired', 'This card\'s expiry date has passed.');
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) return Alert.alert('Invalid CVV', 'Enter the 3-digit code on the back of the card.');
    }
    setLoading(true);
    const email = await AsyncStorage.getItem('userEmail') || 'passenger@transithub.com';
    setUserEmail(email);
    setLoading(false);
    setShowPaystack(true);
  };

  const paystackHtml = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;background:#020E1A;display:flex;align-items:center;justify-content:center;height:100vh;">
<script src="https://js.paystack.co/v1/inline.js"></script>
<script>
  var handler = PaystackPop.setup({
    key: '${PAYSTACK_PUBLIC_KEY}',
    email: '${userEmail}',
    amount: ${Math.round(parseFloat(p.total || '0') * 100)},
    currency: 'GHS',
    channels: ${isMomo ? "['mobile_money']" : isCard ? "['card']" : "['bank']"},
    callback: function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', ref: response.reference }));
    },
    onClose: function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
    }
  });
  handler.openIframe();
</script>
</body>
</html>`;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setShowPaystack(false);
      if (data.status === 'success') {
        router.replace({ pathname: '/screens/awaiting', params: p });
      } else {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled. Please try again.');
      }
    } catch {}
  };

  if (showPaystack) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#020E1A' }}>
        <TouchableOpacity onPress={() => setShowPaystack(false)} style={{ padding: 16 }}>
          <Text style={{ color: '#C9A84C', fontSize: 22 }}>← Back</Text>
        </TouchableOpacity>
        <WebView
          source={{ html: paystackHtml }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => <ActivityIndicator color="#C9A84C" style={{ flex: 1 }} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.routeText}>{p.from}→{p.to}, Seat {p.seat}</Text>
            <Text style={styles.totalText}>GHS {p.total}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Choose Payment Method</Text>

        <Text style={styles.subLabel}>📱 Mobile Money</Text>
        <View style={styles.grid2}>
          {MOMO.map((m) => (
            <TouchableOpacity key={m.id} style={[styles.payOpt, selected === m.id && styles.payOptSel]} onPress={() => setSelected(m.id)}>
              <Text style={[styles.payLabel, { color: m.color }]}>{m.label}</Text>
              <Text style={styles.paySub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.subLabel, { marginTop: 10 }]}>💳 Bank Cards</Text>
        <View style={styles.grid2}>
          {CARDS.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.payOpt, selected === c.id && styles.payOptSel]} onPress={() => setSelected(c.id)}>
              <Text style={[styles.payLabel, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.subLabel, { marginTop: 10 }]}>🏦 Ghanaian Banks</Text>
        <View style={styles.grid2}>
          {BANKS.map((b) => (
            <TouchableOpacity key={b.id} style={[styles.payOpt, selected === b.id && styles.payOptSel]} onPress={() => setSelected(b.id)}>
              <Text style={styles.payLabel}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isMomo && (
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder={`🇬🇭 +233 Enter ${selected === 'mtn' ? 'MTN MoMo' : selected === 'telecel' ? 'Telecel Cash' : 'AirtelTigo Money'} number`}
            placeholderTextColor={colors.gray}
            keyboardType="phone-pad"
            value={momoNum}
            onChangeText={setMomoNum}
          />
        )}

        {isCard && (
          <View style={{ marginTop: 12 }}>
            <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor={colors.gray} keyboardType="numeric" value={cardNum} onChangeText={setCardNum} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor={colors.gray} value={cardExp} onChangeText={setCardExp} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor={colors.gray} keyboardType="numeric" value={cardCvv} onChangeText={setCardCvv} />
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.btnGold, { marginTop: 14 }]} onPress={processPayment} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnGoldText}>Pay GHS {p.total}</Text>}
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Secured by Paystack</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof darkColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 14 },
  routeText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  totalText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  sectionLabel: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.text, marginBottom: 10 },
  subLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.gold, marginBottom: 6 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  payOpt: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.fborder, borderRadius: 10, padding: 10, alignItems: 'center' },
  payOptSel: { borderColor: colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  payLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.text },
  paySub: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.text2 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  secureText: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
});
