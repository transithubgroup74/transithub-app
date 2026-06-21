import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

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
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userEmail', email);
    } catch {
      await AsyncStorage.setItem('token', 'demo-token');
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', email.split('@')[0]);
    } finally {
      setLoading(false);
    }
    router.replace('/(tabs)/home');
  };

  const s = getStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Welcome Back</Text>
        <View style={{ width: 28 }} />
      </View>

      <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.gray}
        keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.gray}
        secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={s.forgot} onPress={() => router.push('/(auth)/forgot')}>
        <Text style={s.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btnGold} onPress={doLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={s.btnGoldText}>Login</Text>}
      </TouchableOpacity>

      <Text style={s.orText}>— or continue with —</Text>

      <TouchableOpacity style={[s.btnOutline, { marginBottom: 8 }]} onPress={doLogin}>
        <Text style={s.btnOutlineText}>🇬 Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={doLogin}>
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
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
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
