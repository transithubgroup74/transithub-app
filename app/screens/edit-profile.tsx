import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(['userName', 'userEmail', 'userPhone', 'userDob', 'userPhoto']).then((res) => {
      if (res[0][1]) setName(res[0][1]);
      if (res[1][1]) setEmail(res[1][1]);
      if (res[2][1]) setPhone(res[2][1]);
      if (res[3][1]) setDob(res[3][1]);
      if (res[4][1]) setPhoto(res[4][1]);
    });
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const save = async () => {
    const entries: [string, string][] = [
      ['userName', name],
      ['userEmail', email],
      ['userPhone', phone],
      ['userDob', dob],
    ];
    if (photo) entries.push(['userPhoto', photo]);
    await AsyncStorage.multiSet(entries);
    router.back();
  };

  const initials = name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || 'ME';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={save}><Text style={styles.saveLink}>Save</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.avatarBox} onPress={pickPhoto}>
          <View style={styles.avatar}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            <View style={styles.cameraBtn}><Text>📷</Text></View>
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.gray} value={name} onChangeText={setName} />
        <View style={{ position: 'relative' }}>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.gray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Verified</Text></View>
        </View>
        <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={colors.gray} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Date of Birth (e.g. 01 Jan 2000)" placeholderTextColor={colors.gray} value={dob} onChangeText={setDob} />

        <TouchableOpacity style={styles.btnGold} onPress={save}>
          <Text style={styles.btnGoldText}>Save Changes</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Changes reflect across the app immediately</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  back: { fontSize: 22, color: colors.gold, padding: 4 },
  title: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.text },
  saveLink: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.gold },
  avatarBox: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, backgroundColor: colors.navy, borderRadius: 36, justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 8, overflow: 'hidden' },
  avatarImg: { width: 72, height: 72, borderRadius: 36 },
  avatarText: { fontFamily: 'DMSans_500Medium', fontSize: 24, color: colors.gold },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, backgroundColor: colors.gold, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  changePhoto: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.gold },
  input: { backgroundColor: colors.field, borderWidth: 1, borderColor: colors.fborder, borderRadius: 12, padding: 12, color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 15, marginBottom: 8 },
  verifiedBadge: { position: 'absolute', right: 12, top: 12, backgroundColor: 'rgba(0,201,167,.15)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.green },
  btnGold: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  btnGoldText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: colors.bg },
  hint: { textAlign: 'center', fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.text2 },
});
