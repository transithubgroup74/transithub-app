import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import Svg, { Circle, Path } from 'react-native-svg';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* U1 map-route logo */}
        <View style={styles.logoWrap}>
          <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* winding road */}
            <Path
              d="M24,96 Q72,90 54,60 Q42,40 82,30"
              fill="none"
              stroke={colors.navy}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <Path
              d="M24,96 Q72,90 54,60 Q42,40 82,30"
              fill="none"
              stroke={colors.gold}
              strokeWidth={2}
              strokeDasharray="4,7"
              strokeLinecap="round"
            />
            {/* start dot */}
            <Circle cx={24} cy={96} r={7} fill={colors.gold} />
            {/* destination pin */}
            <Path
              d="M82,18 Q98,18 98,34 Q98,47 82,64 Q66,47 66,34 Q66,18 82,18 Z"
              fill={colors.gold}
            />
            <Circle cx={82} cy={34} r={7} fill={colors.bg} />
          </Svg>
        </View>

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
  logoWrap: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
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
