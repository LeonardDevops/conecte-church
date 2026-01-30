import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
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
  const [secureText, setSecureText] = useState(true); 
  const [objectBranchesData, setObjectBranchesData] = useState([]);
  const [branchesData, setBranchesData] = useState([{ Branchname: "Selecione Igreja" }]);
  const [pixConfigData, setPixConfigData] = useState(null);
  const [pr, setPr] = useState(null);
  const router = useRouter();

  // Configuração customizada para o Toast ficar grande e por cima de tudo
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#4CAF50', height: normalize(70), width: '90%', marginTop: 10 }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: normalize(16), fontWeight: 'bold' }}
        text2Style={{ fontSize: normalize(14), color: '#555' }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: '#F44336', height: normalize(70), width: '90%', marginTop: 10 }}
        text1Style={{ fontSize: normalize(16), fontWeight: 'bold' }}
        text2Style={{ fontSize: normalize(14), color: '#555' }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#2196F3', height: normalize(70), width: '90%', marginTop: 10 }}
        text1Style={{ fontSize: normalize(16), fontWeight: 'bold' }}
        text2Style={{ fontSize: normalize(14), color: '#555' }}
      />
    ),
  };

  useEffect(() => {
    const getChurchData = async () => {
      try {
        const queryBranc = query(collection(db, "branches"), where("status", "==", "active"));
        const dataBranch = await getDocs(queryBranc);
        let tempObjectBranches = [];
        dataBranch.forEach((item) => {
          tempObjectBranches.push({
            id: item.id,
            Branchname: item.data().name,
            pixConfig: item.data().pixConfig,
            Pr: item.data().pastor,
          });
        });
        const namesOnly = tempObjectBranches.map(item => ({ Branchname: item.Branchname }));
        setObjectBranchesData(tempObjectBranches);
        setBranchesData([{ Branchname: "Selecione Igreja" }, ...namesOnly]);
      } catch (error) {
        console.log('erro ao buscar dados da igreja', error);
      }
    };
    getChurchData();
  }, []);

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
      return Toast.show({
        type: 'info',
        text1: 'Atenção',
        text2: 'Preencha todos os campos e selecione a igreja.'
      });
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
        return Toast.show({
          type: 'error',
          text1: 'Acesso Negado',
          text2: 'Usuário não encontrado nesta filial!'
        });
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
          pr: pr,
          uid:item.id
        });
      });

      Toast.show({
        type: 'success',
        text1: 'Bem-vindo!',
        text2: 'Login efetuado com sucesso.'
      });

      router.push("/IntroAfterLogin");
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro no Login',
        text2: 'E-mail ou senha incorretos.'
      });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView contentContainerStyle={style.scrollContainer} bounces={false}>
        <View style={style.body}>
          
          <TouchableOpacity 
            style={style.qrBtn} 
            onPress={() => router.push("/Boarding")}
            activeOpacity={0.7}
          >
            <MaterialIcons name="qr-code-scanner" size={normalize(24)} color="#333" />
          </TouchableOpacity>

          <Image
            style={style.logo}
            source={require("./img/logo.empresa.png")}
            resizeMode="contain"
          />

          <Text style={style.text}>Ministério Conecte Church</Text>

          <View style={style.inputContainer}>
            <TextInput
              placeholder='Email'
              placeholderTextColor={"#999"}
              onChangeText={(e) => setEmailInput(e.trim().toLowerCase())}
              style={style.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={style.passwordWrapper}>
              <TextInput
                placeholder='Senha'
                placeholderTextColor={"#999"}
                secureTextEntry={secureText}
                onChangeText={(e) => setPasswordInput(e.trim())}
                style={style.inputPass}
              />
              <TouchableOpacity 
                style={style.eyeIcon} 
                onPress={() => setSecureText(!secureText)}
              >
                <MaterialIcons 
                  name={secureText ? "visibility-off" : "visibility"} 
                  size={normalize(22)} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={style.btnAcessar} onPress={handleLogin} activeOpacity={0.8}>
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
            <Text style={style.textFooter}>Desenvolvido por Conecte.Church</Text>
          </View>
        </View>
      </ScrollView>

      {/* O TOAST DEVE FICAR AQUI, FORA DO SCROLLVIEW PARA NÃO SER SOBREPOSTO */}
      <Toast config={toastConfig} />
    </View>
  );
}

const style = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  body: { flex: 1, alignItems: "center", paddingHorizontal: width * 0.08, paddingTop: height * 0.08 },
  
  qrBtn: {
    position: 'absolute',
    right: normalize(20),
    top: normalize(40),
    width: normalize(45),
    height: normalize(45),
    backgroundColor: '#fff',
    borderRadius: 12, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    zIndex: 10
  },

  logo: { width: normalize(140), height: normalize(140), borderRadius: 300, marginBottom: 15 },
  text: { fontSize: normalize(14), fontWeight: "700", color: "#222", marginBottom: 30, textAlign: "center" },
  
  inputContainer: { width: '100%' },
  
  input: { 
    width: "100%", 
    height: normalize(55), 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    fontSize: normalize(16), 
    color: "#333", 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: normalize(55),
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  inputPass: {
    flex: 1, 
    height: '100%',
    paddingHorizontal: 15,
    fontSize: normalize(16),
    color: "#333",
  },
  eyeIcon: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },

  btnAcessar: { backgroundColor: "#0072B1", width: "100%", height: normalize(55), borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 2 },
  textLogin: { color: "#fff", fontSize: normalize(18), fontWeight: "bold" },
  pickerWrapper: { width: "100%", height: normalize(55), backgroundColor: "#fff", borderRadius: 12, justifyContent: "center", marginBottom: 25, borderWidth: 1, borderColor: '#eee' },
  picker: { width: "100%", color: "#555" },
  btnCadastro: { backgroundColor: "#fff", paddingVertical: normalize(12), paddingHorizontal: 25, borderRadius: 12, marginBottom: 30, width: '60%', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd' },
  textCadastro: { color: "#333", fontSize: normalize(15), fontWeight: "600" },
  bottomContainer: { marginTop: 'auto', marginBottom: 20 },
  textFooter: { color: "#bbb", fontSize: normalize(11), textAlign: "center", letterSpacing: 1 },
});