import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Image, Keyboard, Linking,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { db } from '../src/Data/FirebaseConfig';
import EditVersion from './EditVersion';

const YOUTUBE_API_KEY = 'AIzaSyAJO7N99LkL7w5L2iEVIefA4MnoEt05PN0';

export default function MusicManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [videos, setVideos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    Keyboard.dismiss();
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=15&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      setSearchResults(data.items.map(item => ({
        youtubeId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      })));
    } catch (error) {
      Alert.alert("Erro", "Falha na busca.");
    } finally {
      setSearching(false);
    }
  };

  // FUNÇÃO PARA GERAR LINKS DIRETOS
  const openExternalLink = (title, type) => {
    // Limpa o título de lixos comuns do YouTube para melhorar a precisão
    const cleanTitle = title
      .replace(/clipe oficial|official video|video oficial|live|ao vivo|[-|]/gi, '')
      .trim();
    
    const queryBusca = encodeURIComponent(cleanTitle);
    
    let url = '';
    if (type === 'letra') {
      // Busca direta no Letras.mus.br via Google (mais estável que adivinhar a URL)
      url = `https://www.google.com/search?q=${queryBusca}+site:letras.mus.br`;
    } else {
      // Busca direta no Cifra Club via Google
      url = `https://www.google.com/search?q=${queryBusca}+site:cifraclub.com.br`;
    }
    
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={styles.headerBg}>
          <View style={styles.header}>
            <Text style={styles.title}>Meu Repertório</Text>
            <View style={styles.searchBar}>
              <TextInput 
                style={styles.input} 
                placeholder="Buscar no YouTube..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} style={styles.btnBusca}>
                {searching ? <ActivityIndicator color="#fff"/> : <MaterialCommunityIcons name="magnify" size={24} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsArea}>
            {searchResults.map((item) => (
              <TouchableOpacity key={item.youtubeId} style={styles.resItem} onPress={() => { setSelectedVideo(item); setIsEditVisible(true); }}>
                <Image source={{ uri: item.thumbnail }} style={styles.resThumb} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={{color: '#fff', fontSize: 13}} numberOfLines={1}>{item.title}</Text>
                  <Text style={{color: '#0072B1', fontSize: 11, fontWeight: 'bold'}}>+ ADICIONAR À ESCALA</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSearchResults([])}><Text style={styles.closeTxt}>Fechar Resultados</Text></TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Músicas da Escala</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft: 20, paddingBottom: 30}}>
          {videos.map((item) => (
            <View key={item.id} style={styles.cardRep}>
              
              <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                <Image source={{ uri: item.thumbnail }} style={styles.cardCover} />
                <View style={styles.playIcon}>
                   <MaterialCommunityIcons name="play" size={30} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.configBtn} 
                onPress={() => { setSelectedVideo(item); setIsEditVisible(true); }}
              >
                <MaterialCommunityIcons name="cog-outline" size={28} color="#0072B1" />
              </TouchableOpacity>

              <View style={styles.cardContent}>
                <Text style={styles.cardVersao}>{item.versao} • {item.bpm} BPM</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTom}>{item.tone}</Text>
                  <View style={styles.btnGroup}>
                    {/* BOTÕES COM LÓGICA DE LINK MELHORADA */}
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => openExternalLink(item.title, 'letra')}
                    >
                      <Text style={styles.btnText}>LETRA</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionBtn, {backgroundColor: '#333'}]} 
                      onPress={() => openExternalLink(item.title, 'cifra')}
                    >
                      <Text style={styles.btnText}>CIFRA</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* O Modal deve ficar fora da ScrollView para evitar bugs de profundidade */}
      <EditVersion 
        visible={isEditVisible} 
        videoData={selectedVideo} 
        onClose={() => { setIsEditVisible(false); setSelectedVideo(null); }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  headerBg: { backgroundColor: '#F2F4F7', paddingBottom: 10 },
  header: { paddingHorizontal: 20, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, color: '#1A1A1A' },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  input: { flex: 1, height: 45, paddingHorizontal: 15 },
  btnBusca: { backgroundColor: '#0072B1', width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resultsArea: { backgroundColor: '#1A1A1A', margin: 15, borderRadius: 20, padding: 15 },
  resItem: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  resThumb: { width: 70, height: 45, borderRadius: 8 },
  closeTxt: { color: '#FF4444', textAlign: 'center', fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 20, color: '#444' },
  cardRep: { width: 280, backgroundColor: '#FFF', borderRadius: 25, marginRight: 15, elevation: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  cardCover: { width: '100%', height: 140 },
  playIcon: { position: 'absolute', top: 50, left: 120, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 30, padding: 5 },
  configBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 5, elevation: 3 },
  cardContent: { padding: 15 },
  cardVersao: { fontSize: 10, color: '#999', fontWeight: 'bold', textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginVertical: 5, color: '#222' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardTom: { color: '#0072B1', fontWeight: '900', fontSize: 20 },
  btnGroup: { flexDirection: 'row' },
  actionBtn: { backgroundColor: '#0072B1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 6 },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' }
});