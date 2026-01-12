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

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../src/Data/FirebaseConfig";

const { width, height } = Dimensions.get("window");

export default function Cadastro() {
  const { userContext } = useContext(AppContext);

  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);

  const route = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // ✅ CORREÇÃO PRINCIPAL
  useEffect(() => {
    if (userContext?.churches?.length > 0) {
      setChurches(userContext.churches);
    }
  }, [userContext.churches]);

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
    const branchCompleted = churches.find(
      (b) => b.branchId === selectedBranchId
    );

    if (!nome.trim() || !email.trim() || !password.trim() || !branchCompleted) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    if (nascimento && !validateDate(nascimento)) {
      Alert.alert("Erro", "Data de nascimento inválida.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "users"), {
        branchId: branchCompleted.branchId,
        branchName: branchCompleted.branchName,
        churchId: branchCompleted.churchId,
        churchName: branchCompleted.churchName,
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        birthDate: nascimento,
        status: "pending",
        lastAccess: null,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Seu cadastro foi enviado para aprovação!", [
        { text: "OK", onPress: () => route.push("/") },
      ]);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert(
        "Erro",
        "Não foi possível realizar o cadastro. Tente novamente."
      );
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
          onValueChange={setSelectedBranchId}
          enabled={!loading && churches.length > 0}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma filial" value="" />

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
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => route.push("/")}>
        <Text style={styles.backButtonText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}


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
    backgroundColor: "#000000ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: width * 0.02,
    marginTop: height * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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

  backButton: {
    marginTop: height * 0.02,
    padding: width * 0.03,
  },

  backButtonText: {
    color: "#000000ff",
    fontSize: width * 0.04,
    fontWeight: "500",
  },
});
