import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordInput from '../../components/PasswordInput';

// Approved conductor accounts (mirrors the staff list in the admin dashboard).
// NOTE: these live in the app for now; full server-side staff auth is part of
// the deferred "admin dashboard → backend wiring" task.
const CONDUCTORS: Record<string, { password: string; name: string; company: string }> = {
  'VIP-CN-04': { password: 'emma2025', name: 'Emmanuel Asare', company: 'VIP Jeoun' },
  'OA-CN-06': { password: 'kojo2025', name: 'Kojo Antwi', company: 'OA Express' },
  'STC-CN-08': { password: 'akosua2025', name: 'Akosua Frimpong', company: 'STC' },
  'KGD-CN-10': { password: 'esi2025', name: 'Esi Boateng', company: 'Kingdom Transport' },
  'NR-CN-12': { password: 'comfort2025', name: 'Comfort Agyei', company: 'Night Rider Express' },
  'MMT-CN-14': { password: 'joyce2025', name: 'Joyce Adu', company: 'Metro Mass Transit' },
};

export default function ConductorLogin() {
  const router = useRouter();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const id = staffId.trim().toUpperCase();
    const match = CONDUCTORS[id];
    if (!match || match.password !== password) {
      setError('Invalid Staff ID or password. Conductors only.');
      return;
    }
    setError('');
    await AsyncStorage.multiSet([
      ['conductorId', id],
      ['conductorName', match.name],
      ['conductorCompany', match.company],
    ]);
    router.push('/screens/conductor-scan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.busIcon}>🚌</Text>
          <Text style={styles.title}>Conductor Login</Text>
          <Text style={styles.sub}>For station staff only</Text>
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ This login is for conductors only.</Text>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
              <Text style={styles.link}>Passengers tap here</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Staff ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Staff ID"
          placeholderTextColor={colors.gray}
          autoCapitalize="characters"
          autoCorrect={false}
          value={staffId}
          onChangeText={(t) => { setStaffId(t); if (error) setError(''); }}
        />

        <Text style={styles.label}>Password</Text>
        <PasswordInput
          colors={colors}
          placeholder="Password"
          value={password}
          onChangeText={(t) => { setPassword(t); if (error) setError(''); }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btnGold} onPress={handleLogin}>
          <Text style={styles.btnGoldText}>Login as Conductor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { fontSize: 22, color: colors.gold, padding: 4, marginBottom: 16 },
  center: { alignItems: 'center', marginBottom: 24 },
  busIcon: { fontSize: 48, marginBottom: 10 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text, marginBottom: 4 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold, marginBottom: 14 },
  warning: { backgroundColor: 'rgba(255,165,2,.1)', borderWidth: 1, borderColor: colors.orange, borderRadius: 12, padding: 12, alignItems: 'center' },
  warningText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.orange, textAlign: 'center' },
  link: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold, marginTop: 6, textDecorationLine: 'underline' },
  label: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginBottom: 5, marginLeft: 2 },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 12, letterSpacing: 1 },
  error: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.red, marginBottom: 10, marginLeft: 2 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
