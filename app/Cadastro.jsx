import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AppContext } from "../src/Data/contextApi";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { auth, db } from "../src/Data/FirebaseConfig";

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Cadastro() {
  const { userContext } = useContext(AppContext);
  const route = useRouter();

  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [nascimento, setNascimento] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // Configuração do Toast para fontes grandes
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#4CAF50', height: normalize(70), width: '90%', marginTop: 10 }}
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
    const fetchBranches = async () => {
      if (userContext?.churches && userContext.churches.length > 0) {
        setChurches(userContext.churches);
      } else {
        try {
          const q = query(collection(db, "branches"), where("status", "==", "active"));
          const querySnapshot = await getDocs(q);
          const branchesData = [];
          querySnapshot.forEach((doc) => {
            branchesData.push({
              branchId: doc.id,
              branchName: doc.data().name,
              churchId: doc.data().churchId || "default",
              churchName: "Ministério Evangelistico Tálamo",
            });
          });
          setChurches(branchesData);
        } catch (error) {
          console.error("Erro ao carregar filiais:", error);
        }
      }
    };
    fetchBranches();
  }, [userContext]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function handleRegister() {
    const branchCompleted = churches.find((b) => b.branchId === selectedBranchId);

    if (!nome.trim() || !email.trim() || !password.trim() || !selectedBranchId) {
      return Toast.show({ type: 'error', text1: 'Erro', text2: 'Preencha todos os campos!' });
    }

    if (!validateEmail(email)) {
      return Toast.show({ type: 'error', text1: 'Erro', text2: 'E-mail inválido.' });
    }

    if (password.length < 6) {
      return Toast.show({ type: 'error', text1: 'Erro', text2: 'A senha deve ter pelo menos 6 dígitos.' });
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        branchId: branchCompleted?.branchId || null,
        branchName: branchCompleted?.branchName || null,
        churchId: branchCompleted?.churchId || null,
        churchName: branchCompleted?.churchName || null,
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        birthDate: nascimento || null,
        status: "pending",
        createdAt: serverTimestamp(),
        uid: userCredential.user.uid,
        atribuicao: "Membro",
        role: "user"
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Cadastro enviado para aprovação do pastor.',
        onHide: () => route.push("/")
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);
      let mensagem = "Não foi possível realizar o cadastro.";
      if (error.code === "auth/email-already-in-use") mensagem = "Este e-mail já está em uso.";
      Toast.show({ type: 'error', text1: 'Erro no Cadastro', text2: mensagem });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.containerBody}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Criar nova conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para solicitar o acesso</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="#bbb"
              style={styles.textInput}
              editable={!loading}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@exemplo.com"
              placeholderTextColor="#bbb"
              style={styles.textInput}
              editable={!loading}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Nascimento</Text>
                <MaskedTextInput
                  value={nascimento}
                  onChangeText={setNascimento}
                  mask="99/99/9999"
                  keyboardType="numeric"
                  placeholder="00/00/0000"
                  placeholderTextColor="#bbb"
                  style={styles.textInput}
                  editable={!loading}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    placeholder="******"
                    placeholderTextColor="#bbb"
                    style={styles.inputPass}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons 
                      name={secureText ? "visibility-off" : "visibility"} 
                      size={normalize(20)} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Selecione sua Igreja (Filial)</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedBranchId}
                onValueChange={(itemValue) => setSelectedBranchId(itemValue)}
                enabled={!loading}
                style={styles.picker}
                dropdownIconColor="#000"
              >
                <Picker.Item label="Toque para selecionar..." value="" color="#999" />
                {churches.map((item) => (
                  <Picker.Item
                    key={item.branchId}
                    label={item.branchName}
                    value={item.branchId}
                    style={{fontSize: normalize(15)}}
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Finalizar Cadastro</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => route.push("/")} 
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Já tenho uma conta. <Text style={{fontWeight: '700'}}>Entrar</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast config={toastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  containerBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  title: {
    fontSize: normalize(26),
    fontWeight: "800",
    color: "#000",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalize(14),
    color: "#777",
    marginTop: 5,
    marginBottom: height * 0.04,
  },
  form: {
    width: "100%",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: normalize(13),
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  textInput: {
    height: normalize(55),
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: normalize(15),
    color: "#000",
    marginBottom: height * 0.02,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(55),
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 14,
    marginBottom: height * 0.02,
  },
  inputPass: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: normalize(15),
    color: "#000",
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  pickerWrapper: {
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#efefef",
    marginBottom: height * 0.03,
    height: normalize(55),
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#000",
  },
  button: {
    height: normalize(58),
    backgroundColor: "#0072B1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#444",
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "700",
  },
  backButton: {
    marginTop: 25,
    alignSelf: "center",
    padding: 10
  },
  backButtonText: {
    color: "#666",
    fontSize: normalize(14),
  },
});