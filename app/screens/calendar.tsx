import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const isPast = (d: number) => {
    const date = new Date(year, month, d);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const confirmDate = async () => {
    if (!selected) return;
    const dateStr = `${MONTHS[month]} ${selected}, ${year}`;
    await AsyncStorage.setItem('selectedDate', dateStr);
    router.back();
  };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Select Date</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={prevMonth}><Text style={styles.navArrow}>‹</Text></TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth}><Text style={styles.navArrow}>›</Text></TouchableOpacity>
        </View>

        <View style={styles.dayRow}>
          {DAYS.map((d) => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
        </View>

        {Array.from({ length: cells.length / 7 }, (_, w) => (
          <View key={w} style={styles.week}>
            {cells.slice(w * 7, w * 7 + 7).map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cell, d && selected === d && styles.cellSelected, d && isPast(d) && { opacity: 0.25 }]}
                onPress={() => d && !isPast(d) && setSelected(d)}
                disabled={!d || isPast(d)}
              >
                <Text style={[styles.cellText, d && selected === d && styles.cellTextSelected]}>
                  {d ?? ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[styles.btnGold, !selected && { opacity: 0.4 }]} disabled={!selected} onPress={confirmDate}>
          <Text style={styles.btnGoldText}>{selected ? `Confirm ${MONTHS[month]} ${selected}` : 'Select a Date'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navArrow: { fontSize: 28, color: colors.gold, paddingHorizontal: 8 },
  monthLabel: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  dayRow: { flexDirection: 'row', marginBottom: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.text2 },
  week: { flexDirection: 'row', marginBottom: 4 },
  cell: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  cellSelected: { backgroundColor: colors.gold },
  cellText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text },
  cellTextSelected: { color: colors.bg, fontFamily: 'DMSans_500Medium' },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
});
