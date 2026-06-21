import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFS = [
  { icon: '✅', bg: 'rgba(0,201,167,0.15)', title: 'Booking Confirmed', msg: 'Seat 12 on Kumasi→Accra confirmed. Departs 06:00 AM on 25 May.', time: '2 min ago', read: false },
  { icon: '⏰', bg: 'rgba(201,168,76,0.15)', title: 'Departure Reminder', msg: 'Your bus to Accra departs in 1 hour. Head to the station now.', time: '1 hour ago', read: false },
  { icon: '❌', bg: 'rgba(255,71,87,0.15)', title: 'Payment Failed', msg: 'Your GHS 83.00 MoMo payment was not completed. Try again.', time: 'Yesterday', read: true },
  { icon: '⭐', bg: 'rgba(201,168,76,0.15)', title: 'Welcome to TransitHub!', msg: 'Book your first intercity ticket and travel in comfort across Ghana.', time: '3 days ago', read: true },
];

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity><Text style={styles.link}>Mark all read</Text></TouchableOpacity>
        </View>

        <Text style={styles.section}>TODAY</Text>
        {NOTIFS.filter((_, i) => i < 2).map((n, i) => (
          <View key={i} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: n.bg }]}><Text>{n.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nTitle}>{n.title}</Text>
              <Text style={styles.nMsg}>{n.msg}</Text>
              <Text style={styles.nTime}>{n.time}</Text>
            </View>
            {!n.read && <View style={styles.dot} />}
          </View>
        ))}

        <Text style={[styles.section, { marginTop: 12 }]}>EARLIER</Text>
        {NOTIFS.filter((_, i) => i >= 2).map((n, i) => (
          <View key={i} style={[styles.row, { opacity: 0.6 }]}>
            <View style={[styles.icon, { backgroundColor: n.bg }]}><Text>{n.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nTitle}>{n.title}</Text>
              <Text style={styles.nMsg}>{n.msg}</Text>
              <Text style={styles.nTime}>{n.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  section: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.gold, letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(27,58,107,0.3)' },
  icon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  nTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text, marginBottom: 2 },
  nMsg: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, lineHeight: 18 },
  nTime: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.text2, marginTop: 3 },
  dot: { width: 8, height: 8, backgroundColor: colors.gold, borderRadius: 4, marginTop: 4 },
});
