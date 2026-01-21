import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Importação correta para evitar o aviso de Deprecated
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const LIVROS = ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"];

export default function BibliaInterativa() {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState([]);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentBook, setCurrentBook] = useState('João');
    const [currentChapter, setCurrentChapter] = useState(1);
    const [displayRef, setDisplayRef] = useState('');
    const [highlightedVerses, setHighlightedVerses] = useState([]);

    const scrollRef = useRef(null);

    const fetchBible = async (book, chapter) => {
        if (!book) return;
        setLoading(true);
        try {
            const cleanBook = book.trim();
            // Usando tradução almeida para português
            const response = await fetch(`https://bible-api.com/${cleanBook} ${chapter}?translation=almeida`);
            const data = await response.json();

            if (data && data.verses && data.verses.length > 0) {
                setContent(data.verses);
                setDisplayRef(data.reference);
                setCurrentBook(cleanBook);
                setCurrentChapter(parseInt(chapter));
                setHighlightedVerses([]);
                
                // Scroll suave para o topo
                setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                }, 200);
            } else {
                Alert.alert("Aviso", "Não encontramos esta passagem.");
            }
        } catch (error) {
            Alert.alert("Erro", "Erro ao carregar dados. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBible('João', 1);
    }, []);

    const toggleHighlight = (index) => {
        setHighlightedVerses(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* BARRA DE BUSCA */}
            <View style={styles.topBar}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ex: Mateus 5"
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={() => { fetchBible(search, 1); setSearch(''); }}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={() => { fetchBible(search, 1); setSearch(''); }}>
                        <MaterialCommunityIcons name="magnify" size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.iconBtn} 
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="book-open-variant" size={30} color="#000" />
                    <Text style={styles.btnLabel}>LIVROS</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.titleArea}>
                <Text style={styles.refText}>{displayRef || "Carregando..."}</Text>
                <Text style={styles.subLabel}>Toque no versículo para destacar</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.bibleScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {content.map((v, i) => (
                        <TouchableOpacity
                            key={`v-${currentBook}-${currentChapter}-${i}`}
                            activeOpacity={0.8}
                            onPress={() => toggleHighlight(i)}
                            style={[
                                styles.verseBox, 
                                highlightedVerses.includes(i) && styles.highlightedBox
                            ]}
                        >
                            <Text style={styles.verseText}>
                                <Text style={styles.verseNum}>{v.verse} </Text>
                                {v.text.trim()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* NAVEGAÇÃO INFERIOR */}
            <View style={styles.footerNav}>
                <TouchableOpacity 
                    onPress={() => fetchBible(currentBook, currentChapter - 1)} 
                    disabled={currentChapter <= 1}
                    style={styles.navAction}
                >
                    <MaterialCommunityIcons 
                        name="chevron-left" 
                        size={40} 
                        color={currentChapter <= 1 ? "#CCC" : "#000"} 
                    />
                </TouchableOpacity>

                <View style={styles.chapterBadge}>
                    <Text style={styles.chapterBadgeText}>Capítulo {currentChapter}</Text>
                </View>

                <TouchableOpacity 
                    onPress={() => fetchBible(currentBook, currentChapter + 1)}
                    style={styles.navAction}
                >
                    <MaterialCommunityIcons name="chevron-right" size={40} color="#000" />
                </TouchableOpacity>
            </View>

            {/* SELETOR DE LIVROS */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Escolha um Livro</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close-circle" size={35} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={LIVROS}
                            keyExtractor={(item) => item}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.bookItem}
                                    onPress={() => {
                                        setModalVisible(false);
                                        fetchBible(item, 1);
                                    }}
                                >
                                    <Text style={styles.bookItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#FFF'
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        alignItems: 'center',
        marginRight: 10
    },
    searchInput: { flex: 1, fontSize: 16, color: '#000' },
    iconBtn: { alignItems: 'center', justifyContent: 'center' },
    btnLabel: { fontSize: 9, fontWeight: 'bold', marginTop: -2 },
    titleArea: { paddingHorizontal: 20, marginVertical: 10 },
    refText: { fontSize: normalize(26), fontWeight: '900', color: '#1a1a1a' },
    subLabel: { fontSize: 11, color: '#999', marginTop: 4, textTransform: 'uppercase' },
    bibleScroll: { paddingHorizontal: 20, paddingBottom: 120 },
    verseBox: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4 },
    highlightedBox: { backgroundColor: '#FFF9C4' },
    verseText: { fontSize: normalize(18), lineHeight: 28, color: '#333', textAlign: 'justify' },
    verseNum: { fontWeight: 'bold', color: '#BBB', fontSize: 14 },
    footerNav: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#FFF',
        borderRadius: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    navAction: { padding: 5 },
    chapterBadge: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    chapterBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContainer: { 
        backgroundColor: '#FFF', 
        width: '100%', 
        height: height * 0.75, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        padding: 20 
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    bookItem: {
        flex: 1,
        margin: 6,
        height: 55,
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE'
    },
    bookItemText: { fontSize: 14, fontWeight: '700', color: '#444' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});