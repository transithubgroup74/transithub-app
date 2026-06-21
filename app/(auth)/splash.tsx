import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import Svg, { Circle, Rect, Pattern, Defs } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const barWidth = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(barWidth, { toValue: 200, duration: 2000, useNativeDriver: false }),
    ]).start(() => {
      router.replace('/(auth)/welcome');
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(201,168,76,0.22)', 'rgba(13,31,53,0.5)', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.content, { opacity }]}>
        {/* Gold circle badge */}
        <LinearGradient
          colors={['#F5E090', '#D4A832', '#A07820']}
          style={styles.badge}
          start={{ x: 0.38, y: 0.32 }}
          end={{ x: 1, y: 1 }}
        >
          <Svg width={42} height={50} viewBox="0 0 42 50">
            <Rect x={0} y={0} width={42} height={50} rx={21} fill="none" />
            <Circle cx={21} cy={20} r={8.5} fill={colors.bg} stroke={colors.gold} strokeWidth={2.5} />
            <Circle cx={21} cy={20} r={4} fill={colors.gold} />
          </Svg>
          <Svg width={58} height={30} viewBox="0 0 58 30" style={{ marginTop: 4 }}>
            <Rect x={0} y={2} width={54} height={22} rx={5} fill={colors.bg} />
            <Rect x={3} y={5} width={11} height={9} rx={2} fill={colors.gold} opacity={0.45} />
            <Rect x={17} y={5} width={11} height={9} rx={2} fill={colors.gold} opacity={0.45} />
            <Rect x={31} y={5} width={11} height={9} rx={2} fill={colors.gold} opacity={0.45} />
            <Circle cx={12} cy={28} r={5.5} fill={colors.bg} />
            <Circle cx={12} cy={28} r={2.5} fill={colors.gold} opacity={0.5} />
            <Circle cx={42} cy={28} r={5.5} fill={colors.bg} />
            <Circle cx={42} cy={28} r={2.5} fill={colors.gold} opacity={0.5} />
          </Svg>
        </LinearGradient>

        <Text style={styles.title}>TransitHub</Text>
        <Text style={styles.tagline}>INTERCITY TICKETING SYSTEM</Text>

        {/* Loading bar */}
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  badge: {
    width: 168,
    height: 168,
    borderRadius: 84,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 40,
    elevation: 20,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 40,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 3.5,
    marginBottom: 52,
  },
  barBg: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(27,58,107,0.45)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.gray,
    marginTop: 10,
  },
});
