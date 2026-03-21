import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
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
import QRCode from 'react-native-qrcode-svg';
import { AppContext } from "../src/Data/contextApi"; // Importando seu contexto

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const QR_STORAGE_KEY = '@user_qrcode_data';

export default function UserQRCode() {
  const { userContext } = useContext(AppContext); // Pegando dados do usuário logado
  const [email, setEmail] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedQR();
  }, []);

  // Se o usuário logar e não tiver QR salvo, sugerimos o e-mail dele
  useEffect(() => {
    if (userContext?.email && !savedData) {
      setEmail(userContext.email);
    }
  }, [userContext, savedData]);

  const loadSavedQR = async () => {
    try {
      const storedValue = await AsyncStorage.getItem(QR_STORAGE_KEY);
      if (storedValue) {
        setSavedData(storedValue);
      }
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!email.includes('@') || email.length < 5) {
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido.");
      return;
    }

    try {
      const formattedEmail = email.toLowerCase().trim();
      await AsyncStorage.setItem(QR_STORAGE_KEY, formattedEmail);
      setSavedData(formattedEmail);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Redefinir Código",
      "Deseja apagar sua identificação digital atual?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, remover", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem(QR_STORAGE_KEY);
            setSavedData(null);
            setEmail(userContext?.email || '');
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0072B1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.innerContainer}>
          
          <Text style={styles.mainTitle}>Acesso Digital</Text>
          <Text style={styles.mainSubtitle}>Apresente seu código na recepção</Text>

          {/* CARD DE QR CODE */}
          <View style={styles.qrCard}>
            {savedData ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={savedData}
                    size={normalize(200)}
                    color="#000"
                    backgroundColor="white"
                    quietZone={10}
                  />
                </View>
                
                <View style={styles.infoBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.userMail} numberOfLines={1}>{savedData}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteBtnMinimal} 
                  onPress={handleDelete}
                  activeOpacity={0.6}
                >
                  <MaterialIcons name="refresh" size={14} color="#BBB" />
                  <Text style={styles.deleteTextMinimal}>REDEFINIR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="qr-code-scanner" size={normalize(50)} color="#0072B1" />
                </View>
                <Text style={styles.emptyTitle}>Sem código</Text>
                <Text style={styles.emptySub}>
                  Gere seu identificador para fazer check-in nos eventos e cultos.
                </Text>
              </View>
            )}
          </View>

          {/* FORMULÁRIO */}
          {!savedData && (
            <View style={styles.form}>
              <Text style={styles.label}>Confirmar E-mail</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="alternate-email" size={20} color="#0072B1" />
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity style={styles.btnMain} onPress={handleGenerateAndSave}>
                <Text style={styles.btnMainText}>Gerar QR Code</Text>
                <MaterialIcons name="qr-code" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>CONECTE CHURCH • SMART ID</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1 },
  innerContainer: { flex: 1, padding: 25, alignItems: 'center', paddingTop: normalize(40) },
  
  mainTitle: { fontSize: normalize(24), fontWeight: '900', color: '#1A1A1A' },
  mainSubtitle: { fontSize: normalize(14), color: '#888', marginBottom: 30, textAlign: 'center' },

  qrCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },

  qrContainer: { alignItems: 'center', width: '100%' },
  qrWrapper: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },

  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 25,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  userMail: {
    fontSize: normalize(13),
    color: '#495057',
    fontWeight: '700',
  },

  deleteBtnMinimal: {
    marginTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    opacity: 0.5
  },
  deleteTextMinimal: { 
    color: '#666', 
    fontWeight: '800', 
    fontSize: normalize(10),
    letterSpacing: 1,
  },

  emptyState: { alignItems: 'center', paddingVertical: 20 },
  iconCircle: {
    width: normalize(80),
    height: normalize(80),
    backgroundColor: '#E7F1F7',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { fontSize: normalize(20), fontWeight: '800', color: '#343A40' },
  emptySub: { textAlign: 'center', color: '#ADB5BD', marginTop: 10, lineHeight: 20, fontSize: normalize(14) },

  form: { width: '100%', marginTop: 30 },
  label: { marginBottom: 8, color: '#495057', fontWeight: '800', fontSize: normalize(12), textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: normalize(58),
    borderWidth: 1,
    borderColor: '#DEE2E6',
    paddingHorizontal: 18,
    marginBottom: 20
  },
  input: { flex: 1, paddingHorizontal: 12, fontSize: normalize(16), color: '#000', fontWeight: '600' },
  
  btnMain: {
    backgroundColor: '#0072B1',
    height: normalize(58),
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
  },
  btnMainText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },

  footer: { paddingBottom: 30 },
  footerNote: {
    textAlign: 'center',
    color: '#DEE2E6',
    fontSize: normalize(10),
    fontWeight: '800',
    letterSpacing: 2,
  }
});