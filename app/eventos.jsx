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
  Dimensions,
  FlatList,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppContext } from '../src/Data/contextApi';
import { db } from "../src/Data/FirebaseConfig";

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

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

            // Ordenar por data (opcional, mas recomendado para profissionalismo)
            list.sort((a, b) => new Date(a.data) - new Date(b.data));
            setTasks(list);
        });

        return () => unsubscribe();
    }, [userContext.id]);

    const handleDelete = (id) => {
        Alert.alert(
            "Excluir Tarefa",
            "Deseja remover este item da sua agenda?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "tasks", id));
                        } catch (e) {
                            console.error("Erro ao deletar", e);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Indicador lateral colorido baseado no grupo */}
            <View style={styles.groupIndicator} />
            
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.grupoText}>{item.grupo}</Text>
                    <Text style={styles.dataText}>{item.data}</Text>
                </View>
                
                <Text style={styles.eventoText}>{item.evento}</Text>
            </View>

            <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleDelete(item.id)}
                activeOpacity={0.6}
            >
                <FontAwesome5 name="trash-alt" size={normalize(18)} color="#FF5252" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.body}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Minha Agenda</Text>
                <Text style={styles.subtitle}>{tasks.length} tarefas encontradas</Text>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    tasks.length === 0 && styles.emptyContainer
                ]}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <FontAwesome5 name="clipboard-check" size={50} color="#DDD" />
                        <Text style={styles.emptyText}>Tudo em dia por aqui!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: '#F8F9FB',
        paddingTop: normalize(20),
    },
    headerContainer: {
        paddingHorizontal: normalize(20),
        marginBottom: normalize(20),
    },
    title: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: normalize(13),
        color: '#888',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: normalize(15),
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(12),
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(15),
        // Sombras profissionais
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    groupIndicator: {
        width: 4,
        height: '70%',
        backgroundColor: '#000', // Pode variar conforme o grupo se desejar
        borderRadius: 10,
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    grupoText: {
        color: '#007AFF', // Azul sistema profissional
        fontSize: normalize(11),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dataText: {
        color: '#999',
        fontSize: normalize(11),
        fontWeight: '600',
    },
    eventoText: {
        color: '#333',
        fontSize: normalize(16),
        fontWeight: '600',
    },
    deleteBtn: {
        width: normalize(40),
        height: normalize(40),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        marginLeft: 10,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyBox: {
        alignItems: 'center',
        opacity: 0.6,
    },
    emptyText: {
        fontSize: normalize(16),
        color: '#999',
        marginTop: 15,
        fontWeight: '500',
    },
});