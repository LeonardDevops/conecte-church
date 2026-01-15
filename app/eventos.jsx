import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppContext } from '../src/Data/contextApi';
import { db } from "../src/Data/FirebaseConfig";

export default function Tasks() {

  const [tasks, setTasks] = useState([]);
  const { userContext } = useContext(AppContext);

  useEffect(() => {
    if (!userContext?.id) return;

    const q = query(
      collection(db, "tasks"),
      where("idUser", "==", userContext.id),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];

      querySnapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      setTasks(list);
    });

    return () => unsubscribe();
  }, [userContext.id]);

  const handleDelete = (id) => {
    Alert.alert(
      "Excluir tarefa",
      "Tem certeza que deseja excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "tasks", id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.containerEventos}>
      <View style={styles.infoContainer}>
        <Text style={styles.grupo}>{item.grupo}</Text>
        <Text style={styles.evento}>{item.evento}</Text>
        <Text style={styles.data}>{item.data}</Text>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <FontAwesome5 name="trash" size={22} color="#ff4d4d" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.bodyEventos}>
      <Text style={styles.title}>📝 Minhas Tarefas</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          tasks.length === 0 && styles.emptyContainer
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma tarefa cadastrada
          </Text>
        }
      />
    </View>
  );
}



const styles = StyleSheet.create({
  bodyEventos: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  containerEventos: {
    backgroundColor: '#1c1c1c',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  infoContainer: {
    flex: 1,
  },

  grupo: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  evento: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },

  data: {
    color: '#ccc',
    fontSize: 13,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
