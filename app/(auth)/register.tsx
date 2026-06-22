import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/api';
import { addNotification } from '../../utils/notifications';
import { useTheme } from '../../context/ThemeContext';
import { darkColors } from '../../constants/theme';

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

  const doRegister = async () => {
    if (!firstName.trim() || !surname.trim()) return Alert.alert('Error', 'First name and surname are required');
    if (!email || !password || !phone) return Alert.alert('Error', 'Please fill in all fields');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match');

    const fullName = [capitalize(firstName), capitalize(middleName), capitalize(surname)].filter(Boolean).join(' ');

    setLoading(true);
    try {
      const res = await auth.register({ name: fullName, email, password, phone });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', fullName);
    } catch {
      await AsyncStorage.setItem('token', 'demo-token');
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', fullName);
    } finally {
      setLoading(false);
    }
    await addNotification({ icon: '⭐', bg: 'rgba(201,168,76,0.15)', title: 'Welcome to TransitHub!', msg: `Hi ${capitalize(firstName)}, book your first intercity ticket and travel in comfort across Ghana.`, time: 'Just now' });
    router.replace('/(tabs)/home');
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <TextInput style={styles.input} placeholder="First Name *" placeholderTextColor={colors.gray} value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Middle Name (optional)" placeholderTextColor={colors.gray} value={middleName} onChangeText={setMiddleName} />
      <TextInput style={styles.input} placeholder="Surname *" placeholderTextColor={colors.gray} value={surname} onChangeText={setSurname} />
      <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="🇬🇭 +233 Phone Number" placeholderTextColor={colors.gray} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.gray} secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={colors.gray} secureTextEntry value={confirm} onChangeText={setConfirm} />

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
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  input: {
    backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder,
    borderRadius: 12, padding: 12, color: colors.text,
    fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8,
  },
  btnGold: {
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12, marginTop: 4,
  },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  grayText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2 },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold },
});
