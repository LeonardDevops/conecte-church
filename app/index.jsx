import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import Toast from 'react-native-toast-message';
import { AppContext } from "../src/Data/contextApi";
import { db } from "../src/Data/FirebaseConfig";
import { setItem } from "../src/Data/storage";



const { width, height } = Dimensions.get("window");


export default function Login() {



  const {setUserContext , userContext } = useContext(AppContext);

  const [selectedValue, setSelectedValue] = useState();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [user , setUser] = useState();
  const [churchData , setChurchData] = useState(["Selecione"]);
  
  let isFilial = "selecione uma filial";
  
  const router = useRouter()
  

  
    // function seachUSer(params) {
    //   setSearchUser(true);
    //   console.log('buscando usuario ...');
    //   setSearchUser(false);
    // }
    
 
     
async function handleLogin() {

  if (!emailInput || !passwordInput && !isFilial) return alert("Necessario Prencher todos os Campos e Selecionar a Filial")



  

       
      try {
           const queryUsers = query(collection(db, "users"), where("status", "==", "active"));
            const dataUser = (await getDocs(queryUsers)) ;
          
            dataUser.forEach((data)=> {

            if( data.data().email.trim().toLowerCase() === emailInput && data.data().password === passwordInput &&
             data.data().branchName === selectedValue  ) {
              setUser(data.data());
              // console.log('usuario logado com sucesso');
      
              const userData = {emailInput, passwordInput , id: data.id, branchName:selectedValue, churches: churchData };
              
              setUserContext({...userContext, ...userData});
              console.log(userContext);
              setItem('user', JSON.stringify(userData)).then(() => {

                console.log('Dados do usuário salvos com sucesso!', userData);
                
                // console.log(userContext, 'dados do contexto apos login');
                console.log(userContext, 'dados do contexto apos login'); ; 
              }).catch((error) => {
                console.log('Erro ao salvar dados do usuário:', error);
                // alert("Dados incorretor,verifique e tente novamente!");
               
              });
              

               
                  
                setTimeout(()=> {
                  router.push("/tabs/home");
                
                },100);

                  

            } else {
              
            }

          })
        } catch (error) {
              
        }
          
          
   
      
       
     }


 useEffect(()=> {
    
  const  getChurchData = async () => {
    
      try {
        const queryChurch = query(collection(db, "branches"),where("status", "==", "active"));
        const dataChurch = (await getDocs(queryChurch)) ;
        const churches = [];
        const churchesNames = [];

        dataChurch.forEach( (data)=> {
          const churchItem = data.data();
          const churchName = churchItem.name?.trim() || "";
          
        // Usar regex para remover "Meta -" independente de espaços
        const cleanedName = churchName.replace(/Meta\s*\s*/i, "").trim();
        
        churches.push({ 
          ...churchItem, 
          id: data.id, 
          name: churchName,
          cleanedName: cleanedName,
          
        });
        
        churchesNames.push(cleanedName || churchName);
         setChurchData(["Selecione", ...churchesNames])
      
      });
      
      // Corrigir: Você estava usando setChurchData apenas com o último nome
      // Agora vamos usar um estado para array
      // Isso deve ser um array
      setUserContext({...userContext, nameRegister: churchesNames, churchesPr: churches[0].pastor}); // Definir o contexto com o array completo);
      
       

        
      } catch (error) {
        
        console.log('erro ao buscar dados da igreja', error);
      }
    }

    getChurchData();
   
    

 }, []);


  


  return (
    
  
    
    <View style={style.body}>
      <Toast/>
      

      <Image
      style={style.logo}
      source={require("./img/meta.webp")} />
      
      <Text style={style.text}>Ministério Evangelistico Tálamo</Text>
      <Entypo style={style.iconemail} name="email" size={24} color="black" />
      <TextInput
      onChangeText={(e)=> setEmailInput(e.trim().toLowerCase())}
      style={style.input} />
      <FontAwesome5 style={style.lock} name="lock" size={24} color="black" />
      <TextInput
      secureTextEntry
        onChangeText={(e)=> setPasswordInput(e.trim())}
      style={style.input} />

      <View style={style.containerLogin}>
            <TouchableOpacity onPress={handleLogin}>
            <View style={style.backcolorLogin}>
              <MaterialIcons style={{marginRight:40, elevation:5}} name="vpn-key" size={40} color="white" />
              <Text style={style.textLogin}>Acessar</Text>
            </View>   
            </TouchableOpacity>
        <View style={style.backcolorfilial}>

    <Picker
    selectedValue={selectedValue}
    style={{ height: 50, width: '95%', 
      fontFamily:'sans-serif',
      color:'#ffffffff',
      shadowColor:'#FFF',
      fontWeight:'bold', 
      fontSize:30,
      borderRadius:4,
      borderWidth:1,
      shadowOpacity:23,
      justifyContent:'center',
      alignItems:'center',
      textAlign:'center',
      backgroundColor:'#1f1f1fff',
      
      
    }}
    onValueChange={(item) => setSelectedValue(item)}
    >
      

      {churchData.map((item)=>  (
        <Picker.Item
        key={item} label={item} value={item} />
        
      ))}
    </Picker>
        
   
   

      </View>   
      </View>
        {/* <Text style={{marginTop:-20, marginBottom:"2%", color:'#000000ff', fontWeight:'bold'}}>Não Possui cadastro?</Text> */}
        <TouchableOpacity style={{justifyContent:'center',
          marginTop:-20, 
          padding:7, 
          marginBottom:30 ,
            alignItems:'center', 
            width:'45%',
           borderRadius:4, 
           backgroundColor:'rgba(0, 0, 0, 1)'}}>
        <Link style={{color:'#ffffff', fontSize:17, borderRadius:4 , width:'100%', textAlign:'center'}} href={"/Cadastro"} >🙋🏻Cadastro</Link>
        </TouchableOpacity>


      <View style={style.botom}>
        <Text style={{color:"#fff", fontStyle:'italic', fontWeight:'bold ', marginBottom:5}}>Desenvolvido Por IgrejaSmart.IO</Text>
      </View>
          
    </View>


        
        
  );
}



const style = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  logo: {
    width: width * 0.32,
    height: width * 0.32,
    borderRadius: 12,
    marginBottom: 40,
    marginTop: 0,
    shadowColor: "#ffffffff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    zIndex: 1,
    
  },

  text: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#0f0101ff",
    marginBottom: 40,
    textAlign: "center",
  },

  input: {
    width: "99%",
    height: 60,
    borderColor: "#000",
    borderWidth: 1,
    marginBottom: 36,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    color: "#1a1a1aff",
    backgroundColor: "#cacaca23",
    borderRadius: 8,
    marginTop: 10,
  },

  iconemail: {
    position: "absolute",
    top: height * 0.35,
    left: width * 0.07,
    padding: 6,
    backgroundColor: "#0302022a",
    borderRadius: 50,
    elevation: 5,
    zIndex: 1,
  },

  lock: {
    position: "absolute",
    top: height * 0.48,
    left: width * 0.07,
    padding: 6,
    backgroundColor: "#0302022a",
    borderRadius: 50,
    elevation: 5,
    zIndex: 1,
  },

  containerLogin: {
    width: "100%",
    marginBottom: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  backcolorLogin: {
    backgroundColor: "#030303ff",
    width: width * 0.45,
    height: width * 0.28,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 10,
    shadowColor: "#020202d2",
    borderColor: "#ffffffff",
    borderWidth: 2,
    elevation: 5,
  },

  backcolorfilial: {
    backgroundColor: "#201d1dff",
    width: width * 0.44,
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  botom: {
    position: "absolute",
    bottom: 0,
    width: "120%",
    backgroundColor: "#000000ff",
    height: height * 0.06,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },

  textLogin: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
});

