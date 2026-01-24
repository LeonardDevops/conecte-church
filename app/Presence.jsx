import { CameraView, useCameraPermissions } from 'expo-camera';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../src/Data/FirebaseConfig';

const { width } = Dimensions.get('window');

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMonitor, setIsMonitor] = useState(null); // null = carregando, false = negado

  // 1. Verifica se o usuário logado é Monitor ao montar o componente
  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().atribuicao === 'monitor') {
            setIsMonitor(true);
          } else {
            setIsMonitor(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar atribuição:", error);
        setIsMonitor(false);
      }
    };
    checkRole();
  }, []);

  // Tela de carregamento enquanto checa permissão e papel (role)
  if (isMonitor === null || !permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando credenciais...</Text>
      </View>
    );
  }

  // Se não for monitor, bloqueia o acesso
  if (isMonitor === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Acesso Negado</Text>
        <Text>Apenas usuários com atribuição "Monitor" podem acessar esta tela.</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Precisamos de permissão para abrir a câmera</Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    try {
      const emailLido = data.trim().toLowerCase();
      
      // Consulta se o email lido existe na coleção 'users'
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailLido));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Não encontrado", "Este e-mail não corresponde a um usuário cadastrado.");
      } else {
        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;

        // Grava a presença
        await addDoc(collection(db, "presence"), {
          userId: userId,
          userName: userData.name,
          branchName: userData.branchName,
          scannedBy: auth.currentUser.uid, // Opcional: ID do monitor que leu
          timestamp: serverTimestamp(),
          date: new Date().toISOString().split('T')[0] // Data útil para filtros rápidos
        });

        Alert.alert("Sucesso", `Presença registrada: ${userData.name}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na comunicação com o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeSettings={{ barcodeTypes: ["qr"] }}
      />
      
      {/* UI Overlay */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}>
             <Text style={styles.topText}>Posicione o QR Code do Aluno</Text>
        </View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer} />
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
             {scanned && (
                <View style={styles.buttonRetry}>
                    <Button title={'Escanear Próximo'} onPress={() => setScanned(false)} color="#00FF00" />
                </View>
             )}
             {loading && <ActivityIndicator size="large" color="#fff" />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  middleContainer: { flexDirection: 'row', height: width * 0.7 },
  focusedContainer: { width: width * 0.7, borderWidth: 2, borderColor: '#00FF00', backgroundColor: 'transparent', borderRadius: 15 },
  topText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  errorText: { fontSize: 22, fontWeight: 'bold', color: 'red', marginBottom: 10 },
  buttonRetry: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 10 }
});