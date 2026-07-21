import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, errorMessage } from '../../services/api';
import { addNotification } from '../../utils/notifications';
import { useTheme } from '../../context/ThemeContext';
import { darkColors } from '../../constants/theme';
import PasswordInput from '../../components/PasswordInput';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const capitalize = (s: string) => s.trim() ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase() : '';

  const passwordValid = password.length >= 8;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const doRegister = async () => {
    if (!firstName.trim() || !surname.trim()) return Alert.alert('Error', 'First name and surname are required');
    if (!email || !password || !phone) return Alert.alert('Error', 'Please fill in all fields');
    if (!emailValid) return Alert.alert('Error', 'Please enter a valid email address');
    if (!passwordValid) return Alert.alert('Error', 'Password must be at least 8 characters');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match');

    const fullName = [capitalize(firstName), capitalize(middleName), capitalize(surname)].filter(Boolean).join(' ');
    const account = email.trim().toLowerCase();

    setLoading(true);
    try {
      const res = await auth.register({ name: fullName, email: account, password, phone });
      const d = res.data || {};
      await AsyncStorage.setItem('token', d.token);
      await AsyncStorage.setItem('userEmail', d.email || account);
      await AsyncStorage.setItem('userName', d.name || fullName);
      await AsyncStorage.setItem('userPhone', d.phone || phone);
      await addNotification({
        icon: '⭐',
        bg: 'rgba(201,168,76,0.15)',
        title: 'Welcome to TransitHub!',
        msg: `Hi ${capitalize(firstName)}, book your first intercity ticket and travel in comfort across Ghana.`,
        time: 'Just now',
      });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Sign up failed', errorMessage(e, "We couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>
      <View style={styles.brand}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Create Account</Text>
      </View>

      <TextInput style={styles.input} placeholder="First Name *" placeholderTextColor={colors.gray} value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Middle Name (optional)" placeholderTextColor={colors.gray} value={middleName} onChangeText={setMiddleName} />
      <TextInput style={styles.input} placeholder="Surname *" placeholderTextColor={colors.gray} value={surname} onChangeText={setSurname} />
      <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
      {email.trim().length > 0 && !emailValid && (
        <Text style={[styles.hint, { color: colors.orange }]}>Enter a valid email address</Text>
      )}
      {emailValid && (
        <Text style={[styles.hint, { color: colors.text2 }]}>We'll send a 6-digit code here to confirm it's yours</Text>
      )}
      <TextInput style={styles.input} placeholder="🇬🇭 +233 Phone Number" placeholderTextColor={colors.gray} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <PasswordInput colors={colors} placeholder="Password" value={password} onChangeText={setPassword} />
      <Text style={[styles.hint, { color: password.length === 0 ? colors.text2 : passwordValid ? colors.green : colors.orange }]}>
        {password.length === 0
          ? 'Use at least 8 characters'
          : passwordValid
            ? '✓ Password looks good'
            : `At least 8 characters (${password.length}/8)`}
      </Text>
      <PasswordInput colors={colors} placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} />
      {confirm.length > 0 && confirm !== password && (
        <Text style={[styles.hint, { color: colors.orange }]}>Passwords don't match</Text>
      )}

      <TouchableOpacity style={styles.btnGold} onPress={doRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnGoldText}>Create Account</Text>}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={styles.grayText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: typeof darkColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  brand: { alignItems: 'center', marginTop: 6, marginBottom: 22 },
  logo: { width: 72, height: 72, borderRadius: 17 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.text, marginTop: 10 },
  input: {
    backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder,
    borderRadius: 12, padding: 12, color: colors.text,
    fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8,
  },
  hint: { fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: -4, marginBottom: 8, marginLeft: 4 },
  btnGold: {
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12, marginTop: 4,
  },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  grayText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold },
});
