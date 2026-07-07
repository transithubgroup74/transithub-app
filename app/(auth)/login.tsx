import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import PasswordInput from '../../components/PasswordInput';

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      const d = res.data || {};
      await AsyncStorage.setItem('token', d.token);
      const prevEmail = await AsyncStorage.getItem('userEmail');
      await AsyncStorage.setItem('userEmail', email);
      // Pull this account's profile from the backend so it follows the user
      // to any device.
      await AsyncStorage.setItem('userName', d.name || email.split('@')[0]);
      await AsyncStorage.setItem('userPhone', d.phone || '');
      if (d.photoUrl) await AsyncStorage.setItem('userPhoto', d.photoUrl);
      else await AsyncStorage.removeItem('userPhoto');
      // Switching accounts: drop the previous user's local-only data.
      if (prevEmail && prevEmail !== email) {
        await AsyncStorage.multiRemove(['localBookings', 'userDob']);
      }
    } catch {
      await AsyncStorage.setItem('token', 'demo-token');
      const prevEmail = await AsyncStorage.getItem('userEmail');
      await AsyncStorage.setItem('userEmail', email);
      if (prevEmail !== email) {
        await AsyncStorage.multiSet([['userName', email.split('@')[0]], ['userPhone', ''], ['userDob', '']]);
      }
    } finally {
      setLoading(false);
    }
    router.replace('/(tabs)/home');
  };

  const socialComingSoon = (provider: string) =>
    Alert.alert(`${provider} sign-in`, 'Coming soon. For now, please log in with your email and password.');

  const s = getStyles(colors);

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
        <Text style={s.back}>←</Text>
      </TouchableOpacity>
      <View style={s.brand}>
        <Image source={require('../../assets/icon.png')} style={s.logo} />
        <Text style={s.title}>Welcome Back</Text>
      </View>

      <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.gray}
        keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <PasswordInput colors={colors} placeholder="Password" value={password} onChangeText={setPassword} />

      <TouchableOpacity style={s.forgot} onPress={() => router.push('/(auth)/forgot')}>
        <Text style={s.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btnGold} onPress={doLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.btnGoldText}>Login</Text>}
      </TouchableOpacity>

      <Text style={s.orText}>— or continue with —</Text>

      <TouchableOpacity style={[s.btnOutline, { marginBottom: 8 }]} onPress={() => socialComingSoon('Google')}>
        <Text style={s.btnOutlineText}>🇬 Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={() => socialComingSoon('Apple')}>
        <Text style={s.btnOutlineText}> Apple</Text>
      </TouchableOpacity>

      <View style={s.registerRow}>
        <Text style={s.grayText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={s.link}>Register</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={{ alignItems: 'center', marginTop: 14 }} onPress={() => router.push('/screens/conductor-login' as any)}>
        <Text style={[s.link, { fontSize: 12, color: colors.text2 }]}>Conductor? Login here →</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  brand: { alignItems: 'center', marginTop: 6, marginBottom: 26 },
  logo: { width: 76, height: 76, borderRadius: 18 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.text, marginTop: 10 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8 },
  forgot: { alignItems: 'flex-end', marginBottom: 20 },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  orText: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginBottom: 12 },
  btnOutline: { borderRadius: 12, borderWidth: 1, borderColor: colors.gold, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  btnOutlineText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.gold },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  grayText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
});
