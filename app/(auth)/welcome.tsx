import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import Svg, { Circle } from 'react-native-svg';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Mini gold badge */}
        <LinearGradient
          colors={['#F5E090', '#D4A832', '#A07820']}
          style={styles.badge}
          start={{ x: 0.38, y: 0.32 }}
          end={{ x: 1, y: 1 }}
        >
          <Svg width={22} height={26} viewBox="0 0 42 50">
            <Circle cx={21} cy={20} r={8.5} fill={colors.bg} stroke={colors.gold} strokeWidth={2.5} />
            <Circle cx={21} cy={20} r={4} fill={colors.gold} />
          </Svg>
        </LinearGradient>

        <Text style={styles.title}>Travel Across Ghana</Text>
        <Text style={styles.subtitle}>
          Book intercity bus tickets anytime, anywhere. Safe, comfortable and affordable.
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>🕐  24/7 Booking Available</Text>
        </View>

        <TouchableOpacity style={styles.btnGold} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.btnGoldText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.btnOutlineText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 24,
  },
  inner: { alignItems: 'center' },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,31,53,0.9)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  pillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.gold,
  },
  btnGold: {
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnGoldText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.bg,
  },
  btnOutline: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.gold,
  },
});
