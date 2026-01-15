import * as Clipboard from 'expo-clipboard';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
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
import { db } from "../../src/Data/FirebaseConfig"; // Importe sua configuração do Firebase

const { width, height } = Dimensions.get("window");

export default function Ofertas({ navigation }) {
  const [tipo, setTipo] = useState("Dízimo");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const { userContext } = useContext(AppContext);
  
  // Verificar estrutura do contexto
  useEffect(() => {
    console.log("Contexto do usuário:", userContext);
    console.log("Pix Config:", userContext?.pixConfig);
  }, [userContext]);

  // Função para gerar payload PIX
  const generatePixPayload = (chavePix, valor, descricao) => {
    if (!chavePix || !valor) return "";
    
    const valorFormatado = parseFloat(valor).toFixed(2);
    const nomeRecebedor = userContext?.pixConfig?.nome || "IGREJA META";
    const cidade = userContext?.pixConfig?.cidade || "RIO DE JANEIRO";
    
    // Formatação básica do payload PIX (simplificada)
    const payload = `0002012658${chavePix.length.toString().padStart(2, '0')}${chavePix}52040000530398654${valorFormatado.length.toString().padStart(2, '0')}${valorFormatado}5802BR59${nomeRecebedor.length.toString().padStart(2, '0')}${nomeRecebedor}60${cidade.length.toString().padStart(2, '0')}${cidade}62070503***`;
    
    // Cálculo do CRC16 (simplificado)
    const calculateCRC16 = (str) => {
      let crc = 0xFFFF;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
          crc &= 0xFFFF;
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0');
    };
    
    const crc = calculateCRC16(payload + "6304");
    return payload + "6304" + crc;
  };

  const gerarQRCode = async () => {
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      Alert.alert("Atenção", "Por favor, informe um valor válido.");
      return;
    }

    // Verificar se temos chave PIX no contexto
    const chavePix = userContext?.pixConfig?.pixKey;
    if (!chavePix) {
      Alert.alert("Erro", "Chave PIX não configurada no sistema.");
      return;
    }

    setLoading(true);
    
    try {
      const valorNumerico = parseFloat(valor).toFixed(2);
      
      // Gerar payload PIX
      const payload = generatePixPayload(chavePix, valorNumerico, descricao);
      
      // Gerar URL para QR Code
      const qrData = {
        pixKey: chavePix,
        amount: valorNumerico,
        description: `${tipo}: ${descricao || "Contribuição"}`,
        recipient: userContext?.pixConfig?.nome || "IGREJA META",
        city: userContext?.pixConfig?.cidade || "RIO DE JANEIRO",
        transactionId: `IGREJA${Date.now()}`
      };
      
      // URL PIX formatada
      const pixUrl = `pix://${encodeURIComponent(chavePix)}?amount=${valorNumerico}&name=${encodeURIComponent(qrData.recipient)}&city=${encodeURIComponent(qrData.city)}&txid=${qrData.transactionId}`;
      
      setPixPayload(payload);
      setQrCodeUrl(pixUrl);
      setQrGenerated(true);
      
      Alert.alert(
        "QR Code Gerado!",
        `Tipo: ${tipo}\nValor: R$ ${valorNumerico}\n${descricao ? `Descrição: ${descricao}` : ''}\n\nClique em "Copiar PIX" para compartilhar.`,
        [
          { text: "OK", style: "default" }
        ]
      );
      
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      Alert.alert("Erro", "Não foi possível gerar o QR Code.");
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = async () => {
    if (!pixPayload) {
      Alert.alert("Atenção", "Gere o QR Code primeiro.");
      return;
    }

    try {
      await Clipboard.setStringAsync(pixPayload);
      
      // Salvar no Firestore
      const financeData = {
        type: tipo,
        amount: parseFloat(valor),
        descripition: descricao || tipo,
        pixKey: userContext?.pixConfig?.pixKey,
        qrCodeUrl: qrCodeUrl,
        usuario: userContext?.email || "Anônimo",
        branchName: userContext?.branchName || "Matriz",
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: serverTimestamp(),
        status: "pendente",
        branchId:userContext?.branchId
      };

      await addDoc(collection(db, "finances"), financeData);
      
      Alert.alert(
        "✅ Sucesso!",
        "Código PIX copiado e contribuição registrada!\n\nCole no aplicativo do seu banco para realizar o pagamento.",
        [
          { 
            text: "Entendi", 
            style: "default",
            onPress: () => {
              // Opcional: Navegar para histórico ou limpar
              setValor("");
              setDescricao("");
              setQrGenerated(false);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Erro ao copiar/salvar:", error);
      Alert.alert("Erro", "Não foi possível copiar o código.");
    }
  };

  const limparCampos = () => {
    setValor("");
    setDescricao("");
    setQrCodeUrl("");
    setPixPayload("");
    setQrGenerated(false);
  };

  // Informações da chave PIX
  const pixInfo = userContext?.pixConfig || {};
  const chaveMascarada = pixInfo.pixKey 
    ? `${pixInfo.pixKey.substring(0, 10)}...${pixInfo.pixKey.substring(pixInfo.pixKey.length - 4)}`
    : "Não configurada";

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dízimos e Ofertas</Text>
          <Text style={styles.subtitle}>Contribua para a obra de Deus</Text>
          
          {/* Info da chave PIX */}
          {pixInfo.pixKey && (
            <View style={styles.pixInfoContainer}>
              <Text style={styles.pixInfoText}>
                Chave PIX: {chaveMascarada}
              </Text>
              <Text style={styles.pixInfoSubtext}>
                {pixInfo.nome} - {pixInfo.cidade}
              </Text>
            </View>
          )}
        </View>

        {/* Card Principal */}
        <View style={styles.card}>
          {/* Seletor de Tipo */}
          <Text style={styles.label}>Selecione o Tipo:</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tipo === "Dízimo" && styles.optionButtonActive
              ]}
              onPress={() => setTipo("Dízimo")}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionText,
                tipo === "Dízimo" && styles.optionTextActive
              ]}>
                Dízimo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                tipo === "Oferta" && styles.optionButtonActive
              ]}
              onPress={() => setTipo("Oferta")}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionText,
                tipo === "Oferta" && styles.optionTextActive
              ]}>
                Oferta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo de Valor */}
          <Text style={[styles.label, { marginTop: height * 0.03 }]}>Valor (R$):</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.valorInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={valor}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9,.]/g, '');
                setValor(cleaned);
              }}
              returnKeyType="done"
              editable={!qrGenerated}
            />
          </View>

          {/* Campo de Descrição (Opcional) */}
          <Text style={[styles.label, { marginTop: height * 0.02 }]}>Descrição (Opcional):</Text>
          <TextInput
            style={styles.descricaoInput}
            placeholder="Ex: Oferta de gratidão, Campanha especial..."
            placeholderTextColor="#999"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            maxLength={100}
            editable={!qrGenerated}
          />

          {/* QR Code Gerado */}
          {qrGenerated && qrCodeUrl && (
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodeTitle}>📱 QR Code Gerado</Text>
              
              <View style={styles.qrCodeBox}>
                <QRCode
                  value={pixPayload || qrCodeUrl}
                  size={width * 0.5}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logo={require('../img/meta.webp')} // Adicione seu logo
                  logoSize={40}
                  logoBackgroundColor="transparent"
                />
                
                <Text style={styles.qrCodeValue}>
                  R$ {parseFloat(valor).toFixed(2)}
                </Text>
                <Text style={styles.qrCodeType}>{tipo}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={copiarCodigo}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>
                  📋 COPIAR CÓDIGO PIX
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.buttonsContainer}>
            {!qrGenerated ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={gerarQRCode}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "⏳ GERANDO..." : "📱 GERAR QR CODE"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={limparCampos}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>
                    🔄 LIMPAR
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.newButton]}
                onPress={limparCampos}
                activeOpacity={0.8}
              >
                <Text style={styles.newButtonText}>
                  ✨ NOVA CONTRIBUIÇÃO
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Informações Adicionais */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Como funciona:</Text>
            <Text style={styles.infoText}>
              1. Selecione o tipo e valor{"\n"}
              2. Gere o QR Code PIX{"\n"}
              3. Copie o código ou escaneie o QR{"\n"}
              4. Pague no app do seu banco{"\n"}
              5. A contribuição é registrada automaticamente
            </Text>
          </View>
        </View>

        {/* Verso Bíblico */}
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria."
          </Text>
          <Text style={styles.verseReference}>2 Coríntios 9:7</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: height * 0.05,
  },
  header: {
    width: width,
    paddingVertical: height * 0.03,
    backgroundColor: "#2b2b2b",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
    textAlign: "center",
  },
  pixInfoContainer: {
    marginTop: height * 0.02,
    padding: width * 0.03,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    alignItems: "center",
  },
  pixInfoText: {
    fontSize: width * 0.035,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pixInfoSubtext: {
    fontSize: width * 0.03,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  card: {
    width: width * 0.95,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: width * 0.05,
    marginVertical: height * 0.02,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#333333",
    marginBottom: height * 0.01,
  },
  optionContainer: {
    width: "100%",
    height: height * 0.08,
    flexDirection: "row",
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: height * 0.02,
  },
  optionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#000000",
  },
  optionText: {
    fontSize: width * 0.045,
    fontWeight: "500",
    color: "#666666",
  },
  optionTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: width * 0.04,
    height: height * 0.07,
  },
  currencySymbol: {
    fontSize: width * 0.06,
    fontWeight: "600",
    color: "#000000",
    marginRight: width * 0.02,
  },
  valorInput: {
    flex: 1,
    fontSize: width * 0.06,
    fontWeight: "600",
    color: "#333333",
    paddingVertical: height * 0.01,
  },
  descricaoInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    fontSize: width * 0.04,
    color: "#333333",
    minHeight: height * 0.08,
    textAlignVertical: "top",
  },
  qrCodeContainer: {
    marginTop: height * 0.04,
    alignItems: "center",
  },
  qrCodeTitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: height * 0.02,
  },
  qrCodeBox: {
    alignItems: "center",
    padding: width * 0.05,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#000000",
    marginBottom: height * 0.02,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrCodeValue: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#000000",
    marginTop: height * 0.02,
  },
  qrCodeType: {
    fontSize: width * 0.04,
    color: "#666666",
    marginTop: height * 0.01,
  },
  buttonsContainer: {
    marginTop: height * 0.04,
    gap: height * 0.015,
  },
  actionButton: {
    width: "100%",
    height: height * 0.07,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#000000",
  },
  primaryButtonText: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2D5A8C",
  },
  secondaryButtonText: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#2D5A8C",
  },
  copyButton: {
    backgroundColor: "#10B981",
    marginTop: height * 0.01,
  },
  copyButtonText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  newButton: {
    backgroundColor: "#3B82F6",
  },
  newButtonText: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoBox: {
    marginTop: height * 0.04,
    padding: width * 0.04,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#000000",
  },
  infoTitle: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: height * 0.01,
  },
  infoText: {
    fontSize: width * 0.035,
    color: "#555555",
    lineHeight: height * 0.025,
  },
  verseContainer: {
    width: width * 0.95,
    marginTop: height * 0.03,
    padding: width * 0.05,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verseText: {
    fontSize: width * 0.04,
    color: "#444444",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: height * 0.025,
    marginBottom: height * 0.01,
  },
  verseReference: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
});