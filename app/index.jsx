import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppProvider } from "./Data/contextApi";
import { db } from "./Data/FirebaseConfig";
import { setItem } from "./Data/storage";


export default function Login() {
  
  

  const [selectedValue, setSelectedValue] = useState("Matriz");
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [user , setUser] = useState();
  const [ searchUser, setSearchUser] = useState(false);
  
  const router = useRouter()
  

  
    function seachUSer(params) {
      setSearchUser(true);
      console.log('buscando usuario ...');
      setSearchUser(false);
    }
    
 
     
async function handleLogin() {

        try {
          
          const dataUser = await getDocs(collection(db,'usuarios'));
          dataUser.forEach((data)=> {

            if(String(data.data().email) === emailInput.toLocaleLowerCase() && String( data.data().senha) === String(passwordInput.toLocaleLowerCase()) ) {
              setUser(data.data());
              console.log('usuario logado com sucesso');

              const userData = {emailInput, passwordInput , id: data.id};

              setItem('user', JSON.stringify(userData)).then(() => {

                console.log('Dados do usuário salvos com sucesso!', userData);
                

               

              }).catch((error) => {

                console.log('Erro ao salvar os dados do usuário:', error);
              });
              
              console.log(data.id);
              router.push("/tabs/home");

            } else {
              console.log('usuario ou senha incorretos');
            }

          })
        } catch (error) {
          console.log("erro de  login")
        }
          
          
   
      
       
     }


 useEffect(()=> {
    
      console.log('componente montado')
   

 }, [handleLogin]);


  


  return (
    
  <AppProvider>

    <View style={style.body}>
      <Image
      style={style.logo}
      source={require("./img/meta.webp")} />
      
      <Text style={style.text}>Ministério Evangelistico Tálamo</Text>
      <Entypo style={style.iconemail} name="email" size={24} color="black" />
      <TextInput
      onChangeText={(e)=> setEmailInput(e)}
      style={style.input} />
      <FontAwesome5 style={style.lock} name="lock" size={24} color="black" />
      <TextInput
      secureTextEntry
        onChangeText={(e)=> setPasswordInput(e)}
      style={style.input} />

      <View style={style.containerLogin}>
            <TouchableOpacity onPress={handleLogin}>
            <View style={style.backcolorLogin}>
              <MaterialIcons style={{marginLeft:15, marginBottom:-6}} name="vpn-key" size={40} color="white" />
              <Text style={style.textLogin}>Acessar</Text>
            </View>   
            </TouchableOpacity>
        <View style={style.backcolorfilial}>
      
        <Picker
        selectedValue={selectedValue}
        style={{ height: 50, width: '95%', 
          fontFamily:'sans-serif',
          color:'#000',
          shadowColor:'#FFF',
          fontWeight:'bold', 
          fontSize:17,
          borderRadius:4,
          justifyContent:'center',
          alignItems:'center',
          textAlign:'center',
          backgroundColor:'#fff',
          
          
        }}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
      
        <Picker.Item  label="Matriz" value="1" />
        <Picker.Item label="Palmares" value="2" />
        <Picker.Item label="Sepetiba" value="3" />
        
      </Picker>
      </View>   
      </View>
        <Text style={{marginTop:-40, marginBottom:30, color:'#000000ff', fontWeight:'bold'}}>Não Possui cadastro?</Text>
        <TouchableOpacity style={{justifyContent:'center',
          marginTop:-20, 
          padding:7, 
            marginBottom:30 ,
            alignItems:'center', 
            width:'40%',
           borderRadius:4, 
           backgroundColor:'rgba(0, 0, 0, 1)'}}>
        <Link style={{color:'#ffffff', fontSize:17, borderRadius:4 , width:'100%', textAlign:'center'}} href={"/Cadastro"} >🙋🏻Cadastro</Link>
        </TouchableOpacity>


      <View style={style.botom}>
        <Text style={{color:"#fff", fontStyle:'italic', fontWeight:'bold ', marginBottom:5}}>Desenvolvido Por LPS-Informática</Text>
      </View>
    </View>

        
          </AppProvider>
  );
}

const style = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width:'100%',
    height:'100%',
    
  },
  
  logo: {
    width:100,
    height:100,
    borderRadius:12,
  marginBottom:30,
  marginTop:'-230%'
  
  },

  text: {
    fontStyle:'Bold',
    fontSize:19,
    fontFamily:'sans-serif',
    fontWeight:'bold',
    color:'#0f0101ff',
    marginBottom:60,
    fontFamily: "Story Script", 

  }
,
  input: {
    width:'90%',
    height:50,
    borderColor:'#000',
    borderBottomWidth:1,
    marginBottom:60,
    justifyContent:'center',
    alignItems:'center',
    textAlign:'center',
    textDecorationStyle:'double',
    fontWeight:'semi-bold',
    fontSize:20,
    color:'#000',
    backgroundColor:'#ffffff',
    borderRadius:8,
  
  },

  iconemail:{
    position:'absolute',
    marginTop:'-59%',
     marginLeft:'-78%',
     backgroundColor:'#0302022a',
     borderRadius:50,
     zIndex:3,
     padding:5,
     boxShadowColor:'#FFF',
     shadowColor:'#000',
     shadowOffset:{width:0, height:2},
     shadowOpacity:0.25,
     shadowRadius:3.84,
     elevation:5,  
  },

  lock:{
    position:'absolute',
    marginTop:'-1%',
    marginLeft:'-78%',
     borderRadius:50,
     zIndex:3,
     padding:5,
     boxShadowColor:'#FFF',
     shadowColor:'#000',
     shadowOffset:{width:0, height:2},
     shadowOpacity:0.25,
     shadowRadius:3.84,
     elevation:5, 
  },
  backcolorLogin:{
    backgroundColor:"#000000de",
    width:170,
    height:100,
    borderRadius:12,
    justifyContent:'space-between',
    zIndex:3,
    boxShadowColor:'#FFF',
    borderColor:'#ffffffff',
    borderWidth:2,
    shadowColor:'#000000ff',
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5, 
    
  
  
  },
  backcolorfilial:{
    backgroundColor:"#201d1dff",
    width:180,
    height:65,
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    shadowColor:'#FFF',
    zIndex:3,
    shadowColor:'#000',
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5, 
  
  },

  containerLogin:{
    width:'95%',
    height:80,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
    gap:20,
    marginBottom:'25%'
  
  },

  botom:{
    width:'100%',
    backgroundColor:"#000000ff",
    height:"10%",
    marginBottom:'-240%',
    position:'fixed',
    justifyContent:'center',
    alignItems:'center',
    fontStyle:'italic',
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
    flexDirection:'row',
    gap:10,
    shadowColor:'#000',
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5,
  },
  textLogin:{
    color:'#fff',
    marginLeft:50,
    marginBottom:5,
    fontFamily:'sans-serif',
    fontSize:20,
    fontWeight:'bold',
  
  }
  ,
  textCadastro : {
      marginTop:-10
    }

});
