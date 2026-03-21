import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from "../../src/Data/contextApi";

const { width } = Dimensions.get("window");
const scale = width / 375; 
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Config() {
  const router = useRouter();
  const { userContext } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [edit, setEdit] = useState(false);
  const [nome, setNome] = useState("");
  const [tsg, setTsg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [celular, setCelular] = useState("");
  const [atribuicao, setAtribuicao] = useState("");
  
  const [userId, setUserId] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userContext?.id) return;
      try {
        const docRef = doc(db, 'users', userContext.id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const user = snap.data();
          setUserId(snap.id);
          setNome(user.name || "");
          setDataNascimento(user.birthDate || "");
          setCelular(user.phone || "");
          setTsg(user.tsg || "");
          setAtribuicao(user.atribuicao || "");
          setImage(user.profileImage || null);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };
    fetchData();
  }, [userContext?.id]);

  const pickImage = async () => {
    if (!userId) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setLoadingImg(true);
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP }
      );

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `perfilUsers/${userId}.webp`);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'users', userId), { profileImage: url });
      setImage(url);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar imagem.");
    } finally {
      setLoadingImg(false);
    }
  };

  async function handleSave() {
    if (!edit) {
      setEdit(true);
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: nome,
        birthDate: dataNascimento,
        phone: celular,
        tsg: tsg,
        atribuicao: atribuicao,
      });
      Alert.alert('Perfil Atualizado', 'Suas informações foram salvas com sucesso.');
      setEdit(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={pickImage} 
            disabled={loadingImg}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="add-a-photo" size={30} color="#0072B1" />
              </View>
            )}
            {loadingImg && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cardBtn} onPress={() => router.push('/Card')}>
              <FontAwesome name="id-card" size={16} color="#444" />
              <Text style={styles.cardBtnText}>Ver Carteirinha</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveBtn, edit ? styles.saveBtnActive : {}]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name={edit ? "check" : "edit"} size={18} color="#FFF" />
                  <Text style={styles.saveBtnText}>{edit ? 'Concluir' : 'Editar'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <CustomInput label="Nome Completo" icon="person" value={nome} editable={edit} onChangeText={setNome} />
            <CustomInput label="Data de Nascimento" icon="cake" value={dataNascimento} editable={edit} mask="99/99/9999" onChangeText={setDataNascimento} keyboardType="numeric" />
            <CustomInput label="Celular" icon="phone" value={celular} editable={edit} mask="(99) 99999-9999" onChangeText={setCelular} keyboardType="numeric" />
            
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput label="Tipo Sanguíneo" icon="opacity" value={tsg} editable={edit} onChangeText={setTsg} />
              </View>
              <View style={{ width: 15 }} />
              <View style={{ flex: 2 }}>
                <CustomInput label="Atribuição" icon="work" value={atribuicao} editable={edit} onChangeText={setAtribuicao} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CustomInput = ({ label, icon, mask, editable, ...props }) => (
  <View style={[styles.inputGroup, !editable && styles.inputDisabled]}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialIcons name={icon} size={20} color={editable ? "#0072B1" : "#999"} />
      {mask ? (
        <MaskedTextInput {...props} mask={mask} editable={editable} style={styles.input} />
      ) : (
        <TextInput {...props} editable={editable} style={styles.input} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { backgroundColor: '#0072B1', height: 160, alignItems: 'center', paddingTop: 40 },
  headerTitle: { color: '#FFF', fontSize: normalize(18), fontWeight: 'bold' },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    padding: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: { flex: 1, borderRadius: 50, backgroundColor: '#F1F3F5', justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  content: { marginTop: 60, paddingHorizontal: 20 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  cardBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' },
  cardBtnText: { color: '#444', fontWeight: 'bold', fontSize: normalize(13) },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, backgroundColor: '#666' },
  saveBtnActive: { backgroundColor: '#0072B1' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: normalize(13) },
  form: { gap: 15 },
  inputGroup: { marginBottom: 5 },
  inputDisabled: { opacity: 0.7 },
  label: { fontSize: normalize(11), fontWeight: 'bold', color: '#888', marginBottom: 8, textTransform: 'uppercase', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, marginLeft: 10, fontSize: normalize(14), color: '#333', fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-end' }
});