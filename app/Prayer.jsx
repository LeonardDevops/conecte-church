import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where
} from 'firebase/firestore';
// 1. Importe o useContext
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView,
  Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { db } from '../src/Data/FirebaseConfig';
// 2. Importe o seu AppContext (ajuste o caminho se necessário)
import { AppContext } from '../src/Data/contextApi';

export default function Prayer() { // Removido o parâmetro userName fixo
  const [text, setText] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();0

  // 3. Pegue o userContext do seu Provider
  const { userContext } = useContext(AppContext);
  
  // Define um nome padrão caso o usuário não esteja logado ou o nome esteja nulo
  const currentUserName = userContext?.name || "Visitante";

  useEffect(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Verifique se a regra no Firebase é 'prayer' ou 'prayers' e mantenha igual aqui
    const q = query(
      collection(db, "prayer"),
      where("createdAt", ">=", oneWeekAgo),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar orações:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "prayer"), {
        userName: currentUserName, // 4. Usa o nome vindo do contexto
        userId: userContext?.id || null, // É bom salvar o ID também para controle
        message: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText('');
      Keyboard.dismiss();
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageRow}>
      <View style={styles.balloon}>
        <Text style={styles.userLabel}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timeText}>
          {item.createdAt?.toDate ? 
            item.createdAt.toDate().toLocaleDateString('pt-BR', {hour: '2-digit', minute:'2-digit'}) 
            : 'Enviando...'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0072B1" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={requests}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder={`Pedir oração como ${currentUserName}...`}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <MaterialCommunityIcons name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ... Estilos (os mesmos que você já possui)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5DDD5' },
  listContent: { padding: 15, paddingBottom: 20 },
  messageRow: { marginBottom: 10, alignItems: 'flex-start' },
  balloon: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderTopLeftRadius: 2,
    padding: 10,
    maxWidth: '85%',
    elevation: 1,
  },
  userLabel: { fontSize: 12, fontWeight: 'bold', color: '#0072B1', marginBottom: 2 },
  messageText: { fontSize: 15, color: '#333' },
  timeText: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 4 },
  inputArea: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  sendBtn: {
    backgroundColor: '#0072B1',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});