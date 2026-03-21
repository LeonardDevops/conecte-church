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
        // Verifica se o ID do usuário existe para evitar erro na query
        if (!userContext?.id) return;

        const q = query(
            collection(db, "tasks"),
            where("idUser", "==", userContext.id),
        );

        // Listener em tempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                });
            });

            // Ordenação segura: do mais recente para o mais antigo
            list.sort((a, b) => {
                const dateA = new Date(a.data);
                const dateB = new Date(b.data);
                return dateB - dateA;
            });

            setTasks(list);
        }, (error) => {
            console.error("Erro no listener de tarefas:", error);
        });

        return () => unsubscribe();
    }, [userContext?.id]);

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
                            Alert.alert("Erro", "Não foi possível excluir a tarefa.");
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Indicador lateral usando sua cor principal #0072B1 */}
            <View style={styles.groupIndicator} />
            
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.grupoText}>{item.grupo || "Geral"}</Text>
                    <Text style={styles.dataText}>{item.data}</Text>
                </View>
                
                <Text style={styles.eventoText} numberOfLines={2}>
                    {item.evento}
                </Text>
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
                <Text style={styles.subtitle}>
                    {tasks.length === 1 ? "1 tarefa encontrada" : `${tasks.length} tarefas encontradas`}
                </Text>
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
                        <FontAwesome5 name="calendar-check" size={normalize(60)} color="#E0E0E0" />
                        <Text style={styles.emptyText}>Sua agenda está vazia!</Text>
                        <Text style={styles.emptySubText}>Tudo em dia por aqui.</Text>
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
    },
    headerContainer: {
        paddingHorizontal: normalize(20),
        paddingTop: normalize(30),
        marginBottom: normalize(15),
    },
    title: {
        fontSize: normalize(26),
        fontWeight: '900',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: normalize(13),
        color: '#888',
        fontWeight: '500',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: normalize(15),
        paddingBottom: 40,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(12),
        paddingVertical: normalize(14),
        paddingHorizontal: normalize(15),
        // Sombras suaves e profissionais
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    groupIndicator: {
        width: 4,
        height: '80%',
        backgroundColor: '#0072B1', // Sua cor de identidade
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
        marginBottom: 6,
    },
    grupoText: {
        color: '#0072B1', 
        fontSize: normalize(11),
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    dataText: {
        color: '#999',
        fontSize: normalize(11),
        fontWeight: '600',
    },
    eventoText: {
        color: '#333',
        fontSize: normalize(16),
        fontWeight: '700',
        lineHeight: 22,
    },
    deleteBtn: {
        width: normalize(40),
        height: normalize(40),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        marginLeft: 10,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyBox: {
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: normalize(18),
        color: '#444',
        marginTop: 20,
        fontWeight: 'bold',
    },
    emptySubText: {
        fontSize: normalize(14),
        color: '#AAA',
        marginTop: 5,
    },
});