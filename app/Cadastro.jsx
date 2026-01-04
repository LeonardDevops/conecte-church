import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaskedTextInput } from "react-native-mask-text";
import { db } from "../src/Data/FirebaseConfig";
import { AppContext } from "../src/Data/contextApi";

const { width, height } = Dimensions.get("window");

export default function Cadastro() {
  const { userContext } = useContext(AppContext);
  const [churchs, setChurchs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const route = useRouter();

  const [nome, setNome] = useState('');  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (userContext.nameRegister && userContext.nameRegister.length > 0) {
      setChurchs(userContext.nameRegister);
      setSelectedValue(userContext.nameRegister[0]);
    }
  }, [userContext.nameRegister]);

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
    if (!nome.trim() || !email.trim() || !password.trim() || !nascimento.trim() || !selectedValue) {
      alert('Preencha todos os campos para continuar!');
      return;
    }

    if (!validateEmail(email)) {
      alert('Por favor, insira um email válido!');
      return;
    }

    if (!validateDate(nascimento)) {
      alert('Por favor, insira uma data de nascimento válida no formato DD/MM/AAAA!');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'users'), {
        name: nome.trim().toLowerCase(),
        email: email.trim().toLowerCase(), 
        password: password,
        nascimento: nascimento,
        branchName: selectedValue,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      
      console.log('Usuário cadastrado com sucesso!');
      alert('Cadastro realizado com sucesso!');
      route.push('/');
    } catch (error) {
      console.log('Erro ao cadastrar usuário: ', error);
      alert('Erro ao cadastrar. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.containerBody}>
      <Text style={styles.title}>Cadastro de Usuário</Text>
      
      <Text style={styles.text}>Nome Completo</Text>
      <TextInput 
        onChangeText={(e) => setNome(e)}
        value={nome}
        placeholder='Ex: João Silva'
        placeholderTextColor={"#4e4e4eaf"}
        style={styles.textInput}
        editable={!loading}
      />
        
      <Text style={styles.text}>Email</Text>
      <TextInput 
        onChangeText={(e) => setEmail(e)}
        value={email}
        keyboardType='email-address'
        autoCapitalize="none"
        autoCorrect={false}
        placeholder='Ex: email@exemplo.com'
        placeholderTextColor={"#4e4e4eaf"}
        style={styles.textInput}
        editable={!loading}
      />
        
      <Text style={styles.text}>Senha</Text>
      <TextInput 
        onChangeText={(e) => setPassword(e)}
        value={password}
        keyboardType='default'
        secureTextEntry={true}
        placeholder='Mínimo 6 caracteres'
        placeholderTextColor={"#4e4e4eaf"}
        style={styles.textInput}
        editable={!loading}
      />
        
      <Text style={styles.text}>Data de Nascimento</Text>
      <MaskedTextInput
        onChangeText={(e) => setNascimento(e)}
        value={nascimento}
        mask='99/99/9999' 
        keyboardType='numeric'
        placeholder='DD/MM/AAAA'
        placeholderTextColor={"#4e4e4eaf"}
        style={styles.textInput}
        editable={!loading}
      />
        
      <Text style={styles.text}>Filial</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={(item) => setSelectedValue(item)}
          enabled={!loading && churchs.length > 0}
        >
          {churchs.length === 0 ? (
            <Picker.Item label="Carregando filiais..." value="" />
          ) : (
            churchs.map((item) => (
              <Picker.Item 
                key={item} 
                label={item} 
                value={item} 
              />
            ))
          )}
        </Picker>
      </View>

      <TouchableOpacity 
        onPress={handleRegister}
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => route.push('/')}
        style={styles.backButton}
        disabled={loading}
      >
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
    backgroundColor: '#f5f5f5',
  },
  
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.04,
    alignSelf: "center",
  },

  textInput: {
    height: height * 0.06,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
    width: '100%',
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.01
  },

  text: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333333',
    marginBottom: height * 0.005,
    alignSelf: "flex-start",
  },

  pickerContainer: {
    width: '100%',
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: width * 0.02,
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  picker: {
    height: height * 0.07,
    width: '100%',
    color: '#000',
  },

  button: {
    height: height * 0.06,
    width: '100%',
    backgroundColor: '#000000ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginTop: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  buttonDisabled: {
    backgroundColor: '#cccccc',
  },

  buttonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  
  backButton: {
    marginTop: height * 0.02,
    padding: width * 0.03,
  },
  
  backButtonText: {
    color: '#000000ff',
    fontSize: width * 0.04,
    fontWeight: '500',
  }
});