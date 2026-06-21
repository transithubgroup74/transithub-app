import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Failed() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.icon}>❌</Text>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.sub}>Your payment was not completed. Please check your balance and try again.</Text>
        <TouchableOpacity style={styles.btnGold} onPress={() => router.back()}>
          <Text style={styles.btnGoldText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.btnOutlineText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  center: { alignItems: 'center', padding: 32 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 20, color: colors.text, marginBottom: 10 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.text2, textAlign: 'center', marginBottom: 32 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, alignItems: 'center', marginBottom: 12, width: '100%' },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  btnOutline: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%' },
  btnOutlineText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.gold },
});
