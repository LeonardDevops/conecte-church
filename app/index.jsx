import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router"; // Removido o Link
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
  const { setUserContext, userContext } = useContext(AppContext);

  const [selectedValue, setSelectedValue] = useState();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [objectBranchesData, setObjectBranchesData] = useState([]);
  const [branchesData, setBranchesData] = useState(["Selecione"]);
  const [pixConfigData, setPixConfigData] = useState(null);
  const [pr, setPr] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const getChurchData = async () => {
      try {
        const queryBranc = query(collection(db, "branches"), where("status", "==", "active"));
        const dataBranch = (await getDocs(queryBranc));

        let nameBranches = []
        let objectBranches = []
        let branchPr = []
        dataBranch.forEach((item) => {
          nameBranches.push(item.data().name);
          branchPr.push(item.data().pastor)
          objectBranches.push({
            id: item.id,
            name: item.data().name,
            pixConfig: item.data().pixConfig
          })
          setUserContext(userContext, ...nameBranches)
        })

        branchPr.forEach((item) => { setPr(item) })

        setBranchesData([...branchesData, ...nameBranches]);
        setObjectBranchesData(objectBranches);
        setUserContext({ churches: [nameBranches] });
      } catch (error) {
        console.log('erro ao buscar dados da igreja', error);
      }
    }
    getChurchData();
  }, []);

  useEffect(() => {
    if (!selectedValue || selectedValue === "Selecione") return;
    const branch = objectBranchesData.find(item => item.name === selectedValue);
    if (branch) { setPixConfigData(branch.pixConfig); }
  }, [selectedValue, objectBranchesData]);

  async function handleLogin() {
    if (!emailInput || !passwordInput || selectedValue === "Selecione") return alert("Necessário preencher todos os campos")
    try {
      const validateUser = signInWithEmailAndPassword(auth, emailInput.toLowerCase(), passwordInput)
        .then(async (snapshot) => {
          setItem("uid", snapshot.user.uid);
          const queryUsers = query(collection(db, "users"), where("status", "==", "active"),
            where("email", "==", emailInput.toLowerCase()),
            where("branchName", "==", selectedValue)
          );

          const dataUser = (await getDocs(queryUsers));
          if (dataUser.empty) {
            alert("Usuário não encontrado!");
            return;
          }

          dataUser.forEach((item) => {
            setUserContext({
              id: item.id,
              email: item.data().email,
              name: item.data().name,
              tsg: item?.data().tsg || null,
              phone: item?.data().phone,
              birthDate: item.data().birthDate,
              atribuicao: item.data().atribuicao || null,
              branchName: item.data().branchName,
              isLogged: true,
              branchId: item.data().branchId,
              pixConfig: pixConfigData,
              pr: pr.pastor
            });
          })
          setTimeout(() => { router.push("/IntroAfterLogin"); }, 60);
        }).catch(() => { alert("Erro ao fazer login") })
    } catch (error) {
      alert("Dados incorretos")
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
            onValueChange={(item) => setSelectedValue(item)}
          >
            {branchesData.map((item) => (
              <Picker.Item key={item} label={item} value={item} style={{fontSize: normalize(14)}} />
            ))}
          </Picker>
        </View>

        {/* BOTÃO CADASTRO CORRIGIDO PARA NAVEGAÇÃO INSTANTÂNEA */}
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

const style = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.08,
  },
  logo: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: 15,
    marginBottom: 20,
  },
  text: {
    fontSize: normalize(18),
    fontWeight: "600",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: normalize(55),
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: normalize(16),
    color: "#333",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  btnAcessar: {
    backgroundColor: "#000",
    width: "100%",
    height: normalize(50),
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textLogin: {
    color: "#fff",
    fontSize: normalize(18),
    fontWeight: "bold",
  },
  pickerWrapper: {
    width: "100%",
    height: normalize(50),
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    width: "100%",
    color: "#555",
  },
  btnCadastro: {
    backgroundColor: "#e0e0e0",
    paddingVertical: normalize(12),
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 40,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textCadastro: {
    color: "#333",
    fontSize: normalize(15),
    fontWeight: "600",
  },
  bottomContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  textFooter: {
    color: "#999",
    fontSize: normalize(12),
    textAlign: "center",
  },
});