import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
} from 'react-native';

// Importações do Firebase - Verifique se seu caminho src/Data/firebaseConfig está correto
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/Data/FirebaseConfig';
const { width } = Dimensions.get('window');

// Mantendo seu padrão de normalização para ser responsivo em qualquer aparelho
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const CustomInput = ({ label, icon, value, onChangeText, placeholder, keyboardType = "default", multiline = false }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && styles.inputMultiline]}>
        <MaterialCommunityIcons name={icon} size={normalize(20)} color="#999" style={styles.icon} />
        <TextInput
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 10 }]}
          placeholder={placeholder}
          placeholderTextColor="#BBB"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
};

export default function Forms() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estado único para o formulário
  const [form, setForm] = useState({
    nome: '',
    igreja: '',
    telefone: '',
    email: '',
    evento: '',
    remedios: '',
    idade: '',
    emergencia: ''
  });


  
  const handleSave = async () => {
    
    
    // Validação básica
    if (!form.nome || !form.telefone || !form.evento) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha pelo menos Nome, Telefone e Evento.");
      return;
    }
    
    setLoading(true);
    const auth = getAuth();
     await onAuthStateChanged(auth, (user)=> {

      const uid = user.uid
      console.log(uid);
    
      if (!user) {
        return;

      } 
        
        try {
      // Gravação na coleção 'forms' do Firestore
        addDoc (collection(db, "forms"), {
        nome_completo: form.nome,
        igreja: form.igreja,
        telefone: form.telefone,
        email: form.email,
        nome_evento: form.evento,
        usa_remedios: form.remedios,
        idade: form.idade,
        contato_emergencia: form.emergencia,
        data_inscricao: serverTimestamp(),
      });
      
      Alert.alert("Sucesso", "Sua inscrição foi enviada com sucesso!", [
        { text: "OK", onPress: () => router.back() }
      ]);
      
    }  catch (error) {
      console.error("Erro Firebase:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  })
  
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Inscrição</Text>
          <Text style={styles.subtitle}>Preencha os campos para o evento</Text>
        </View>

        <View style={styles.formCard}>
          <CustomInput 
            label="Nome Completo *" 
            icon="account-outline" 
            value={form.nome} 
            onChangeText={(t) => setForm({...form, nome: t})} 
          />

          <CustomInput 
            label="Igreja que congrega" 
            icon="church" 
            value={form.igreja} 
            onChangeText={(t) => setForm({...form, igreja: t})} 
          />

          <View style={styles.row}>
            <View style={{ flex: 1.5, marginRight: 10 }}>
              <CustomInput 
                label="Telefone *" 
                icon="phone" 
                keyboardType="phone-pad" 
                value={form.telefone} 
                onChangeText={(t) => setForm({...form, telefone: t})} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput 
                label="Idade" 
                icon="numeric" 
                keyboardType="numeric" 
                value={form.idade} 
                onChangeText={(t) => setForm({...form, idade: t})} 
              />
            </View>
          </View>

          <CustomInput 
            label="E-mail" 
            icon="email-outline" 
            keyboardType="email-address" 
            value={form.email} 
            onChangeText={(t) => setForm({...form, email: t})} 
          />

          <CustomInput 
            label="Nome do Evento *" 
            icon="calendar-star" 
            value={form.evento} 
            onChangeText={(t) => setForm({...form, evento: t})} 
          />

          <CustomInput 
            label="Faz uso de remédios?" 
            icon="pill" 
            placeholder="Se sim, quais?" 
            value={form.remedios} 
            onChangeText={(t) => setForm({...form, remedios: t})} 
          />

          <CustomInput 
            label="Número de Emergência" 
            icon="alert-circle-outline" 
            keyboardType="phone-pad" 
            value={form.emergencia} 
            onChangeText={(t) => setForm({...form, emergencia: t})} 
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Confirmar Inscrição</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(40),
  },
  header: {
    marginBottom: normalize(20),
  },
  title: {
    fontSize: normalize(26),
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: normalize(14),
    color: '#666',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
  },
  inputContainer: {
    marginBottom: normalize(15),
  },
  label: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: normalize(52),
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: normalize(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#000000',
    height: normalize(55),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
});