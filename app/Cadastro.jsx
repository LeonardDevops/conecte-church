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

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#0072B1', height: normalize(70), width: '90%', marginTop: 10 }}
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
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      try {
        const q = query(collection(db, "branches"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const branchesData = [];
        querySnapshot.forEach((doc) => {
          branchesData.push({
            branchId: doc.id,
            branchName: doc.data().name,
            churchId: doc.data().churchId || "default",
            churchName: "Ministério Conecte Church", // Nome unificado
          });
        });
        if (isMounted) setChurches(branchesData);
      } catch (error) {
        console.error("Erro ao carregar filiais:", error);
      }
    };

    fetchBranches();
    return () => { isMounted = false; };
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function handleRegister() {
    const branchCompleted = churches.find((b) => b.branchId === selectedBranchId);

    if (!nome.trim() || !email.trim() || !password.trim() || !selectedBranchId) {
      return Toast.show({ type: 'error', text1: 'Campos Vazios', text2: 'Por favor, preencha todos os dados.' });
    }

    if (!validateEmail(email)) {
      return Toast.show({ type: 'error', text1: 'E-mail Inválido', text2: 'Digite um formato de e-mail correto.' });
    }

    if (password.length < 6) {
      return Toast.show({ type: 'error', text1: 'Senha Curta', text2: 'A senha precisa de no mínimo 6 caracteres.' });
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
        status: "pending", // Aguardando aprovação
        createdAt: serverTimestamp(),
        uid: userCredential.user.uid,
        atribuicao: "Membro",
        role: "user"
      });

      Toast.show({
        type: 'success',
        text1: 'Cadastro Realizado!',
        text2: 'Aguarde a aprovação do seu acesso.',
        onHide: () => route.replace("/") // replace para não voltar ao form
      });

    } catch (error) {
      let mensagem = "Erro ao conectar com o servidor.";
      if (error.code === "auth/email-already-in-use") mensagem = "Este e-mail já está cadastrado.";
      if (error.code === "auth/invalid-email") mensagem = "O formato do e-mail é inválido.";
      
      Toast.show({ type: 'error', text1: 'Falha no Cadastro', text2: mensagem });
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
        >
          <View style={styles.headerArea}>
            <Text style={styles.title}>Criar nova conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para solicitar o acesso</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              placeholderTextColor="#bbb"
              style={styles.textInput}
              editable={!loading}
            />

            <Text style={styles.label}>E-mail de acesso</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="exemplo@email.com"
              placeholderTextColor="#bbb"
              style={styles.textInput}
              editable={!loading}
            />

            <View style={styles.row}>
              <View style={{ flex: 1.2, marginRight: 10 }}>
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

            <Text style={styles.label}>Sua Igreja Local</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedBranchId}
                onValueChange={(itemValue) => setSelectedBranchId(itemValue)}
                enabled={!loading}
                style={styles.picker}
                dropdownIconColor="#0072B1"
              >
                <Picker.Item label="Selecione uma filial..." value="" color="#999" />
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
              <Text style={styles.backButtonText}>Já possui acesso? <Text style={styles.linkText}>Entrar</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  containerBody: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  headerArea: { marginBottom: height * 0.03 },
  title: {
    fontSize: normalize(28),
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalize(14),
    color: "#888",
    marginTop: 4,
  },
  form: { width: "100%" },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: {
    fontSize: normalize(11),
    fontWeight: "800",
    color: "#444",
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  textInput: {
    height: normalize(55),
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: normalize(15),
    color: "#000",
    marginBottom: height * 0.02,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(55),
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 16,
    marginBottom: height * 0.02,
  },
  inputPass: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: normalize(15), color: "#000" },
  eyeIcon: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  pickerWrapper: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginBottom: height * 0.04,
    height: normalize(55),
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: { width: "100%", color: "#000" },
  button: {
    height: normalize(58),
    backgroundColor: "#0072B1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    elevation: 4,
    shadowColor: "#0072B1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: { backgroundColor: "#B0C4DE", elevation: 0 },
  buttonText: { color: "#fff", fontSize: normalize(16), fontWeight: "bold" },
  backButton: { marginTop: 30, alignSelf: "center" },
  backButtonText: { color: "#888", fontSize: normalize(14) },
  linkText: { color: "#0072B1", fontWeight: "bold" }
});