import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAMES = ['Michael Mensah', 'Abena Osei', 'Kwame Asante', 'Ama Boateng'];

type ScanResult = { type: 'valid' | 'invalid' | 'scanned' | 'cancelled'; name?: string; seat?: number } | null;

export default function ConductorScan() {
  const router = useRouter();
  const [scanned, setScanned] = useState(0);
  const [result, setResult] = useState<ScanResult>(null);

  const simulate = (type: 'valid' | 'invalid' | 'scanned' | 'cancelled') => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const seat = Math.floor(Math.random() * 45) + 1;
    setResult({ type, name, seat });
    if (type === 'valid') setScanned((s) => s + 1);
  };

  const overlayBg = result?.type === 'valid' ? 'rgba(0,80,60,.96)' : result?.type === 'invalid' ? 'rgba(100,0,20,.96)' : result?.type === 'scanned' ? 'rgba(80,45,0,.96)' : 'rgba(80,0,0,.96)';
  const icon = result?.type === 'valid' ? '✅' : result?.type === 'invalid' ? '❌' : result?.type === 'scanned' ? '⚠️' : '⊘';
  const scanTitle = result?.type === 'valid' ? 'BOARDING APPROVED' : result?.type === 'invalid' ? 'INVALID TICKET' : result?.type === 'scanned' ? 'ALREADY SCANNED' : 'TICKET CANCELLED';
  const scanMsg = result?.type === 'invalid' ? 'This QR code is not recognised. Please check the passenger has a valid booking.' : result?.type === 'scanned' ? 'This ticket was already scanned at 05:45 AM. Contact station management.' : result?.type === 'cancelled' ? 'This ticket was cancelled by the passenger and is no longer valid.' : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>TransitHub</Text>
        <Text style={styles.mode}>Conductor Mode</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/welcome')}><Text style={styles.gear}>⚙</Text></TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Scan Passenger QR Code</Text>
        <Text style={styles.sub}>Point camera at passenger ticket</Text>

        <View style={styles.scanBox}>
          <Text style={styles.camIcon}>📷</Text>
          <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
          <View style={styles.scanLine} />
        </View>

        <View style={styles.schedCard}>
          <Text style={styles.schedLabel}>Today's Schedule</Text>
          <Text style={styles.schedRoute}>Kumasi → Accra</Text>
          <Text style={styles.schedTime}>06:00 AM · VIP Bus</Text>
          <Text style={styles.schedCount}>Scanned: <Text style={{ color: colors.text }}>{scanned}</Text></Text>
        </View>

        <Text style={styles.simLabel}>Simulate scan:</Text>
        <View style={styles.simGrid}>
          <TouchableOpacity style={[styles.simBtn, { backgroundColor: colors.green }]} onPress={() => simulate('valid')}><Text style={styles.simBtnText}>✓ Valid</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.simBtn, { backgroundColor: colors.red }]} onPress={() => simulate('invalid')}><Text style={styles.simBtnText}>✗ Invalid</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.simBtn, { backgroundColor: colors.orange }]} onPress={() => simulate('scanned')}><Text style={[styles.simBtnText, { color: colors.bg }]}>⚠ Scanned</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.simBtn, { backgroundColor: '#444' }]} onPress={() => simulate('cancelled')}><Text style={styles.simBtnText}>⊘ Cancelled</Text></TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
          <Text style={styles.overlayIcon}>{icon}</Text>
          <Text style={styles.overlayTitle}>{scanTitle}</Text>
          {result?.type === 'valid' && (
            <View style={styles.overlayCard}>
              <Text style={styles.overlayName}>{result.name}</Text>
              <Text style={styles.overlaySub}>Seat {result.seat} · Kumasi → Accra</Text>
            </View>
          )}
          {scanMsg ? <Text style={styles.overlayMsg}>{scanMsg}</Text> : null}
          <TouchableOpacity style={styles.overlayBtn} onPress={() => setResult(null)}>
            <Text style={styles.overlayBtnText}>Scan Next Passenger</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 12, paddingHorizontal: 16 },
  brand: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.gold },
  mode: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text },
  gear: { fontSize: 20, color: colors.text2 },
  body: { flex: 1, alignItems: 'center', padding: 24 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.text, marginBottom: 6 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginBottom: 20 },
  scanBox: { width: 160, height: 160, borderRadius: 12, backgroundColor: 'rgba(10,22,40,.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  camIcon: { fontSize: 40, opacity: 0.3 },
  corner: { position: 'absolute', width: 28, height: 28 },
  tl: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.gold, borderTopLeftRadius: 6 },
  tr: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.gold, borderTopRightRadius: 6 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.gold, borderBottomLeftRadius: 6 },
  br: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.gold, borderBottomRightRadius: 6 },
  scanLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: colors.gold, opacity: 0.6 },
  schedCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, width: '100%', alignItems: 'center', marginBottom: 16 },
  schedLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginBottom: 4 },
  schedRoute: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.text },
  schedTime: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold },
  schedCount: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginTop: 6 },
  simLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, marginBottom: 10 },
  simGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  simBtn: { flex: 1, minWidth: '45%', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  simBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#fff' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  overlayIcon: { fontSize: 72, marginBottom: 16 },
  overlayTitle: { fontFamily: 'Syne_700Bold', fontSize: 24, color: '#fff', marginBottom: 10 },
  overlayCard: { backgroundColor: 'rgba(255,255,255,.1)', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  overlayName: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#fff', marginBottom: 4 },
  overlaySub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,.7)' },
  overlayMsg: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,.85)', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  overlayBtn: { backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  overlayBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#fff' },
});
