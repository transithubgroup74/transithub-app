import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getNotifications, markAllRead, formatTime, syncServerAlerts, AppNotification } from '../../utils/notifications';

export default function Notifications() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  useFocusEffect(useCallback(() => {
    // Show what we have instantly, then pull any new dashboard alerts.
    getNotifications().then(setNotifs);
    syncServerAlerts().then(() => getNotifications().then(setNotifs));
  }, []));

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const today = notifs.filter((n) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  });
  const earlier = notifs.filter((n) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff >= 24 * 60 * 60 * 1000;
  });

  const renderItem = (n: AppNotification, i: number) => (
    <View key={n.id || i} style={[styles.row, n.read && { opacity: 0.6 }]}>
      <View style={[styles.icon, { backgroundColor: n.bg }]}><Text>{n.icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.nTitle}>{n.title}</Text>
        <Text style={styles.nMsg}>{n.msg}</Text>
        <Text style={styles.nTime}>{formatTime(n.createdAt)}</Text>
      </View>
      {!n.read && <View style={styles.dot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          {notifs.some((n) => !n.read) && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.link}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <Text style={styles.section}>TODAY</Text>
                {today.map(renderItem)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <Text style={[styles.section, { marginTop: 12 }]}>EARLIER</Text>
                {earlier.map(renderItem)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text2 },
});
