import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CITIES = [
  { n: 'Kumasi', r: 'Ashanti Region' }, { n: 'Accra', r: 'Greater Accra Region' },
  { n: 'Tamale', r: 'Northern Region' }, { n: 'Bolgatanga', r: 'Upper East Region' },
  { n: 'Takoradi', r: 'Western Region' }, { n: 'Cape Coast', r: 'Central Region' },
  { n: 'Sunyani', r: 'Bono Region' }, { n: 'Techiman', r: 'Bono East Region' },
  { n: 'WA', r: 'Upper West Region' }, { n: 'Navrongo', r: 'Upper East Region' },
  { n: 'Yendi', r: 'Northern Region' }, { n: 'Wenchi', r: 'Bono Region' },
];

export default function CityPicker() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'from' | 'to' }>();
  const [search, setSearch] = useState('');

  const filtered = CITIES.filter((c) => c.n.toLowerCase().includes(search.toLowerCase()));

  const select = async (city: string) => {
    await AsyncStorage.setItem(type === 'from' ? 'fromCity' : 'toCity', city);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{type === 'from' ? 'Select Origin' : 'Select Destination'}</Text>
          <View style={{ width: 28 }} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="🔍  Search cities..."
          placeholderTextColor={colors.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {filtered.map((c, i) => (
          <TouchableOpacity key={i} style={styles.cityRow} onPress={() => select(c.n)}>
            <Text style={styles.cityName}>{c.n}</Text>
            <Text style={styles.cityRegion}>{c.r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8 },
  cityRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(27,58,107,0.3)' },
  cityName: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text, marginBottom: 2 },
  cityRegion: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
});
