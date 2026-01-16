import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import { AppContext } from "../src/Data/contextApi";
import { db } from "../src/Data/FirebaseConfig";



const { width, height } = Dimensions.get("window");


export default function Login() {



  const {setUserContext , userContext } = useContext(AppContext);

  const [selectedValue, setSelectedValue] = useState();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [objectBranchesData , setObjectBranchesData] = useState([]);
  const [branchesData , setBranchesData] = useState(["Selecione"]);
  const [pixConfigData , setPixConfigData] = useState(null);
  
  let isFilial = "selecione uma filial";
  
  const router = useRouter()
  
  
  useEffect(()=> {
    
    const  getChurchData = async () => {
      
      try {
        const queryBranc = query(collection(db, "branches"),where("status", "==", "active"));  
        const dataBranch = (await getDocs(queryBranc));
      
        let nameBranches = []
        let objectBranches = []
        
        dataBranch.forEach((item)=> {
                 
                nameBranches.push(item.data().name);

                 objectBranches.push({
                  id:item.id,
                  name:item.data().name,
                  pixConfig:item.data().pixConfig
                
                })     
                console.log('testando se to pegando a iformacao ',objectBranches)
        })
        
          setBranchesData([...branchesData,... nameBranches]);
          setObjectBranchesData(objectBranches);

          console.log('adicionado na useState', objectBranchesData);
      } catch (error) {
        
        console.log('erro ao buscar dados da igreja', error);
      }

    }
    getChurchData();
    console.log(selectedValue)
 },[]);

  
useEffect(() => {
  console.log(userContext);
}, [userContext]);

    
  useEffect(() => {
  if (!selectedValue || selectedValue === "Selecione") return;

  const branch = objectBranchesData.find(
    item => item.name === selectedValue
  );

  if (branch) {
    setPixConfigData(branch.pixConfig);
  }
}, [selectedValue, objectBranchesData]);



 async function handleLogin() {

  if (!emailInput || !passwordInput || selectedValue === "Selecione") return alert("Necessario Prencher todos os Campos e Selecionar a Filial")
      try {
        
           const queryUsers = query(collection(db, "users"), where("status", "==", "active"),
            where("email", "==", emailInput.toLowerCase()),
            where("password", "==", passwordInput.toLowerCase()),
            where("branchName", "==", selectedValue)
          );
           

           const dataUser = (await getDocs(queryUsers)) ;
          
           if (dataUser.empty) {
            alert("usuario nao encontrado, verifique os dados e tente novamente!");

            return;
           }

            dataUser.forEach((item)=> {

            setUserContext(
               { 
                id: item.id,
                email: item.data().email,
                branchName: item.data().branchName,
                isLogged: true,
                branchId : item.data().branchId,
                pixConfig:pixConfigData
                
              }
            ); 
            
            console.log("dados do usuario setados no context", userContext)
            
          })




          
                alert("Login realizado com sucesso!");
          
               
                 setTimeout(()=> {
                router.push("/tabs/home");
              
              },100);
          
            
       


          
        } catch (error) {
            alert("Dados incorretos")
         
        }
          
          
   
      
       
     }






  


  return (
    
  
    
    <View style={style.body}>
      <Toast/>
      

      <Image
      style={style.logo}
      source={require("./img/meta.webp")} />
      
      <Text style={style.text}>Ministério Evangelistico Tálamo</Text>
      <TextInput
      placeholder='Email'
      placeholderTextColor={"#727272"}
      onChangeText={(e)=> setEmailInput(e.trim().toLowerCase())}
      style={style.input} />
      <TextInput
      placeholder='Senha'
      placeholderTextColor={"#727272"}
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
      

      {branchesData.map((item)=>  (
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
    backgroundColor: "#ebeaea",
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
    textAlign: "left",
    fontWeight: "600",
    fontSize: 18,
    color: "#1a1a1aff",
    backgroundColor: "#f5f5f5",
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

