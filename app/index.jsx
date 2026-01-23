import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import {
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
import Toast from 'react-native-toast-message';
import { AppContext } from "../src/Data/contextApi";
import { auth, db } from "../src/Data/FirebaseConfig";
import { setItem } from "../src/Data/storage";

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Login() {
  const { setUserContext } = useContext(AppContext);

  const [selectedValue, setSelectedValue] = useState("Selecione Igreja");
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Guardamos os objetos completos para busca posterior
  const [objectBranchesData, setObjectBranchesData] = useState([]);
  // Guardamos apenas os nomes para o Picker (iniciando como objeto para não dar erro no .map)
  const [branchesData, setBranchesData] = useState([{ Branchname: "Selecione Igreja" }]);
  
  const [pixConfigData, setPixConfigData] = useState(null);
  const [pr, setPr] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const getChurchData = async () => {
      try {
        const queryBranc = query(collection(db, "branches"), where("status", "==", "active"));
        const dataBranch = await getDocs(queryBranc);

        let tempObjectBranches = [];
        
        dataBranch.forEach((item) => {
          tempObjectBranches.push({
            id: item.id,
            Branchname: item.data().name, // Nome da igreja vindo do Firebase
            pixConfig: item.data().pixConfig,
            Pr: item.data().pastor,
          });
        
        });

        // Criamos a lista apenas com os nomes para o Picker
        const namesOnly = tempObjectBranches.map(item => ({
          Branchname: item.Branchname
        }));

        setObjectBranchesData(tempObjectBranches);
        setBranchesData([{ Branchname: "Selecione Igreja" }, ...namesOnly]);

      } catch (error) {
        console.log('erro ao buscar dados da igreja', error);
      }
    };

    getChurchData();
  }, []);

  // Monitora a seleção para atualizar Pix e Pastor
  useEffect(() => {
    if (!selectedValue || selectedValue === "Selecione Igreja") return;
    
    const branch = objectBranchesData.find(item => item.Branchname === selectedValue);
    if (branch) { 
      setPixConfigData(branch.pixConfig); 
      setPr(branch.Pr); 
    }
  }, [selectedValue, objectBranchesData]);

  async function handleLogin() {
    if (!emailInput || !passwordInput || selectedValue === "Selecione Igreja") {
      return alert("Necessário preencher todos os campos e selecionar uma igreja");
    }
    
    try {
      const snapshot = await signInWithEmailAndPassword(auth, emailInput.toLowerCase(), passwordInput);
      await setItem("uid", snapshot.user.uid);

      const queryUsers = query(
        collection(db, "users"), 
        where("status", "==", "active"),
        where("email", "==", emailInput.toLowerCase()),
        where("branchName", "==", selectedValue)
      );

      const dataUser = await getDocs(queryUsers);
      
      if (dataUser.empty) {
        alert("Usuário não encontrado nesta filial!");
        return;
      }

      dataUser.forEach((item) => {
        setUserContext({
          id: item.id,
          email: item.data().email,
          name: item.data().name,
          tsg: item.data().tsg || null,
          phone: item.data().phone,
          birthDate: item.data().birthDate,
          atribuicao: item.data().atribuicao || null,
          branchName: item.data().branchName,
          churchId:item.data().churchId,
          isLogged: true,
          branchId: item.data().branchId,
          pixConfig: pixConfigData,
          pr: pr ,// pr já contém o objeto do pastor
          uid:item.id
        });
      });

      router.push("/IntroAfterLogin");
    } catch (error) {
      alert("Erro ao fazer login. Verifique seus dados.");
      console.log(error);
    }
  }

  return (
    <ScrollView contentContainerStyle={style.scrollContainer} bounces={false}>
      <View style={style.body}>
        <Toast />

        <Image
          style={style.logo}
          source={require("./img/meta.webp")}
          resizeMode="contain"
        />

        <Text style={style.text}>Ministério Evangelistico Tálamo</Text>

        <View style={style.inputContainer}>
          <TextInput
            placeholder='Email'
            placeholderTextColor={"#999"}
            onChangeText={(e) => setEmailInput(e.trim().toLowerCase())}
            style={style.input}
          />
          <TextInput
            placeholder='Senha'
            placeholderTextColor={"#999"}
            secureTextEntry
            onChangeText={(e) => setPasswordInput(e.trim())}
            style={style.input}
          />
        </View>

        <TouchableOpacity style={style.btnAcessar} onPress={handleLogin}>
          <Text style={style.textLogin}>Acessar</Text>
        </TouchableOpacity>

        <View style={style.pickerWrapper}>
          <Picker
            selectedValue={selectedValue}
            style={style.picker}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            {branchesData.map((item, index) => (
              <Picker.Item 
                key={index} 
                label={item.Branchname} 
                value={item.Branchname} 
                style={{fontSize: normalize(14)}} 
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity 
          style={style.btnCadastro} 
          onPress={() => router.push("/Cadastro")}
          activeOpacity={0.7}
        >
          <Text style={style.textCadastro}>🙋🏻 Cadastro</Text>
        </TouchableOpacity>

        <View style={style.bottomContainer}>
          <Text style={style.textFooter}>Desenvolvido por IgrejaSmart.IO</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ... Estilos permanecem os mesmos ...
const style = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#f5f5f5" },
  body: { flex: 1, alignItems: "center", paddingHorizontal: width * 0.08, paddingTop: height * 0.08 },
  logo: { width: normalize(120), height: normalize(120), borderRadius: 15, marginBottom: 20 },
  text: { fontSize: normalize(18), fontWeight: "600", color: "#333", marginBottom: 40, textAlign: "center" },
  inputContainer: { width: '100%', marginBottom: 15 },
  input: { width: "100%", height: normalize(55), backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, fontSize: normalize(16), color: "#333", marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  btnAcessar: { backgroundColor: "#000", width: "100%", height: normalize(50), borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  textLogin: { color: "#fff", fontSize: normalize(18), fontWeight: "bold" },
  pickerWrapper: { width: "100%", height: normalize(50), backgroundColor: "#fff", borderRadius: 8, justifyContent: "center", marginBottom: 30, borderWidth: 1, borderColor: '#ddd' },
  picker: { width: "100%", color: "#555" },
  btnCadastro: { backgroundColor: "#e0e0e0", paddingVertical: normalize(12), paddingHorizontal: 25, borderRadius: 8, marginBottom: 40, width: '50%', alignItems: 'center', justifyContent: 'center' },
  textCadastro: { color: "#333", fontSize: normalize(15), fontWeight: "600" },
  bottomContainer: { marginTop: 'auto', marginBottom: 20 },
  textFooter: { color: "#999", fontSize: normalize(12), textAlign: "center" },
});