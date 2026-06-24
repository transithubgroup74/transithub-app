import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import Svg, { Circle, Rect } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_R = 86;
const RING_C = 2 * Math.PI * RING_R;

export default function Splash() {
  const router = useRouter();

  const ringOffset = useRef(new Animated.Value(RING_C)).current;
  const markScale = useRef(new Animated.Value(0.4)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-120)).current;
  const brandY = useRef(new Animated.Value(16)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Ring draws itself
    Animated.timing(ringOffset, {
      toValue: 0,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Mark pops in
    Animated.parallel([
      Animated.timing(markOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(markScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
    ]).start();

    // Shimmer sweep across the gold
    Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(shimmerX, {
          toValue: 120,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, { toValue: -120, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Brand rises in
    Animated.parallel([
      Animated.timing(brandOpacity, { toValue: 1, duration: 500, delay: 1000, useNativeDriver: true }),
      Animated.timing(brandY, { toValue: 0, duration: 500, delay: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Pulsing rings loop
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    ).start();

    // Loading dots
    const dotLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.25, duration: 400, useNativeDriver: true }),
        ])
      );
    dotLoop(dot1, 0).start();
    dotLoop(dot2, 200).start();
    dotLoop(dot3, 400).start();

    const t = setTimeout(() => router.replace('/(auth)/welcome'), 3200);
    return () => clearTimeout(t);
  }, []);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(201,168,76,0.16)', 'rgba(13,31,53,0.5)', colors.bg]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.markWrap}>
          {/* pulsing rings */}
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
          />

          {/* drawing gold ring */}
          <Svg width={190} height={190} viewBox="0 0 190 190" style={StyleSheet.absoluteFill}>
            <AnimatedCircle
              cx={95}
              cy={95}
              r={RING_R}
              fill="none"
              stroke={colors.gold}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${RING_C}`}
              strokeDashoffset={ringOffset}
              rotation={-90}
              origin="95, 95"
            />
          </Svg>

          {/* gold mark with bus */}
          <Animated.View style={{ opacity: markOpacity, transform: [{ scale: markScale }] }}>
            <View style={styles.badge}>
              <Svg width={120} height={120} viewBox="0 0 120 120">
                <Circle cx={60} cy={48} r={9} fill={colors.bg} />
                <Rect x={32} y={58} width={56} height={30} rx={6} fill={colors.bg} />
                <Rect x={37} y={63} width={11} height={9} rx={2} fill={colors.gold} />
                <Rect x={50} y={63} width={11} height={9} rx={2} fill={colors.gold} />
                <Rect x={63} y={63} width={11} height={9} rx={2} fill={colors.gold} />
                <Rect x={77} y={68} width={6} height={9} rx={1} fill={colors.gold} />
                <Circle cx={44} cy={90} r={5} fill={colors.gold} />
                <Circle cx={76} cy={90} r={5} fill={colors.gold} />
              </Svg>

              {/* shimmer sweep */}
              <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { skewX: '-20deg' }] }]} />
            </View>
          </Animated.View>
        </View>

        {/* brand */}
        <Animated.View style={{ alignItems: 'center', opacity: brandOpacity, transform: [{ translateY: brandY }] }}>
          <Text style={styles.title}>TransitHub</Text>
          <Text style={styles.tagline}>INTERCITY TICKETING SYSTEM</Text>
        </Animated.View>

        {/* loading dots */}
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  markWrap: { width: 190, height: 190, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  pulseRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  badge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: -20,
    width: 30,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 36,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 3,
  },
  dots: { flexDirection: 'row', gap: 8, marginTop: 44 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
});
