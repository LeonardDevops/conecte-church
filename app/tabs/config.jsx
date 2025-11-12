import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { AppContext } from "../Data/contextApi";
import { db } from "../Data/FirebaseConfig";
import { getItem } from "../Data/storage";

export default function Config() {
 
const router = useRouter();
const [image, setImage] = useState(null);

const[edit, setEdit] = useState(false);
const[nome , setNome] = useState();
const[tsg, setTsg] = useState();
const[dataNascimento, setDataNascimento] = useState();
const[celular, setCelular] = useState(); 
const[atribuicao, setAtribuicao] = useState();
const[searchUser, setSearchUser] = useState('');

const[usuarios, setusuarios] = useState([]);
const [userId , setUserId] = useState(false);
const [img , setImg] = useState(false);
const [cart, setCart] = useState(false); 
const [loading, setLoading] = useState();


 
  const { setUserContext } = useContext(AppContext);

  useEffect(() => {
   
    const fetchData = async () => {
      
      const userData = await getItem('user'); // ta buscando os dados do usuário salvo no armazenamento local

      if (!userData)  return; // Verifica se userData é nulo ou indefinido se for falso, sai da função

      const { emailInput , id } = JSON.parse(userData); // extrai o email do objeto armazenado desestruturando-o
      console.log(id, ' carregando id usuario')
       
      
     const querySnapshot =  await getDocs(collection(db,'usuarios')); // busca todos os documentos na coleção 'usuarios' do Firestore
      
      querySnapshot.forEach(async (docSnap)=> { // itera sobre cada documento retornado na consulta.

        const user =  docSnap.data();
        
        if (user.email.toLocaleLowerCase() === emailInput.toLocaleLowerCase()) { // compara o email do documento com o email extraído do armazenamento local se fpr igual, atualiza os estados com os dados do usuário
          setUserId(docSnap.id);
          setLoading(docSnap.id);
          setusuarios(user);
          setNome(user.nome);
          setDataNascimento(user.dataNascimento);
          setCelular(user.celular);
          setTsg(user.tsg);
          setAtribuicao(user.atribuicao);
          setSearchUser({emailInput: user.email});
          
          
  
          setUserContext(user);
        }
        
          });
        
      }
         
    fetchData();
  }, [edit, userId]);
 
  
  const pickImage = async () => {
    if (!userId) {
    console.log("ID do usuário ainda não carregado!");
    return;
  }
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,

    })

    if(result.canceled) return


    if (!result.canceled) {
    const response = await fetch(result.assets[0].uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `perfilUsers/image:${userId}`);

    

    await uploadBytes(storageRef, blob);
    console.log('Imagem carregada com sucesso!');
    Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
    setImage(result.assets[0].uri);
    setUserId(true);
    }
  };


  

  useEffect(() => {
    const loadImage = async () => {
      if (`perfilUsers/image:${userId}` !== `perfilUsers/image:${loading}`) {
        return;
      } else {
        const storage = getStorage();
        const storageRef = ref(storage, `perfilUsers/image:${userId}`);   

        try {

          const url = await getDownloadURL(storageRef);
          setImage(url);
          setImg(true);
          
        } catch (error) {
          console.log('Nenhuma imagem de perfil encontrada para este usuário.');
        }
      }
    };

    loadImage();
  }, [userId]);




  

function goCard() {
    router.push('/Card');
    
  }
 


  async function editar(){
    if (!edit) { 
      setEdit(true);

      
      console.log(edit)
    } else{
      const userData = await getItem('user');
      const { emailInput } = JSON.parse(userData);
      const querySnapshot = await getDocs(collection(db, 'usuarios'));

        querySnapshot.forEach(async (snapshot) => {
        if (snapshot.data().email.toLocaleLowerCase() === emailInput.toLocaleLowerCase()) {
        await updateDoc(doc(db, 'usuarios', snapshot.id), {
          nome,
          dataNascimento,
          celular,
          tsg,
          atribuicao
        });
        console.log('Dados atualizados com sucesso!');
        console.log(dataNascimento);
      }
    });

    setEdit(false);
    }

  }

  return (


        

        <View style={styles.body}> 
        
         <View style={styles.viewProfile}>

          <Text style={styles.nome}>{nome}</Text>
          <View style={{width:"50%"}}>
          {img ?
            <Image style={styles.foto} source={{uri: image}}/>
            :<TouchableOpacity style={styles.foto} onPress={pickImage}>
          <MaterialIcons name="add-a-photo"size={40} color="#000000ff" style={{width:42, height:45}} />
          </TouchableOpacity>
          }

          </View> 
          
          </View>
            
            <View style={{width:"100%", alignItems:"center", justifyContent:"space-around", flexDirection:"row", marginTop:"2%"}}>

              <TouchableOpacity 
                onPress={goCard}
                style={{ 
                borderRadius:10,
                 borderColor:'#ffffffff',
                 borderWidth:1,
                 backgroundColor:'#3a3a3aff',
                 elevation:5,
                 padding:10,
                 width:'45%',
                 alignItems:'center'
                }}>
              <FontAwesome name="vcard" size={20} color="#fff" />
              </TouchableOpacity>

             <TouchableOpacity 
             
             onPress={editar}
             style={
               !edit ? {
                 padding:11,
                 width:'45%',
                 justifyContent:'center',
                 alignItems:'center',
                 borderRadius:10,
                 borderColor:'#ffffffff',
                 borderWidth:1,
                 backgroundColor:'#3a3a3aff',
                 elevation:5,
                 
                }
                :{
                  padding:11,
                  width:'45%',
                  justifyContent:'center',
                  alignItems:'center',
                  borderRadius:10,
                  borderColor:'#ffffffff',
                  borderWidth:1,
                  backgroundColor:'#3a3a3aee',
                  elevation:5,}}>

              <Text style={{color:'#ffffffff',fontWeight:'bold'}}>{!edit ? 'Editar':' Salvar'}</Text>

               </TouchableOpacity>
              </View>
         
          <Text>Nome</Text>
          <TextInput
          onChangeText={(text) => setNome(text)}
          editable={edit}
          value={nome}
          style={styles.inputText} />

          <Text>Data Nascimento</Text>
          <MaskedTextInput
           mask='99/99/9999' 
           keyboardType='numeric'
           onChangeText={(text) => setDataNascimento(text)}
           value={dataNascimento}
           textContentType='birthdate'
           editable={edit}
           
           style={styles.inputText} />

          <Text>Celular</Text>
          <MaskedTextInput
           mask='(99) 99999-9999' 
           keyboardType='numeric'
           value={celular}
           onChangeText={(text) => setCelular(text)}
           style={styles.inputText} editable={edit} />

          <Text>Tipo Sanguineo</Text>
          <TextInput
          value={tsg}
          onChangeText={(text) => setTsg(text)}
          style={styles.inputText} editable={edit} />
          
          <Text>Atribuição</Text>
          <TextInput
          value={atribuicao}
          onChangeText={(text) => setAtribuicao(text)}
          style={styles.inputText} editable={edit} />

   
          
           </View>
        
      
         
  );
}




const styles = StyleSheet.create({
  inputText:{
          height: 50,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          fontSize:15,
          width:'88%',
          color:'#000',
          backgroundColor:'#fff',
          borderRadius:10,
          paddingHorizontal: 10,
          marginTop:"2%"
  },
  body:{
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
    height:'auto',
    zIndex:0,
  },
  foto:{
    width:90,
    height:90,
    borderRadius:75,
    backgroundColor:'#ffffffff',
    justifyContent:'center',
    alignItems:'center',
    marginLeft:"-10%",
    flexDirection:'row',
    objectFit:"cover",
    borderColor:"#fff",
    borderWidth:1
    
  },
  nome:{
    fontSize:20,
    fontWeight:'bold',
    padding:8,
    width:'80%',
    color:'#ffffffff'
  },
  editPerfil:{
    padding:12,
    borderRadius:10,
    marginBottom:10,
    color:'#fff',

  },
  viewProfile:{
    width:"99.5%",
    height:"18%",
    backgroundColor:"#000",
    marginTop:"-5%",
    justifyContent:'space-between',
    alignItems:"center",
    flexDirection:"row",
    borderRadius:10
  }
})