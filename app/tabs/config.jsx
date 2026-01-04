// Versão responsiva do seu arquivo Config.js
// Mantive toda sua lógica, só adicionei responsividade real usando Dimensions e porcentagens.
// Nada funcional foi alterado.

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from "../../src/Data/contextApi";
import { getItem } from "../../src/Data/storage";

const { width, height } = Dimensions.get("window");

export default function Config() {
 
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [edit, setEdit] = useState(false);
  const [nome , setNome] = useState();
  const [tsg, setTsg] = useState();
  const [dataNascimento, setDataNascimento] = useState();
  const [celular, setCelular] = useState(); 
  const [atribuicao, setAtribuicao] = useState();
  const [searchUser, setSearchUser] = useState('');

  const [usuarios, setusuarios] = useState([]);
  const [userId , setUserId] = useState(false);
  const [img , setImg] = useState(false);
  const [imgID, setImgID] = useState(false);
  const [cart, setCart] = useState(false); 
  const [loading, setLoading] = useState();

  const { setUserContext , userContext} = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getItem('user');
      if (!userData) return;

      const { emailInput , id } = JSON.parse(userData);
      console.log(id, ' carregando id usuario')

      const querySnapshot = await getDocs(collection(db,'users'));

      querySnapshot.forEach(async (docSnap)=> {
        const user = docSnap.data();
        if (user.email.toLowerCase() === emailInput.toLowerCase()) {
          setUserId(docSnap.id);
          setLoading(docSnap.id);
          setusuarios(user);
          setNome(user.name);
          setImgID(true);
          setDataNascimento(user.nascimento);
          setCelular(user.phone);
          setTsg(user.tsg);
          setAtribuicao(user.atribuicao);
          setSearchUser({emailInput: user.email});
          setUserContext(user);
        }
      });
    }
    fetchData();
  }, []);

  console.log(userId, ' ID do usuario no config');

  // funcao para escolher a imagem da galeria e fazer upload para o firebase storage

  const pickImage = async () => {
    if (!userId) return console.log("ID do usuário ainda não carregado!");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (result.canceled) return;

    const response = await fetch(result.assets[0].uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `perfilUsers/image:${userId}`);

    await uploadBytes(storageRef, blob);
    Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
    setImage(result.assets[0].uri);
    setUserId(true);
    setImg(true);
  };

// funcao para carregar a imagem do firebase storage
  useEffect(() => {
    async function fetchImage() {
      const storage = getStorage();
      const storageRef = ref(storage, `perfilUsers/image:${userId}`);

      try {
        const url = await getDownloadURL(storageRef);
        setImage(url);
        setImg(true);
        setImgID(true);
        
      } catch (error) {
        console.log('Nenhuma imagem de perfil encontrada.');
      }
    };
     if(userId) fetchImage();
    
  }, [userId]);


 // funcao pra navegar pra carteirinha
  function goCard() {
    router.push('/Card');
  }


 // funcao para editar os dados do usuario
  async function editar(){
    if (!edit) {
      setEdit(true);
    } else {
      const userData = await getItem('user');
      const { emailInput } = JSON.parse(userData);
      const querySnapshot = await getDocs(collection(db, 'users'));

      querySnapshot.forEach(async (snapshot) => {
        if (snapshot.data().email.toLowerCase() === emailInput.toLowerCase()) {
          await updateDoc(doc(db, 'users', snapshot.id), {
            name: nome,
            nascimento: dataNascimento,
            phone: celular,
            tsg: tsg,
            atribuicao: atribuicao
          });
        }
      });
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      setEdit(false);
    }
  }


  return (
    <ScrollView style={{ flex: 1 }}>
    <View style={styles.body}>

      <View style={styles.viewProfile}>
        <Text style={styles.nome}>{nome}</Text>

        <View style={{ width: "50%" }}>
          {img ? (
            <Image style={styles.foto} source={{ uri: image }} />
          ) : (
            <TouchableOpacity style={styles.foto} onPress={pickImage}>
              <MaterialIcons name="add-a-photo" size={40} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ width: "100%", alignItems: "center", justifyContent: "space-around", flexDirection: "row", marginTop: "2%" }}>
        <TouchableOpacity onPress={goCard} style={styles.btnCard}>
          <FontAwesome name="vcard" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={editar} style={!edit ? styles.btnEdit : styles.btnSalvar}>
          <Text style={{ color:'#fff', fontWeight:'bold' }}>{!edit ? 'Editar' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <Text>Nome</Text>
      <TextInput editable={edit} value={nome} onChangeText={setNome} style={styles.inputText} />

      <Text>Data Nascimento</Text>
      <MaskedTextInput mask='99/99/9999' keyboardType='numeric' value={dataNascimento} onChangeText={setDataNascimento} editable={edit} style={styles.inputText} />

      <Text>Celular</Text>
      <MaskedTextInput mask='(99) 99999-9999' keyboardType='numeric' value={celular} onChangeText={setCelular} editable={edit} style={styles.inputText} />

      <Text>Tipo Sanguineo</Text>
      <TextInput editable={edit} value={tsg} onChangeText={setTsg} style={styles.inputText} />

      <Text>Atribuição</Text>
      <TextInput editable={edit} value={atribuicao} onChangeText={setAtribuicao} style={styles.inputText} />

    </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  body: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    width:'100%'
  },

  inputText:{
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    fontSize: width * 0.04,
    width:'90%',
    color:'#000',
    backgroundColor:'#fff',
    borderRadius:10,
    paddingHorizontal: 10,
    marginTop:"1.5%"
  },

  foto:{
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.14,
    backgroundColor:'#fff',
    justifyContent:'center',
    alignItems:'center',
    borderColor:'#fff',
    borderWidth:1,
    marginRight: width * 0.05
  },

  nome:{
    fontSize: width * 0.05,
    fontWeight:'bold',
    padding:7,
    width:'81%',
    color:'#fff',
    shadowOpacity: 1,
    boxShadow: '0px 2px 0px #ffffffa6',
    elevation: 5,
    backgroundColor:'rgba(7, 7, 7, 1)',
    borderRadius:5
  },

  viewProfile:{
    width:"100%",
    height: height * 0.15,
    backgroundColor:"#000",
    justifyContent:'space-between',
    alignItems:"center",
    flexDirection:"row",
    paddingHorizontal: width * 0.05,
    marginBottom:10,
    marginTop:4,
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
    elevation:5
  },

  btnCard:{
    borderRadius:10,
    borderColor:'#fff',
    borderWidth:1,
    backgroundColor:'#3a3a3a',
    elevation:5,
    padding:10,
    width:'45%',
    alignItems:'center'
  },

  btnEdit:{
    padding:11,
    width:'45%',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    borderColor:'#fff',
    borderWidth:1,
    backgroundColor:'#3a3a3a',
    elevation:5,
  },

  btnSalvar:{
    padding:11,
    width:'45%',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    borderColor:'#fff',
    borderWidth:1,
    backgroundColor:'#2e2e2e',
    elevation:5,
  }
});
