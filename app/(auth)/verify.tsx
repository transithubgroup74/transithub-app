import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, errorMessage } from '../../services/api';
import { addNotification } from '../../utils/notifications';
import { useTheme } from '../../context/ThemeContext';

const RESEND_SECONDS = 30;

export default function Verify() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string; firstName?: string; phone?: string }>();

  const email = String(params.email || '');
  const firstName = String(params.firstName || '');
  const phone = String(params.phone || '');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async () => {
    if (code.trim().length !== 6) return Alert.alert('Error', 'Enter the 6-digit code we emailed you');
    setLoading(true);
    try {
      // The token is only issued here — proof they can open the inbox.
      const res = await auth.verify(email, code.trim());
      const d = res.data || {};
      await AsyncStorage.setItem('token', d.token);
      await AsyncStorage.setItem('userEmail', d.email || email);
      await AsyncStorage.setItem('userName', d.name || firstName);
      await AsyncStorage.setItem('userPhone', d.phone || phone);
      await addNotification({
        icon: '⭐',
        bg: 'rgba(201,168,76,0.15)',
        title: 'Welcome to TransitHub!',
        msg: `Hi ${firstName || 'there'}, book your first intercity ticket and travel in comfort across Ghana.`,
        time: 'Just now',
      });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Verification failed', errorMessage(e, "That code isn't right. Check it and try again."));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await auth.resendCode(email);
      setCooldown(RESEND_SECONDS);
      setCode('');
      Alert.alert('Code sent', `We sent a new code to ${email}.`);
    } catch (e: any) {
      Alert.alert('Could not resend', errorMessage(e, 'Please try again in a moment.'));
    } finally {
      setResending(false);
    }
  };

  const s = getStyles(colors);
  const ready = code.trim().length === 6;

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
        <Text style={s.back}>←</Text>
      </TouchableOpacity>

      <View style={s.brand}>
        <Image source={require('../../assets/icon.png')} style={s.logo} />
        <Text style={s.title}>Check your email</Text>
        <Text style={s.subtitle}>We sent a 6-digit code to</Text>
        <Text style={s.email}>{email}</Text>
      </View>

      <TextInput
        style={s.codeInput}
        placeholder="000000"
        placeholderTextColor={colors.gray}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
      />

      <TouchableOpacity style={[s.btnGold, !ready && { opacity: 0.4 }]} onPress={submit} disabled={loading || !ready}>
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.btnGoldText}>Verify & Continue</Text>}
      </TouchableOpacity>

      <View style={s.resendRow}>
        {cooldown > 0 ? (
          <Text style={s.grayText}>Didn't get it? Resend in {cooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={resend} disabled={resending}>
            <Text style={s.link}>{resending ? 'Sending…' : 'Resend code'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={{ alignItems: 'center', marginTop: 18 }} onPress={() => router.back()}>
        <Text style={[s.link, { fontSize: 12, color: colors.text2 }]}>Wrong email? Go back</Text>
      </TouchableOpacity>

      <Text style={s.note}>The code expires in 15 minutes. Check your spam folder if it hasn't arrived.</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 56 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  brand: { alignItems: 'center', marginTop: 6, marginBottom: 26 },
  logo: { width: 76, height: 76, borderRadius: 18 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.text, marginTop: 10 },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginTop: 8 },
  email: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.gold, marginTop: 2 },
  codeInput: {
    backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder,
    borderRadius: 12, paddingVertical: 16, color: colors.text,
    fontFamily: 'DMSans_500Medium', fontSize: 28, textAlign: 'center',
    letterSpacing: 12, marginBottom: 20,
  },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  grayText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold },
  note: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2, textAlign: 'center', marginTop: 28, lineHeight: 16 },
});
