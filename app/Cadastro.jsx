import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { AppContext } from "../src/Data/contextApi";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { auth, db } from "../src/Data/FirebaseConfig";

const { width, height } = Dimensions.get("window");

export default function Cadastro() {
  const { userContext } = useContext(AppContext);
  const route = useRouter();

  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // ✅ BUSCA AS FILIAIS DIRETAMENTE CASO NÃO ESTEJAM NO CONTEXTO
  useEffect(() => {
    const fetchBranches = async () => {
      // Se o contexto já tiver as igrejas, usamos ele, senão buscamos no banco
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
              churchId: doc.data().churchId || "default", // ajuste conforme seu banco
              churchName: "Ministério Evangelistico Tálamo", // fixo ou do banco
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

  const validateDate = (date) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    const [, day, month, year] = date.match(regex);
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (y < 1900 || y > new Date().getFullYear()) return false;
    if (m < 1 || m > 12) return false;
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    return d >= 1 && d <= lastDayOfMonth;
  };

  async function handleRegister() {
    const branchCompleted = churches.find((b) => b.branchId === selectedBranchId);

    if (!nome.trim() || !email.trim() || !password.trim() || !selectedBranchId) {
      Alert.alert("Erro", "Preencha todos os campos e selecione uma filial!");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erro", "E-mail inválido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      // 2. Salvar dados adicionais no Firestore
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
        atribuicao: "Membro", // Valor padrão
        role:"user"
      });

      Alert.alert("Sucesso", "Seu cadastro foi enviado para aprovação do pastor!", [
        { text: "OK", onPress: () => route.push("/") },
      ]);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      let mensagem = "Não foi possível realizar o cadastro.";
      if (error.code === "auth/email-already-in-use") mensagem = "Este e-mail já está em uso.";
      Alert.alert("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.containerBody}>
      <Text style={styles.title}>Cadastro de Usuário</Text>

      <Text style={styles.text}>Nome Completo</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: João Silva"
        style={styles.textInput}
        editable={!loading}
      />

      <Text style={styles.text}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="email@exemplo.com"
        style={styles.textInput}
        editable={!loading}
      />

      <Text style={styles.text}>Senha</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Mínimo 6 caracteres"
        style={styles.textInput}
        editable={!loading}
      />

      <Text style={styles.text}>Data de Nascimento</Text>
      <MaskedTextInput
        value={nascimento}
        onChangeText={setNascimento}
        mask="99/99/9999"
        keyboardType="numeric"
        placeholder="DD/MM/AAAA"
        style={styles.textInput}
        editable={!loading}
      />

      <Text style={styles.text}>Filial</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedBranchId}
          onValueChange={(itemValue) => setSelectedBranchId(itemValue)}
          enabled={!loading}
          style={styles.picker}
        >
          <Picker.Item label="Selecione sua igreja" value="" color="#999" />
          {churches.map((item) => (
            <Picker.Item
              key={item.branchId}
              label={item.branchName}
              value={item.branchId}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Cadastro</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => route.push("/")} disabled={loading}>
        <Text style={styles.backButtonText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... Seus estilos permanecem os mesmos ...
const styles = StyleSheet.create({
    containerBody: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: width * 0.05,
      backgroundColor: "#f5f5f5",
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: "#000000",
      marginBottom: height * 0.04,
      alignSelf: "center",
    },
    textInput: {
      height: height * 0.06,
      borderColor: "#ddd",
      borderWidth: 1,
      marginBottom: height * 0.02,
      fontSize: width * 0.04,
      width: "100%",
      color: "#000",
      backgroundColor: "#fff",
      borderRadius: width * 0.02,
      paddingHorizontal: width * 0.04,
      marginTop: height * 0.01,
    },
    text: {
      fontSize: width * 0.04,
      fontWeight: "600",
      color: "#333333",
      marginBottom: height * 0.005,
      alignSelf: "flex-start",
    },
    pickerContainer: {
      width: "100%",
      borderColor: "#ddd",
      borderWidth: 1,
      borderRadius: width * 0.02,
      marginTop: height * 0.01,
      marginBottom: height * 0.02,
      backgroundColor: "#fff",
      overflow: "hidden",
    },
    picker: {
      height: height * 0.07,
      width: "100%",
      color: "#000",
    },
    button: {
      height: height * 0.06,
      width: "100%",
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: width * 0.02,
      marginTop: height * 0.02,
      elevation: 3,
    },
    buttonDisabled: {
      backgroundColor: "#cccccc",
    },
    buttonText: {
      color: "#fff",
      fontSize: width * 0.045,
      fontWeight: "bold",
    },
    backButtonText: {
      color: "#000",
      fontSize: width * 0.04,
      fontWeight: "500",
      marginTop: 20
    },
  });