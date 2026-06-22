import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkColors } from '../../constants/theme';
import { bookings as bookingsApi } from '../../services/api';

const MENU = [
  { icon: '👤', label: 'Personal Information', route: '/screens/edit-profile' },
  { icon: '🎫', label: 'My Tickets', route: '/(tabs)/tickets' },
  { icon: '🔔', label: 'Notifications', route: '/(tabs)/notifications' },
  { icon: '🗺️', label: 'All Routes', route: '/screens/all-routes' },
  { icon: '❓', label: 'Help and Support', route: null },
];

export default function Profile() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const [name, setName] = useState('Traveller');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tripCount, setTripCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const loadProfile = async () => {
    const res = await AsyncStorage.multiGet(['userName', 'userEmail', 'userPhone', 'localBookings', 'userPhoto']);
    if (res[0][1]) setName(res[0][1]);
    else if (res[1][1]) setName(res[1][1].split('@')[0]);
    if (res[1][1]) setEmail(res[1][1]);
    if (res[2][1]) setPhone(res[2][1]);
    if (res[4][1]) setPhoto(res[4][1]);

    const localBookings = res[3][1] ? JSON.parse(res[3][1]) : [];
    let apiBookings: any[] = [];
    try {
      const apiRes = await bookingsApi.getMine();
      apiBookings = apiRes.data || [];
    } catch (_) {}

    const all = [...localBookings, ...apiBookings];
    setTripCount(all.length);
    const now = new Date();
    const thisMonth = all.filter((b: any) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setMonthCount(thisMonth.length);
  };

  const signOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleMenu = (route: string | null) => {
    if (!route) return Alert.alert('Help & Support', 'Email us at support@transithub.com.gh\nor call 0800-TRANSIT');
    router.push(route as any);
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
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>{name}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
          {phone ? <Text style={styles.phone}>{phone}</Text> : null}
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/screens/edit-profile' as any)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Trips', val: String(tripCount) },
            { label: 'This Month', val: String(monthCount) },
            { label: 'Saved Routes', val: '10' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={[styles.card, { padding: 0 }]}>
          {MENU.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i === MENU.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => handleMenu(m.route)}
            >
              <Text style={{ fontSize: 18, width: 28 }}>{m.icon}</Text>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme toggle */}
        <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }]}>
          <Text style={{ fontSize: 18, width: 28 }}>{isDark ? '🌙' : '☀️'}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 }}>
              {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.fborder, true: colors.navy }}
            thumbColor={colors.gold}
          />
        </View>

        {/* App version */}
        <Text style={[styles.version, { color: colors.text2 }]}>TransitHub v1.0.0 · Ghana's Intercity Travel App</Text>

        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof darkColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10 },
  avatar: { width: 72, height: 72, backgroundColor: colors.navy, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: colors.gold, overflow: 'hidden' },
  avatarImg: { width: 72, height: 72, borderRadius: 36 },
  avatarText: { fontFamily: 'DMSans_500Medium', fontSize: 24, color: colors.gold },
  name: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.text, marginBottom: 4 },
  email: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold, marginBottom: 2 },
  phone: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginBottom: 4 },
  editBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 20, marginTop: 8 },
  editBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.gold },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontFamily: 'DMSans_500Medium', fontSize: 22, color: colors.gold },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2, textAlign: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(27,58,107,0.25)' },
  menuLabel: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text },
  chevron: { color: colors.text2, fontSize: 18 },
  version: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2, marginVertical: 12 },
  signOut: { borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.red },
});
