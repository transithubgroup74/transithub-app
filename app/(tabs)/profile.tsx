import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU = [
  { icon: '👤', label: 'Personal Information' },
  { icon: '💳', label: 'Payment Methods' },
  { icon: '🔖', label: 'My Saved Routes' },
  { icon: '🔔', label: 'Notification Settings' },
  { icon: '❓', label: 'Help and Support' },
];

export default function Profile() {
  const router = useRouter();
  const [name, setName] = useState('Traveller');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    AsyncStorage.multiGet(['userName', 'userEmail', 'userPhone']).then((res) => {
      if (res[0][1]) setName(res[0][1]);
      if (res[1][1]) setEmail(res[1][1]);
      if (res[2][1]) setPhone(res[2][1]);
    });
  }, []);

  const signOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'userName', 'userEmail']);
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Avatar card */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          {phone ? <Text style={styles.phone}>{phone}</Text> : null}
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/screens/edit-profile')}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[{ label: 'Total Trips', val: '0' }, { label: 'This Month', val: '0' }, { label: 'Saved Routes', val: '5' }].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={[styles.card, { padding: 0 }]}>
          {MENU.map((m, i) => (
            <TouchableOpacity key={i} style={[styles.menuRow, i === MENU.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => { if (i === 0) router.push('/screens/edit-profile'); }}>
              <Text style={{ fontSize: 18, width: 28 }}>{m.icon}</Text>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>← Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10 },
  avatar: { width: 64, height: 64, backgroundColor: colors.navy, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.gold },
  name: { fontFamily: 'DMSans_500Medium', fontSize: 17, color: colors.text, marginBottom: 4 },
  email: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold, marginBottom: 4 },
  phone: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginBottom: 4 },
  editBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 20, marginTop: 6 },
  editBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.gold },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(27,58,107,0.25)' },
  menuLabel: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text },
  chevron: { color: colors.text2, fontSize: 18 },
  signOut: { borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  signOutText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.red },
});
