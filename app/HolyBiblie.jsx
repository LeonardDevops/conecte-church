import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

// Mapeamento necessário para a API (URL em inglês / Conteúdo em PT)
const BIBLE_MAP = {
    "Gênesis": "Genesis", "Êxodo": "Exodus", "Levítico": "Leviticus", "Números": "Numbers",
    "Deuteronômio": "Deuteronomy", "Josué": "Joshua", "Juízes": "Judges", "Rute": "Ruth",
    "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel", "1 Reis": "1 Kings", "2 Reis": "2 Kings",
    "1 Crônicas": "1 Chronicles", "2 Crônicas": "2 Chronicles", "Esdras": "Ezra",
    "Neemias": "Nehemiah", "Ester": "Esther", "Jó": "Job", "Salmos": "Psalms",
    "Provérbios": "Proverbs", "Eclesiastes": "Ecclesiastes", "Cânticos": "Song of Solomon",
    "Isaías": "Isaiah", "Jeremias": "Jeremiah", "Lamentações": "Lamentations",
    "Ezequiel": "Ezekiel", "Daniel": "Daniel", "Oseias": "Hosea", "Joel": "Joel",
    "Amós": "Amos", "Obadias": "Obadiah", "Jonas": "Jonah", "Miqueias": "Micah",
    "Naum": "Nahum", "Habacuque": "Habakkuk", "Sofonias": "Zephaniah", "Ageu": "Haggai",
    "Zacarias": "Zechariah", "Malaquias": "Malachi", "Mateus": "Matthew", "Marcos": "Mark",
    "Lucas": "Luke", "João": "John", "Atos": "Acts", "Romanos": "Romans",
    "1 Coríntios": "1 Corinthians", "2 Coríntios": "2 Corinthians", "Gálatas": "Galatians",
    "Efésios": "Ephesians", "Filipenses": "Philippians", "Colossenses": "Colossians",
    "1 Tessalonicenses": "1 Thessalonians", "2 Tessalonicenses": "2 Thessalonians",
    "1 Timóteo": "1 Timothy", "2 Timóteo": "2 Timothy", "Tito": "Titus",
    "Filemom": "Philemon", "Hebreus": "Hebrews", "Tiago": "James", "1 Pedro": "1 Peter",
    "2 Pedro": "2 Peter", "1 João": "1 John", "2 João": "2 John", "3 João": "3 John",
    "Judas": "Judas", "Apocalipse": "Revelation"
};

const LIVROS_LISTA = Object.keys(BIBLE_MAP);

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

    const fetchBible = async (bookInput, chapterInput) => {
        if (!bookInput) return;
        setLoading(true);

        try {
            // Lógica para separar "Mateus 5" em livro e capítulo
            let bookSearch = bookInput.trim();
            let chapterSearch = chapterInput;

            const parts = bookSearch.split(' ');
            if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
                chapterSearch = parts.pop();
                bookSearch = parts.join(' ');
            }

            // Traduz o nome para o termo que a API entende
            const apiBook = BIBLE_MAP[bookSearch] || bookSearch;

            const response = await fetch(`https://bible-api.com/${apiBook} ${chapterSearch}?translation=almeida`);
            const data = await response.json();

            if (data && data.verses && data.verses.length > 0) {
                setContent(data.verses);
                setDisplayRef(data.reference);
                setCurrentBook(bookSearch);
                setCurrentChapter(parseInt(chapterSearch));
                setHighlightedVerses([]);
                
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({ y: 0, animated: true });
                }
            } else {
                Alert.alert("Aviso", "Não encontramos esta passagem. Tente o nome correto do livro.");
            }
        } catch (error) {
            Alert.alert("Erro", "Verifique sua conexão com a internet.");
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
                        <MaterialCommunityIcons name="magnify" size={24} color="#0072B1" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.iconBtn} 
                    onPress={() => setModalVisible(true)}
                >
                    <MaterialCommunityIcons name="book-open-variant" size={30} color="#0072B1" />
                    <Text style={[styles.btnLabel, {color: '#0072B1'}]}>LIVROS</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.titleArea}>
                <Text style={styles.refText}>{displayRef || "Carregando..."}</Text>
                <Text style={styles.subLabel}>Toque no versículo para destacar</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0072B1" />
                </View>
            ) : (
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.bibleScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {content.map((v, i) => (
                        <TouchableOpacity
                            key={`${currentBook}-${currentChapter}-${i}`}
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

            <View style={styles.footerNav}>
                <TouchableOpacity 
                    onPress={() => fetchBible(currentBook, currentChapter - 1)} 
                    disabled={currentChapter <= 1}
                >
                    <MaterialCommunityIcons 
                        name="chevron-left" 
                        size={45} 
                        color={currentChapter <= 1 ? "#CCC" : "#0072B1"} 
                    />
                </TouchableOpacity>

                <View style={styles.chapterBadge}>
                    <Text style={styles.chapterBadgeText}>Cap. {currentChapter}</Text>
                </View>

                <TouchableOpacity 
                    onPress={() => fetchBible(currentBook, currentChapter + 1)}
                >
                    <MaterialCommunityIcons name="chevron-right" size={45} color="#0072B1" />
                </TouchableOpacity>
            </View>

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
                                <MaterialCommunityIcons name="close-circle" size={35} color="#0072B1" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={LIVROS_LISTA}
                            keyExtractor={(item) => item}
                            numColumns={2}
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
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10 },
    searchContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, height: 48, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    iconBtn: { alignItems: 'center' },
    btnLabel: { fontSize: 9, fontWeight: 'bold' },
    titleArea: { paddingHorizontal: 20, marginVertical: 10 },
    refText: { fontSize: normalize(26), fontWeight: '900', color: '#0072B1' },
    subLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
    bibleScroll: { paddingHorizontal: 20, paddingBottom: 140 },
    verseBox: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
    highlightedBox: { backgroundColor: '#E3F2FD' }, // Azul bem clarinho para o destaque
    verseText: { fontSize: normalize(18), lineHeight: 30, color: '#333' },
    verseNum: { fontWeight: 'bold', color: '#0072B1', fontSize: 14 },
    footerNav: { position: 'absolute', bottom: 30, left: 30, right: 30, height: 65, backgroundColor: '#FFF', borderRadius: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    chapterBadge: { backgroundColor: '#0072B1', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    chapterBadgeText: { color: '#FFF', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFF', height: height * 0.8, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#0072B1' },
    bookItem: { flex: 1, margin: 5, height: 50, backgroundColor: '#F9F9F9', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
    bookItemText: { fontSize: 13, fontWeight: 'bold', color: '#444' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});