import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const API = 'https://transithub-backend-production.up.railway.app';

type ScanResult = {
  type: 'valid' | 'invalid' | 'scanned' | 'cancelled' | 'error';
  name?: string;
  seat?: number;
  route?: string;
  message?: string;
} | null;

export default function ConductorScan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(0);
  const processingRef = useRef(false);

  const handleQRScan = async ({ data }: { data: string }) => {
    if (processingRef.current || loading) return;
    processingRef.current = true;
    setLoading(true);

    try {
      // QR format: TRANSITHUB|{bookingId}|{from}|{to}|{date}|{dep}|SEAT:{seat}|{code}
      const parts = data.split('|');
      if (parts[0] !== 'TRANSITHUB' || parts.length < 2) {
        setResult({ type: 'invalid', message: 'This QR code is not a valid TransitHub ticket.' });
        return;
      }

      // Extract booking ref (THB-XXXXXXXX) from the code field or parse booking ID
      const code = parts[7] || '';
      const bookingRef = parts[1]; // This is the display ID like THB06954120

      // First verify the booking exists via the ref code in our system
      // We search by the QR code value
      const verifyRes = await fetch(`${API}/api/bookings/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: data }),
      });

      if (!verifyRes.ok) {
        // Fall back to showing valid for demo if backend doesn't have verify-qr yet
        setResult({ type: 'invalid', message: 'Ticket not found in system.' });
        return;
      }

      const booking = await verifyRes.json();

      if (booking.status === 'cancelled') {
        setResult({ type: 'cancelled', name: booking.passenger, seat: booking.seat, route: booking.route });
        return;
      }

      if (booking.status === 'completed') {
        setResult({ type: 'scanned', name: booking.passenger, seat: booking.seat, route: booking.route });
        return;
      }

      // Mark as completed
      const completeRes = await fetch(`${API}/api/bookings/${booking.id}/complete`, {
        method: 'POST',
      });

      if (completeRes.ok) {
        const completed = await completeRes.json();
        setScanned(s => s + 1);
        setResult({ type: 'valid', name: completed.passenger, seat: completed.seat, route: completed.route });
      } else {
        const err = await completeRes.json();
        setResult({ type: 'error', message: err.error || 'Failed to mark ticket as complete.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setResult(null);
    processingRef.current = false;
  };

  const overlayBg = result?.type === 'valid' ? 'rgba(0,80,60,.96)' : result?.type === 'invalid' || result?.type === 'error' ? 'rgba(100,0,20,.96)' : result?.type === 'scanned' ? 'rgba(80,45,0,.96)' : 'rgba(80,0,0,.96)';
  const icon = result?.type === 'valid' ? '✅' : result?.type === 'invalid' || result?.type === 'error' ? '❌' : result?.type === 'scanned' ? '⚠️' : '⊘';
  const scanTitle = result?.type === 'valid' ? 'BOARDING APPROVED' : result?.type === 'invalid' ? 'INVALID TICKET' : result?.type === 'scanned' ? 'ALREADY SCANNED' : result?.type === 'error' ? 'ERROR' : 'TICKET CANCELLED';

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionSub}>The camera is needed to scan passenger QR codes.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {loading ? (
            <ActivityIndicator color={colors.gold} size="large" />
          ) : (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={result ? undefined : handleQRScan}
            />
          )}
          <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
          <View style={styles.scanLine} />
        </View>

        <View style={styles.schedCard}>
          <Text style={styles.schedLabel}>Session</Text>
          <Text style={styles.schedCount}>Passengers Boarded: <Text style={{ color: colors.text }}>{scanned}</Text></Text>
        </View>
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
          <Text style={styles.overlayIcon}>{icon}</Text>
          <Text style={styles.overlayTitle}>{scanTitle}</Text>
          {result?.type === 'valid' && (
            <View style={styles.overlayCard}>
              <Text style={styles.overlayName}>{result.name}</Text>
              <Text style={styles.overlaySub}>Seat {result.seat} · {result.route}</Text>
            </View>
          )}
          {(result?.type === 'scanned' || result?.type === 'cancelled') && (
            <View style={styles.overlayCard}>
              <Text style={styles.overlayName}>{result.name}</Text>
              <Text style={styles.overlaySub}>Seat {result.seat} · {result.route}</Text>
            </View>
          )}
          {(result?.type === 'invalid' || result?.type === 'error' || result?.type === 'scanned' || result?.type === 'cancelled') && (
            <Text style={styles.overlayMsg}>
              {result?.message ||
                (result?.type === 'scanned' ? 'This ticket was already scanned. Contact station management.' :
                 result?.type === 'cancelled' ? 'This ticket was cancelled and is no longer valid.' : '')}
            </Text>
          )}
          <TouchableOpacity style={styles.overlayBtn} onPress={dismiss}>
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
  scanBox: { width: 240, height: 240, borderRadius: 12, backgroundColor: 'rgba(10,22,40,.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 28, height: 28, zIndex: 10 },
  tl: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.gold, borderTopLeftRadius: 6 },
  tr: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.gold, borderTopRightRadius: 6 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.gold, borderBottomLeftRadius: 6 },
  br: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.gold, borderBottomRightRadius: 6 },
  scanLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: colors.gold, opacity: 0.6, zIndex: 10 },
  schedCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, width: '100%', alignItems: 'center', marginBottom: 16 },
  schedLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginBottom: 4 },
  schedCount: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2, marginTop: 6 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  permissionTitle: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text, marginBottom: 8 },
  permissionSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.text2, textAlign: 'center', marginBottom: 24 },
  permissionBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  permissionBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.bg },
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
