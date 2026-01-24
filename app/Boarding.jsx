import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const QR_STORAGE_KEY = '@user_qrcode_data';

export default function UserQRCode() {
  const [email, setEmail] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedQR();
  }, []);

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
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido para gerar seu QR Code.");
      return;
    }

    try {
      const formattedEmail = email.toLowerCase().trim();
      await AsyncStorage.setItem(QR_STORAGE_KEY, formattedEmail);
      setSavedData(formattedEmail);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar os dados localmente.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Redefinir Código",
      "Isso apagará seu QR Code atual. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, remover", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem(QR_STORAGE_KEY);
            setSavedData(null);
            setEmail('');
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
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
          
          {/* CARD DE QR CODE */}
          <View style={styles.qrCard}>
            {savedData ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={savedData}
                    size={normalize(190)}
                    color="#000"
                    backgroundColor="white"
                    quietZone={10}
                  />
                </View>
                
                <View style={styles.infoBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.userMail}>{savedData}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteBtnMinimal} 
                  onPress={handleDelete}
                  activeOpacity={0.6}
                >
                  <Text style={styles.deleteTextMinimal}>Redefinir código</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="qr-code-2" size={normalize(50)} color="#3b6cb7" />
                </View>
                <Text style={styles.emptyTitle}>Gerar QR Code</Text>
                <Text style={styles.emptySub}>Crie sua identificação digital para acesso rápido às atividades.</Text>
              </View>
            )}
          </View>

          {/* FORMULÁRIO (OCULTO SE JÁ EXISTIR QR) */}
          {!savedData && (
            <View style={styles.form}>
              <Text style={styles.label}>Seu melhor e-mail</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="alternate-email" size={20} color="#999" />
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
                <Text style={styles.btnMainText}>Gerar Identificador</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>IgrejaSmart.IO • Segurança Local</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollContent: { flexGrow: 1 },
  innerContainer: { flex: 1, padding: 25, alignItems: 'center', paddingTop: normalize(30) },
  
  qrCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 32,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  qrContainer: { alignItems: 'center', width: '100%' },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },

  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  userMail: {
    fontSize: normalize(13),
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  deleteBtnMinimal: {
    marginTop: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deleteTextMinimal: { 
    color: '#bbb', 
    fontWeight: '700', 
    fontSize: normalize(11),
    letterSpacing: 1,
    textTransform: 'uppercase'
  },

  emptyState: { alignItems: 'center', paddingVertical: 10 },
  iconCircle: {
    width: normalize(90),
    height: normalize(90),
    backgroundColor: '#f0f7ff',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { fontSize: normalize(22), fontWeight: '800', color: '#111' },
  emptySub: { textAlign: 'center', color: '#888', marginTop: 10, lineHeight: 22, fontSize: normalize(14), paddingHorizontal: 10 },

  form: { width: '100%', marginTop: 35 },
  label: { marginBottom: 10, color: '#444', fontWeight: '700', fontSize: normalize(13), marginLeft: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: normalize(58),
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingHorizontal: 18,
    marginBottom: 18
  },
  input: { flex: 1, paddingHorizontal: 12, fontSize: normalize(16), color: '#000', fontWeight: '500' },
  
  btnMain: {
    backgroundColor: '#000',
    height: normalize(58),
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    gap: 10
  },
  btnMainText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },

  footer: { paddingBottom: 20 },
  footerNote: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: normalize(10),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  }
});