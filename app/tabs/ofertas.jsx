// AppModernPix.js
import * as Clipboard from "expo-clipboard";
import { addDoc, collection } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from "../../src/Data/contextApi";

/* =======================
   CONFIGURAÇÕES PIX
   ======================= */
const PIX_KEYS = {
  Matriz: "55188c2a-0fd2-4575-a85f-7d5b825577a9",
  Palmares: "13924066760",
  Sepetiba: "55188c2a-0fd2-4575-a85f-7d5b825577a9",
};

const RECEIVER_NAME = "IGREJA META";
const RECEIVER_CITY = "RIO DE JANEIRO";

/* =======================
   FUNÇÕES PIX OTIMIZADAS
   ======================= */
function emv(id, value) {
  const v = String(value);
  return id + v.length.toString().padStart(2, "0") + v;
}

function crc16(payload) {
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPayload(chave, nome, cidade, valor) {
  if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
    return "";
  }

  // Limitar nome e cidade para evitar problemas com caracteres especiais
  const nomeLimpo = nome.replace(/[^\x20-\x7E]/g, '');
  const cidadeLimpa = cidade.replace(/[^\x20-\x7E]/g, '');
  
  const valorFormatado = Number(valor).toFixed(2);
  
  // GUI do PIX
  const gui = emv("00", "BR.GOV.BCB.PIX");
  
  // Chave PIX (remove caracteres especiais)
  const chaveLimpa = chave.replace(/[^a-zA-Z0-9]/g, '');
  const key = emv("01", chaveLimpa);
  
  // Merchant Account Information
  const merchantAccount = "26" + 
    (gui + key).length.toString().padStart(2, "0") + 
    gui + key;
  
  // Montar payload principal
  const payload =
    emv("00", "01") + // Payload Format Indicator
    emv("01", "11") + // Point of Initiation Method (11 = estático, 12 = dinâmico)
    merchantAccount + // Merchant Account Information
    emv("52", "0000") + // Merchant Category Code
    emv("53", "986") + // Currency (BRL)
    emv("54", valorFormatado) + // Transaction Amount
    emv("58", "BR") + // Country Code
    emv("59", nomeLimpo.substring(0, 25)) + // Merchant Name (max 25 chars)
    emv("60", cidadeLimpa.substring(0, 15)) + // Merchant City (max 15 chars)
    "62070503***"; // Additional Data Field (Reference)
  
  // Calcular CRC16
  const crc = crc16(payload + "6304");
  
  return payload + "6304" + crc;
}

function gerarUrlPix(chave, nome, cidade, valor) {
  const valorFormatado = Number(valor).toFixed(2);
  const nomeCodificado = encodeURIComponent(nome.substring(0, 25));
  const cidadeCodificada = encodeURIComponent(cidade.substring(0, 15));
  
  return `pix://${chave}?amount=${valorFormatado}&name=${nomeCodificado}&city=${cidadeCodificada}&txid=IGREJA${Date.now()}`;
}

/* =======================
   APP PRINCIPAL
   ======================= */
export default function AppModernPix() {
  const { userContext } = useContext(AppContext);
  console.log("UserContext recebido:", userContext);
  console.log("Filial do contexto:", userContext?.branchName);

  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("Dízimo");
  const [filial, setFilial] = useState(userContext?.filial || "Matriz");
  const [payloadGerado, setPayloadGerado] = useState("");
  const [botaoModo, setBotaoModo] = useState("gerar");
  const [copiado, setCopiado] = useState(false);
  const [urlPix, setUrlPix] = useState("");

  const slideType = useRef(new Animated.Value(0)).current;
  const slideBranch = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Atualiza a filial quando o contexto mudar
  useEffect(() => {
    if (userContext?.branchName) {
      setFilial(userContext.branchName);
    }
  }, [userContext]);

  /* anima indicador tipo */
  useEffect(() => {
    Animated.spring(slideType, {
      toValue: tipo === "Dízimo" ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [tipo]);

  // Define filiais disponíveis
  const filiaisDisponiveis = userContext?.branchName 
    ? [userContext.branchName] 
    : ["Matriz", "Palmares", "Sepetiba"];

  // Calcula largura dinâmica para o indicador
  const branchIndicatorWidth = 100 / filiaisDisponiveis.length;

  /* anima indicador filial */
  useEffect(() => {
    const index = filiaisDisponiveis.indexOf(filial);
    Animated.spring(slideBranch, {
      toValue: index >= 0 ? index : 0,
      useNativeDriver: true,
    }).start();
  }, [filial, filiaisDisponiveis]);

  /* gerar PIX */
  const gerarPIX = () => {
    if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
      Alert.alert("Atenção", "Digite um valor válido para gerar o PIX.");
      return;
    }

    const chave = PIX_KEYS[filial];
    if (!chave) {
      Alert.alert("Erro", "Chave PIX não encontrada para esta filial.");
      return;
    }

    const nomeCompleto = `${RECEIVER_NAME} - ${filial}`;
    
    // Gerar payload padrão PIX
    const payload = buildPayload(chave, nomeCompleto, RECEIVER_CITY, valor);
    
    // Gerar URL PIX como alternativa
    const url = gerarUrlPix(chave, nomeCompleto, RECEIVER_CITY, valor);
    
    setPayloadGerado(payload);
    setUrlPix(url);
    setBotaoModo("copiar");
    setCopiado(false);

    // Animação do QR Code
    qrAnim.setValue(0);
    Animated.timing(qrAnim, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  /* copiar PIX */
  const copyToClipboard = async () => {
    if (!payloadGerado) return;

    try {
      // Tenta copiar o payload primeiro
      await Clipboard.setStringAsync(payloadGerado);
      
      // Animação de sucesso
      successAnim.setValue(0);
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 10,
      }).start();
      
      setCopiado(true);
      
      // Salvar no Firestore
      try {
        const data = new Date();
        const dataFormatada = data.toLocaleDateString('pt-BR');
        console.log(dataFormatada, 'data atual');
        
        await addDoc(collection(db, "finances"), {
          type: tipo,
          amount: parseFloat(valor),
          brancheName: userContext?.branchName || filial,
          date: dataFormatada,
          createAt: data.toISOString(),
          payload: payloadGerado.substring(0, 50) + "..."
        });
        console.log("Contribuição registrada com sucesso");
      } catch (firestoreError) {
        console.log("Erro ao registrar contribuição:", firestoreError);
      }

      // Mostrar alerta após animação
      setTimeout(() => {
        Alert.alert(
          "✅ PIX Copiado!",
          "Cole o código no aplicativo do seu banco para realizar o pagamento.\n\n" +
          "No Nubank: Pix → Pagar com Pix → Pix Copia e Cola",
          [
            {
              text: "Entendi",
              style: "default"
            }
          ]
        );
      }, 300);

      setBotaoModo("gerar");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar o código PIX.");
    }
  };

  const botaoPress = () => {
    if (botaoModo === "gerar") {
      gerarPIX();
    } else {
      copyToClipboard();
    }
  };

  const resetarPIX = () => {
    setPayloadGerado("");
    setUrlPix("");
    setBotaoModo("gerar");
    setCopiado(false);
    qrAnim.setValue(0);
  };

  const typeIndicatorTranslate = slideType.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  // CORREÇÃO DO ERRO: Ajuste dinâmico do branch indicator
  // Se houver apenas uma filial, não precisamos de animação de transição
  const branchIndicatorTranslate = slideBranch.interpolate({
    inputRange: [0, filiaisDisponiveis.length - 1 || 1], // Garante pelo menos 2 elementos
    outputRange: [0, (filiaisDisponiveis.length - 1) * branchIndicatorWidth],
  });

  const qrStyle = {
    opacity: qrAnim,
    transform: [
      {
        scale: qrAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const successScale = successAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const successOpacity = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>Dízimos & Ofertas</Text>
            <Text style={styles.appSubtitle}>Selecione, digite o valor e gere o PIX</Text>
          </View>

          <View style={styles.card}>
            {/* TIPO */}
            <Text style={styles.label}>Tipo</Text>

            <View style={styles.segmentWrap}>
              <View style={styles.segmentRow}>
                <Animated.View
                  style={[
                    styles.segmentIndicator,
                    { transform: [{ translateX: typeIndicatorTranslate }] },
                  ]}
                />

                <TouchableWithoutFeedback onPress={() => setTipo("Dízimo")}>
                  <View style={styles.segmentItem}>
                    <Text
                      style={[
                        styles.segmentText,
                        tipo === "Dízimo" && styles.segmentTextActive,
                      ]}
                    >
                      Dízimo
                    </Text>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback onPress={() => setTipo("Oferta")}>
                  <View style={styles.segmentItem}>
                    <Text
                      style={[
                        styles.segmentText,
                        tipo === "Oferta" && styles.segmentTextActive,
                      ]}
                    >
                      Oferta
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>

            {/* FILIAL */}
            <Text style={[styles.label, { marginTop: 20 }]}>Filial</Text>

            <View style={[styles.segmentWrap, { width: "100%" }]}>
              <View style={styles.segmentRowFilial}>
                {/* Só mostra o indicador se houver mais de uma filial */}
                {filiaisDisponiveis.length > 1 && (
                  <Animated.View
                    style={[
                      styles.branchIndicator,
                      { 
                        transform: [{ translateX: branchIndicatorTranslate }],
                        width: `${branchIndicatorWidth}%`
                      },
                    ]}
                  />
                )}

                {filiaisDisponiveis.map((item) => (
                  <TouchableWithoutFeedback 
                    key={item} 
                    onPress={() => setFilial(item)}
                    disabled={!!userContext?.branchName} // Desabilita mudança se já tem filial definida
                  >
                    <View style={[
                      styles.branchItem,
                      { width: `${branchIndicatorWidth}%` }
                    ]}>
                      <Text style={[
                        styles.segmentText,
                        filial === item && styles.segmentTextActive
                      ]}>
                        {item}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
            </View>

            {/* VALOR */}
            <Text style={[styles.label, { marginTop: 20 }]}>Valor (R$)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currency}>R$</Text>
              <TextInput
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={styles.input}
                value={valor}
                onChangeText={(t) => {
                  // Permite apenas números, ponto e vírgula
                  const cleaned = t.replace(/[^0-9,.]/g, '');
                  // Substitui vírgula por ponto para cálculo
                  const formatted = cleaned.replace(',', '.');
                  setValor(formatted);
                }}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
            </View>

            {/* BOTÃO PRINCIPAL */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                botaoModo === "copiar" && { backgroundColor: "#0A68FF" },
                copiado && { backgroundColor: "#10B981" },
              ]}
              onPress={botaoPress}
              activeOpacity={0.8}
              disabled={!valor && botaoModo === "gerar"}
            >
              <Animated.View 
                style={[
                  styles.buttonContent,
                  copiado && {
                    transform: [{ scale: successScale }],
                    opacity: successOpacity
                  }
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {botaoModo === "gerar" 
                    ? "📱 GERAR PIX" 
                    : copiado 
                    ? "✅ COPIA REALIZADA!" 
                    : "📋 COPIAR CÓDIGO PIX"}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {payloadGerado && !copiado && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={resetarPIX}
              >
                <Text style={styles.secondaryButtonText}>↻ Gerar Novo PIX</Text>
              </TouchableOpacity>
            )}

            {/* QR CODE */}
            {payloadGerado ? (
              <Animated.View style={[styles.qrWrap, qrStyle]}>
                <View style={styles.qrContainer}>
                  <View style={styles.qrCard}>
                    <QRCode 
                      value={payloadGerado} 
                      size={180} 
                      color="#000"
                      backgroundColor="#FFF"
                    />
                  </View>
                  
                  <Text style={styles.qrInstruction}>
                    📱 Leia com o app do seu banco
                  </Text>
                  
                  <View style={styles.compatibilityInfo}>
                    <Text style={styles.compatibilityText}>
                      ✅ Compatível com: Nubank, Itaú, Santander, Bradesco, Caixa, BB
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  ⬆️ Digite um valor e clique em "GERAR PIX"
                </Text>
                <Text style={styles.emptySubtext}>
                  O código será gerado para copiar e colar no seu banco
                </Text>
              </View>
            )}

            {/* INSTRUÇÕES */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>📋 Como Pagar no Nubank:</Text>
              <View style={styles.instructionStep}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>Abra o app do Nubank</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>Toque em "Pix"</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>Selecione "Pagar com Pix"</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.instructionNumber}>4.</Text>
                <Text style={styles.instructionText}>Escolha "Pix Copia e Cola"</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.instructionNumber}>5.</Text>
                <Text style={styles.instructionText}>Cole o código copiado</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =======================
   ESTILOS
   ======================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 22,
    borderRadius: 20,
    marginBottom: 25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { 
        elevation: 8,
        shadowColor: "#000",
      },
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  /* tipo */
  segmentWrap: {
    backgroundColor: "#F0F2F5",
    padding: 6,
    borderRadius: 14,
    alignItems: "center",
  },
  segmentRow: {
    width: 240,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  segmentItem: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingVertical: 8,
  },
  segmentIndicator: {
    position: "absolute",
    width: 120,
    height: 42,
    backgroundColor: "#a0a0a0ff",
    borderRadius: 12,
    top: 4,
    left: 0,
    zIndex: 1,
  },
  /* filial */
  segmentRowFilial: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  branchItem: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingVertical: 8,
  },
  branchIndicator: {
    position: "absolute",
    height: 42,
    backgroundColor: "#0A68FF",
    borderRadius: 12,
    top: 4,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  segmentTextActive: {
    color: "#000000ff",
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E8EAED",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
  },
  currency: { 
    fontWeight: "700", 
    marginRight: 8, 
    fontSize: 20,
    color: "#111",
  },
  input: { 
    flex: 1, 
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
    paddingVertical: 8,
  },
  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8EAED",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  qrWrap: {
    marginTop: 30,
    alignItems: "center",
  },
  qrContainer: {
    alignItems: "center",
    width: "100%",
  },
  qrCard: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EAED",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { 
        elevation: 6,
        shadowColor: "#000",
      },
    }),
  },
  qrInstruction: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  compatibilityInfo: {
    marginTop: 12,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  compatibilityText: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyState: {
    marginTop: 30,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  instructionsCard: {
    marginTop: 32,
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A68FF",
    marginRight: 12,
    minWidth: 20,
  },
  instructionText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    flex: 1,
  },
});