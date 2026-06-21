import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

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
];

export default function Payment() {
  const router = useRouter();
  const p = useLocalSearchParams<{ from: string; to: string; total: string; seat: string }>();
  const [selected, setSelected] = useState('');
  const [momoNum, setMomoNum] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const isMomo = ['mtn', 'telecel', 'airteltigo'].includes(selected);
  const isCard = ['visa', 'mastercard'].includes(selected);

  const processPayment = () => {
    if (!selected) return Alert.alert('Select a payment method');
    if (isMomo && !momoNum) return Alert.alert('Enter your MoMo number');
    if (isCard && !cardNum) return Alert.alert('Enter card number');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/screens/awaiting', params: p });
    }, 1000);
  };

  const selOpt = (id: string) => setSelected(id);

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
        <View style={styles.grid3}>
          {MOMO.map((m) => (
            <TouchableOpacity key={m.id} style={[styles.payOpt, selected === m.id && styles.payOptSel]} onPress={() => selOpt(m.id)}>
              <Text style={[styles.payLabel, { color: m.color }]}>{m.label}</Text>
              <Text style={styles.paySub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.subLabel, { marginTop: 10 }]}>💳 Bank Cards</Text>
        <View style={styles.grid2}>
          {CARDS.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.payOpt, selected === c.id && styles.payOptSel]} onPress={() => selOpt(c.id)}>
              <Text style={[styles.payLabel, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.subLabel, { marginTop: 10 }]}>🏦 Ghanaian Banks</Text>
        <View style={styles.grid2}>
          {BANKS.map((b) => (
            <TouchableOpacity key={b.id} style={[styles.payOpt, selected === b.id && styles.payOptSel]} onPress={() => selOpt(b.id)}>
              <Text style={styles.payLabel}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isMomo && (
          <TextInput style={[styles.input, { marginTop: 12 }]} placeholder="🇬🇭 +233 Enter MoMo number" placeholderTextColor={colors.gray} keyboardType="phone-pad" value={momoNum} onChangeText={setMomoNum} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 14 },
  routeText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  totalText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  sectionLabel: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.text, marginBottom: 10 },
  subLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.gold, marginBottom: 6 },
  grid3: { flexDirection: 'row', gap: 6, marginBottom: 4 },
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
