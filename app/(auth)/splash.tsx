import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const BG = '#131e2a';

export default function Splash() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Logo fades + gently scales in
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

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

    const t = setTimeout(() => router.replace('/(auth)/welcome'), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/splash-logo.png')}
        resizeMode="contain"
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
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
  logo: { width: '88%', height: '60%' },
  dots: { flexDirection: 'row', gap: 8, position: 'absolute', bottom: 70 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C9A84C' },
});
