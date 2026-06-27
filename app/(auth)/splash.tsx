import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const BG = '#131e2a';

export default function Splash() {
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;     // fade in
  const breathe = useRef(new Animated.Value(0)).current;     // continuous gentle pulse
  const glow = useRef(new Animated.Value(0)).current;        // glow behind logo
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Fade the logo in
    Animated.timing(opacity, { toValue: 1, duration: 650, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

    // Continuous "breathing" scale — always visible motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Soft glow pulsing behind the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
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

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.05] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.32] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  return (
    <View style={styles.container}>
      {/* pulsing glow behind the logo */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      <Animated.Image
        source={require('../../assets/splash-logo.png')}
        resizeMode="contain"
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
      />

      <View style={styles.dots}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#C9A84C' },
  logo: { width: '90%', height: '62%' },
  dots: { flexDirection: 'row', gap: 8, position: 'absolute', bottom: 70 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#C9A84C' },
});
