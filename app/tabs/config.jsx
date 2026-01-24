import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator // Adicionado para feedback visual
  ,

  Alert,
  Dimensions,
  Image,
  PixelRatio,
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

const { width, height } = Dimensions.get("window");

const scale = width / 375; 
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export default function Config() {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [edit, setEdit] = useState(false);
  const [nome, setNome] = useState();
  const [tsg, setTsg] = useState();
  const [dataNascimento, setDataNascimento] = useState();
  const [celular, setCelular] = useState();
  const [atribuicao, setAtribuicao] = useState();
  
  const [userId, setUserId] = useState(null);
  const [img, setImg] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false); // Novo estado para loading
  const { userContext } = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userContext?.id) return;

        const querySnapshot = doc(db, 'users', userContext.id);
        const dataSnapp = await getDoc(querySnapshot);
        
        if (dataSnapp.exists()) {
          const user = dataSnapp.data();
          setUserId(dataSnapp.id);
          setNome(user.name);
          setDataNascimento(user.birthDate);
          setCelular(user.phone);
          setTsg(user.tsg);
          setAtribuicao(user.atribuicao);
          
          if (user.profileImage) {
            setImage(user.profileImage);
            setImg(true);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    fetchData();
  }, [userContext.id]);

  const pickImage = async () => {
    if (!userId) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    try {
      setLoadingImg(true); // Inicia o carregamento visual

      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
      );

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `perfilUsers/${userId}.webp`);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      
      // PERSISTÊNCIA: Atualiza o Firestore imediatamente com a nova URL
      await updateDoc(doc(db, 'users', userId), {
        profileImage: url
      });

      setImage(url);
      setImg(true);
      
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao processar imagem.");
    } finally {
      setLoadingImg(false); // Para o carregamento
    }
  };

  async function editar() {
    if (!edit) {
      setEdit(true);
    } else {
      try {
        await updateDoc(doc(db, 'users', userId), {
          name: nome,
          birthDate: dataNascimento,
          phone: celular,
          tsg: tsg,
          atribuicao: atribuicao,
          profileImage: image 
        });
        
        Alert.alert('Sucesso', 'Perfil atualizado!');
        setEdit(false);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível salvar.');
      }
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eee' }} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <View style={styles.nameCard}>
          <Text style={styles.nameText}>{nome || 'Usuário'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.avatarWrapper} 
          onPress={pickImage} 
          disabled={loadingImg}
        >
          {loadingImg ? (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
               <ActivityIndicator size="small" color="#000" />
            </View>
          ) : img ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
               <MaterialIcons name="add-a-photo" size={normalize(30)} color="#000" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btnGray} onPress={() => router.push('/Card')}>
          <FontAwesome name="id-card" size={normalize(18)} color="#fff" />
          <Text style={styles.btnText}>Meus Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBlue} onPress={editar}>
          <MaterialIcons name={edit ? "save" : "edit"} size={normalize(18)} color="#fff" />
          <Text style={styles.btnText}>{edit ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Label text="Nome" />
        <Input icon="person" value={nome} editable={edit} onChangeText={setNome} />

        <Label text="Data Nascimento" />
        <Input icon="calendar-today" value={dataNascimento} editable={edit} mask="99/99/9999" onChangeText={setDataNascimento} />

        <Label text="Celular" />
        <Input icon="phone" value={celular} editable={edit} mask="(99) 99999-9999" onChangeText={setCelular} />

        <Label text="Tipo Sanguíneo" />
        <Input icon="opacity" value={tsg} editable={edit} onChangeText={setTsg} />

        <Label text="Atribuição" />
        <Input icon="label" value={atribuicao} editable={edit} onChangeText={setAtribuicao} />
      </View>
    </ScrollView>
  );
}

const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;

const Input = ({ icon, mask, ...props }) => (
  <View style={styles.inputCard}>
    <MaterialIcons name={icon} size={normalize(20)} color="#777" />
    {mask ? (
      <MaskedTextInput {...props} mask={mask} style={styles.input} />
    ) : (
      <TextInput {...props} style={styles.input} />
    )}
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: '#000', alignItems: 'center', paddingTop: 20, paddingBottom: 60, width: '100%' },
  nameCard: { width: '98%', alignItems: "center", marginBottom: 10 },
  nameText: { color: '#fff', fontSize: normalize(16) },
  avatarWrapper: {
    position: 'absolute',
    bottom: -45,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 3,
    elevation: 5,
  },
  avatar: { width: normalize(90), height: normalize(90), borderRadius: 45 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20 },
  btnGray: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#444', padding: 12, borderRadius: 10, width: '47%', justifyContent: 'center' },
  btnBlue: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#3b6cb7', padding: 12, borderRadius: 10, width: '47%', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  form: { paddingHorizontal: 20 },
  label: { marginTop: 15, marginBottom: 5, color: '#444', fontWeight: '600' },
  inputCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 45, elevation: 2 },
  input: { flex: 1, marginLeft: 10, color: '#333' }
});