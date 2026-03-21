import * as Clipboard from 'expo-clipboard';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useContext, useState } from "react";
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
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AppContext } from "../../src/Data/contextApi";
import { db } from "../../src/Data/FirebaseConfig";

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Ofertas() {
  const [tipo, setTipo] = useState("Dízimo");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const { userContext } = useContext(AppContext);

  const generatePixPayload = (chavePix, valor, descricao) => {
    if (!chavePix || !valor) return "";
    
    const valorFormatado = parseFloat(valor).toFixed(2);
    const nomeRecebedor = (userContext?.pixConfig?.nome || "CONECTE CHURCH").substring(0, 25).toUpperCase();
    const cidade = (userContext?.pixConfig?.cidade || "BRASIL").substring(0, 15).toUpperCase();
    
    const mountBlock = (id, value) => id + value.length.toString().padStart(2, '0') + value;

    let payload = "000201010212"; 
    const merchantAccount = "0014BR.GOV.BCB.PIX" + mountBlock("01", chavePix);
    payload += mountBlock("26", merchantAccount);
    payload += "52040000"; 
    payload += "5303986";  
    payload += mountBlock("54", valorFormatado); 
    payload += "5802BR";    
    payload += mountBlock("59", nomeRecebedor);
    payload += mountBlock("60", cidade);
    payload += "62070503***"; 
    payload += "6304"; 

    const calculateCRC16 = (str) => {
      let crc = 0xFFFF;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
          crc &= 0xFFFF;
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0');
    };
    
    return payload + calculateCRC16(payload);
  };

  const gerarQRCode = async () => {
    const valLimpo = valor.replace(',', '.');
    if (!valor || isNaN(parseFloat(valLimpo)) || parseFloat(valLimpo) <= 0) {
      Alert.alert("Valor Inválido", "Informe quanto deseja contribuir.");
      return;
    }

    const chavePix = userContext?.pixConfig?.pixKey;
    if (!chavePix) {
      Alert.alert("Configuração Pendente", "A chave PIX da igreja ainda não foi configurada.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const payload = generatePixPayload(chavePix, valLimpo, descricao);
      setPixPayload(payload);
      setQrGenerated(true);
      setLoading(false);
    }, 800);
  };

  const copiarCodigo = async () => {
    if (!pixPayload) return;

    try {
      await Clipboard.setStringAsync(pixPayload);

      const financeData = {
        type: tipo.toLowerCase(),
        amount: parseFloat(valor.replace(',', '.')),
        description: descricao || tipo,
        churchId: userContext?.churchId || "Geral",
        userName: userContext?.name || "Membro Conecte",
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        status: "pendente",
        paymentMethod: "pix",
        branchId: userContext?.branchId || "Matriz"
      };

      await addDoc(collection(db, "finances"), financeData);
      Alert.alert("✅ Sucesso!", "Código copiado! Abra o app do seu banco e escolha 'PIX Copia e Cola'.");
    } catch (error) {
      Alert.alert("Erro", "Falha ao registrar contribuição localmente.");
    }
  };

  const limparCampos = () => {
    setValor("");
    setDescricao("");
    setPixPayload("");
    setQrGenerated(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Dízimos e Ofertas</Text>
          <Text style={styles.subtitle}>Contribua com alegria para a obra</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, tipo === "Dízimo" && styles.tabActive]} 
              onPress={() => setTipo("Dízimo")}
            >
              <Text style={[styles.tabText, tipo === "Dízimo" && styles.tabTextActive]}>Dízimo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, tipo === "Oferta" && styles.tabActive]} 
              onPress={() => setTipo("Oferta")}
            >
              <Text style={[styles.tabText, tipo === "Oferta" && styles.tabTextActive]}>Oferta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Valor</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.valorInput}
              placeholder="0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="decimal-pad"
              value={valor}
              onChangeText={setValor}
              editable={!qrGenerated}
            />
          </View>

          <Text style={styles.label}>Descrição (Opcional)</Text>
          <TextInput
            style={styles.descricaoInput}
            placeholder="Ex: Oferta de gratidão"
            placeholderTextColor="#ADB5BD"
            value={descricao}
            onChangeText={setDescricao}
            editable={!qrGenerated}
          />

          {!qrGenerated ? (
            <TouchableOpacity 
              style={styles.btnGerar} 
              onPress={gerarQRCode}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GERAR QR CODE PIX</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.qrArea}>
              <View style={styles.qrBox}>
                <QRCode
                  value={pixPayload}
                  size={normalize(180)}
                  color="#000"
                  backgroundColor="#FFF"
                />
              </View>
              
              <TouchableOpacity style={styles.btnCopiar} onPress={copiarCodigo}>
                <Text style={styles.btnText}>COPIAR CÓDIGO PIX</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnLimpar} onPress={limparCampos}>
                <Text style={styles.btnLimparText}>Nova contribuição</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerVerse}>
          <Text style={styles.verseText}>"Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação."</Text>
          <Text style={styles.verseRef}>2 Coríntios 9:7</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { paddingBottom: 40 },
  header: { 
    backgroundColor: '#0072B1', 
    paddingTop: normalize(60), 
    paddingBottom: normalize(50), 
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  title: { color: '#FFF', fontSize: normalize(22), fontWeight: '900' },
  subtitle: { color: '#E0F2F1', fontSize: normalize(13), marginTop: 5, opacity: 0.8 },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: normalize(20),
    marginTop: normalize(-30),
    borderRadius: 24,
    padding: normalize(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F3F5', borderRadius: 14, padding: 5, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#0072B1' },
  tabText: { color: '#6C757D', fontWeight: '800', fontSize: normalize(13) },
  tabTextActive: { color: '#FFF' },
  label: { fontSize: normalize(11), color: '#495057', fontWeight: '800', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#E9ECEF', 
    paddingHorizontal: 15,
    marginBottom: 20
  },
  currencyPrefix: { fontSize: normalize(18), fontWeight: '900', color: '#0072B1', marginRight: 5 },
  valorInput: { flex: 1, height: 60, fontSize: normalize(20), fontWeight: '700', color: '#1A1A1A' },
  descricaoInput: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#E9ECEF', 
    paddingHorizontal: 15, 
    height: 60, 
    marginBottom: 25,
    fontSize: normalize(15),
    color: '#1A1A1A'
  },
  btnGerar: { backgroundColor: '#0072B1', height: 62, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: normalize(14), letterSpacing: 1 },
  qrArea: { alignItems: 'center', marginTop: 10 },
  qrBox: { padding: 20, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F3F5', marginBottom: 20 },
  btnCopiar: { backgroundColor: '#28A745', height: 62, width: '100%', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnLimpar: { marginTop: 20 },
  btnLimparText: { color: '#ADB5BD', fontWeight: '700', textTransform: 'uppercase', fontSize: normalize(11) },
  footerVerse: { marginTop: 40, alignItems: 'center', paddingHorizontal: 40 },
  verseText: { fontStyle: 'italic', textAlign: 'center', color: '#ADB5BD', fontSize: normalize(13), lineHeight: 20 },
  verseRef: { fontWeight: '800', color: '#0072B1', marginTop: 8 }
});