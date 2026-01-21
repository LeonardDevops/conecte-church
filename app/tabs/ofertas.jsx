import * as Clipboard from 'expo-clipboard';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useContext, useState } from "react";
import {
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

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Ofertas({ navigation }) {
  const [tipo, setTipo] = useState("Dízimo");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const { userContext } = useContext(AppContext);

  // Função para gerar payload PIX Estático (Padrão Banco Central)
  const generatePixPayload = (chavePix, valor, descricao) => {
    if (!chavePix || !valor) return "";
    
    const valorFormatado = parseFloat(valor).toFixed(2);
    const nomeRecebedor = (userContext?.pixConfig?.nome || "IGREJA").substring(0, 25).toUpperCase();
    const cidade = (userContext?.pixConfig?.cidade || "BRASIL").substring(0, 15).toUpperCase();
    
    // Auxiliar para montar blocos (Padrão EMV Co)
    const mountBlock = (id, value) => id + value.length.toString().padStart(2, '0') + value;

    let payload = "000201010212"; // Cabeçalho padrão
    
    // Dados da conta (Chave Pix)
    const merchantAccount = "0014BR.GOV.BCB.PIX" + mountBlock("01", chavePix);
    payload += mountBlock("26", merchantAccount);
    
    payload += "52040000"; // Categoria
    payload += "5303986";  // Moeda (Real)
    payload += mountBlock("54", valorFormatado); // Valor
    payload += "5802BR";   // País
    payload += mountBlock("59", nomeRecebedor);
    payload += mountBlock("60", cidade);
    payload += "62070503***"; // Campo adicional padrão
    payload += "6304"; // Indicador de CRC16

    // Cálculo real de CRC16 CCITT
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
    if (!valor || isNaN(parseFloat(valor.replace(',', '.'))) || parseFloat(valor.replace(',', '.')) <= 0) {
      Alert.alert("Atenção", "Por favor, informe um valor válido.");
      return;
    }

    const chavePix = userContext?.pixConfig?.pixKey;
    if (!chavePix) {
      Alert.alert("Erro", "Chave PIX não configurada pelo administrador.");
      return;
    }

    setLoading(true);
    try {
      const valorNumerico = parseFloat(valor.replace(',', '.')).toFixed(2);
      const payload = generatePixPayload(chavePix, valorNumerico, descricao);
      
      setPixPayload(payload);
      setQrCodeUrl(payload); // O QR Code agora renderiza o próprio payload Copia e Cola
      setQrGenerated(true);
    } catch (error) {
      Alert.alert("Erro", "Falha ao gerar QR Code.");
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = async () => {
    if (!pixPayload) return;

    try {
      await Clipboard.setStringAsync(pixPayload);

      // Salvar histórico no Firestore mantendo sua lógica original
      const financeData = {
        type: tipo.toLowerCase(),
        amount: parseFloat(valor.replace(',', '.')),
        descripition: descricao || tipo,
        pixKey: userContext?.pixConfig?.pixKey,
        qrCodeUrl: "pix_generated",
        userName: userContext?.name || "Anônimo",
        branchName: userContext?.branchName || "Matriz",
        date: new Date().toLocaleDateString('pt-BR'),
        createdAt: serverTimestamp(),
        status: "pendente",
        category: "geral",
        paymentMethod: "Pix",
        branchId: userContext?.branchId
      };

      await addDoc(collection(db, "finances"), financeData);
      Alert.alert("✅ Copiado!", "Código PIX copiado. Agora cole no app do seu banco para pagar.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível registrar a contribuição.");
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
          <Text style={styles.subtitle}>Sua fidelidade faz a obra crescer</Text>
        </View>

        <View style={styles.card}>
          {/* Seletor de Tipo Profissional */}
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

          <Text style={styles.label}>Valor da Contribuição</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.valorInput}
              placeholder="0,00"
              placeholderTextColor={"#686666"}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
              editable={!qrGenerated}
            />
          </View>

          <Text style={styles.label}>Motivo / Descrição (Opcional)</Text>
          <TextInput
            style={styles.descricaoInput}
            placeholder="Ex: Gratidão pela família"
            placeholderTextColor={"#686666"}
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
              <Text style={styles.btnText}>{loading ? "PROCESSANDO..." : "GERAR PIX"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qrArea}>
              <View style={styles.qrBox}>
                <QRCode
                  value={pixPayload}
                  size={normalize(180)}
                  logo={require('../img/meta.webp')}
                  logoSize={normalize(40)}
                />
              </View>
              
              <TouchableOpacity style={styles.btnCopiar} onPress={copiarCodigo}>
                <Text style={styles.btnText}>COPIAR CÓDIGO PIX</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnLimpar} onPress={limparCampos}>
                <Text style={styles.btnLimparText}>Fazer outra contribuição</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerVerse}>
          <Text style={styles.verseText}>"Deus ama quem dá com alegria."</Text>
          <Text style={styles.verseRef}>2 Coríntios 9:7</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { paddingBottom: 40 },
  header: { 
    backgroundColor: '#000', 
    paddingTop: normalize(50), 
    paddingBottom: normalize(30), 
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  title: { color: '#FFF', fontSize: normalize(22), fontWeight: 'bold' },
  subtitle: { color: '#AAA', fontSize: normalize(13), marginTop: 5 },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: normalize(20),
    marginTop: normalize(-20),
    borderRadius: 20,
    padding: normalize(20),
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F3F5', 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 20 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#000' },
  tabText: { color: '#666', fontWeight: 'bold' },
  tabTextActive: { color: '#FFF' },
  label: { fontSize: normalize(12), color: '#888', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E9ECEF', 
    paddingHorizontal: 15,
    marginBottom: 20
  },
  currencyPrefix: { fontSize: normalize(18), fontWeight: 'bold', color: '#000', marginRight: 10 },
  valorInput: { flex: 1, height: 55, fontSize: normalize(18), fontWeight: 'bold', color: '#000' },
  descricaoInput: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E9ECEF', 
    padding: 15, 
    height: 55, 
    marginBottom: 25,
    color: '#000'
  },
  btnGerar: { backgroundColor: '#000', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: normalize(14) },
  qrArea: { alignItems: 'center', marginTop: 10 },
  qrBox: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 20 },
  btnCopiar: { backgroundColor: '#10B981', height: 60, width: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnLimpar: { marginTop: 15 },
  btnLimparText: { color: '#666', fontWeight: '600', textDecorationLine: 'underline' },
  footerVerse: { marginTop: 30, alignItems: 'center', paddingHorizontal: 40 },
  verseText: { fontStyle: 'italic', textAlign: 'center', color: '#888', fontSize: normalize(14) },
  verseRef: { fontWeight: 'bold', color: '#555', marginTop: 5 }
});