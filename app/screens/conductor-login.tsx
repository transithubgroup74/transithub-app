import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConductorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.busIcon}>🚌</Text>
          <Text style={styles.title}>Conductor Login</Text>
          <Text style={styles.sub}>For station staff only</Text>
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ This login is for conductors only. </Text>
            <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Passengers tap here.</Text></TouchableOpacity>
          </View>
        </View>
        <TextInput style={styles.input} placeholder="Conductor Email" placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.gray} secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.btnGold} onPress={() => router.push('/screens/conductor-scan')}>
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
  warning: { backgroundColor: 'rgba(255,165,2,.1)', borderWidth: 1, borderColor: colors.orange, borderRadius: 12, padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  warningText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.orange },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
