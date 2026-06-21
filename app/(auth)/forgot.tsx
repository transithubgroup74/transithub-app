import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';

export default function Forgot() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const send = () => {
    if (!email) return Alert.alert('Enter your email address');
    Alert.alert('Reset link sent!', 'Check your email for the reset link.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.center}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.sub}>Enter your email and we'll send you a reset link</Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={colors.gray}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.btnGold} onPress={send}>
          <Text style={styles.btnGoldText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 56 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  center: { alignItems: 'center', paddingTop: 24 },
  icon: { fontSize: 48, marginBottom: 12 },
  heading: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text, marginBottom: 8 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 12, width: '100%' },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
