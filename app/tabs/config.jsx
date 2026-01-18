import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import {
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

// Função auxiliar para escalar fontes e tamanhos proporcionalmente
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
  const [searchUser, setSearchUser] = useState('');

  const [usuarios, setusuarios] = useState([]);
  const [userId, setUserId] = useState(false);
  const [img, setImg] = useState(false);
  const [imgID, setImgID] = useState(false);
  const [cart, setCart] = useState(false);
  const [loading, setLoading] = useState();

  const { setUserContext, userContext } = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = doc(db, 'users', userContext.id);
      const dataSnapp = await getDoc(querySnapshot);
      if (!dataSnapp.exists()) return;

      const user = dataSnapp.data();
      setUserId(dataSnapp.id);
      setNome(user.name);
      setDataNascimento(user.birthDate);
      setCelular(user.phone);
      setTsg(user.tsg);
      setAtribuicao(user.atribuicao);
    }
    fetchData();
  }, [userContext.id]);

  const pickImage = async () => {
    if (!userId) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.canceled) return;

    const response = await fetch(result.assets[0].uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `perfilUsers/image:${userId}`);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    setImage(url);
    setImg(true);
  };

  useEffect(() => {
    async function fetchImage() {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `perfilUsers/image:${userId}`);
        const url = await getDownloadURL(storageRef);
        setImage(url);
        setImg(true);
      } catch { }
    }
    if (userId) fetchImage();
  }, [userId]);

  function goCard() {
    router.push('/Card');
  }

  async function editar() {
    if (!edit) {
      setEdit(true);
    } else {
      await updateDoc(doc(db, 'users', userId), {
        name: nome,
        birthDate: dataNascimento,
        phone: celular,
        tsg: tsg,
        atribuicao: atribuicao
      });
      Alert.alert('Sucesso', 'Dados atualizados!');
      setEdit(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eee' }} contentContainerStyle={{ paddingBottom: 30 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.nameCard}>
          <Text style={styles.nameText}>{nome}</Text>
        </View>

        <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
          {img ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <MaterialIcons name="add-a-photo" size={normalize(30)} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      {/* BOTÕES */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btnGray} onPress={goCard}>
          <FontAwesome name="id-card" size={normalize(18)} color="#fff" />
          <Text style={styles.btnText}>Meus Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBlue} onPress={editar}>
          <MaterialIcons name="edit" size={normalize(18)} color="#fff" />
          <Text style={styles.btnText}>{edit ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÁRIO */}
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

/* COMPONENTES AUXILIARES (VISUAL) */
const Label = ({ text }) => (
  <Text style={styles.label}>{text}</Text>
);

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
  header: {
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: height * 0.02,
    paddingBottom: height * 0.08, 
    width: '100%',
    marginTop:height * 0.001
    }
    ,
  nameCard: {
    borderRadius: 10,
    width: '98%',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.01,
    marginTop: height * 0.01,
  },
  nameText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '400'
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -normalize(45), // Metade da altura do avatar para ficar centralizado na linha do header
    backgroundColor: '#fff',
    borderRadius: normalize(50),
    padding: 3,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatar: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45)
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(50), // Compensa o avatar que está por cima
    paddingHorizontal: width * 0.05,
  },
  btnGray: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#444',
    paddingVertical: normalize(12),
    borderRadius: 10,
    width: '47%',
    justifyContent: 'center'
  },
  btnBlue: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#3b6cb7',
    paddingVertical: normalize(12),
    borderRadius: 10,
    width: '47%',
    justifyContent: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(14)
  },
  form: {
    paddingHorizontal: width * 0.05,
  },
  label: {
    textAlign: 'left', // Alinhado à esquerda costuma ser melhor para mobile, mas mantive a estrutura
    paddingLeft: 5,
    marginTop: normalize(15),
    marginBottom: 5,
    color: '#444',
    fontSize: normalize(14),
    fontWeight: '600'
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: normalize(45), // Altura fixa normalizada para inputs
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: normalize(15),
    color: '#333',
    height: '100%'
  }
});