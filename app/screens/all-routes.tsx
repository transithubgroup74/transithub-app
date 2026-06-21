import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_ROUTES = [
  { from: 'Kumasi', to: 'Accra', reg: 80, exec: 150 },
  { from: 'Accra', to: 'Tamale', reg: 120, exec: 200 },
  { from: 'Accra', to: 'Bolgatanga', reg: 140, exec: 220 },
  { from: 'Accra', to: 'WA', reg: 130, exec: 210 },
  { from: 'Kumasi', to: 'Tamale', reg: 100, exec: 180 },
  { from: 'Accra', to: 'Takoradi', reg: 60, exec: 120 },
  { from: 'Accra', to: 'Cape Coast', reg: 50, exec: 100 },
  { from: 'Accra', to: 'Sunyani', reg: 90, exec: 160 },
  { from: 'Accra', to: 'Techiman', reg: 95, exec: 165 },
  { from: 'Accra', to: 'Navrongo', reg: 150, exec: 230 },
];

export default function AllRoutes() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = ALL_ROUTES.filter(r =>
    `${r.from} ${r.to}`.toLowerCase().includes(search.toLowerCase())
  );

  const book = async (r: typeof ALL_ROUTES[0]) => {
    await AsyncStorage.setItem('fromCity', r.from);
    await AsyncStorage.setItem('toCity', r.to);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>All Routes</Text>
        <View style={{ width: 28 }} />
      </View>
      <TextInput style={styles.input} placeholder="🔍 Search routes..." placeholderTextColor={colors.gray} value={search} onChangeText={setSearch} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}>
        {filtered.map((r, i) => (
          <View key={i} style={styles.routeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeName}>{r.from} → {r.to}</Text>
              <Text style={styles.routePrices}>Regular <Text style={{ color: colors.gold }}>GHS {r.reg}</Text>  ·  Executive <Text style={{ color: colors.gold }}>GHS {r.exec}</Text></Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={() => book(r)}>
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  input: { margin: 16, marginTop: 8, backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15 },
  routeCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeName: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text, marginBottom: 4 },
  routePrices: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2 },
  bookBtn: { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  bookBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.bg },
});
