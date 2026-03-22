import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  addDoc, collection,
  doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { db } from '../src/Data/FirebaseConfig';

export default function EditVersion({ visible, videoData, onClose }) {
  const [versao, setVersao] = useState('');
  const [tom, setTom] = useState('');
  const [bpm, setBpm] = useState('');

  useEffect(() => {
    if (visible && videoData) {
      setVersao(videoData.versao || '');
      setTom(videoData.tone || '');
      setBpm(videoData.bpm || '');
    }
  }, [visible, videoData]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!versao || !tom) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha a Versão e o Tom.");
      return;
    }

    try {
      const title = videoData?.title || "Sem Título";
      const cleanTitle = title.split('(')[0].split('[')[0].trim();
      const queryBusca = encodeURIComponent(cleanTitle);

      const musicData = {
        youtubeId: videoData.youtubeId,
        title: title,
        thumbnail: videoData.thumbnail || '',
        versao,
        tone: tom.toUpperCase(),
        bpm: bpm || '---',
        linkLetra: `https://www.google.com/search?q=${queryBusca}+letras.mus.br`,
        linkCifra: `https://www.google.com/search?q=${queryBusca}+cifra+club`,
        url: `https://www.youtube.com/watch?v=${videoData.youtubeId}`,
        updatedAt: serverTimestamp(),
      };

      if (videoData.id) {
        await updateDoc(doc(db, "videos", videoData.id), musicData);
      } else {
        await addDoc(collection(db, "videos"), { ...musicData, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            // 'padding' no iOS e um comportamento manual ou 'height' no Android costumam funcionar melhor em modais full
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.modalContainer}
          >
            <View style={styles.dragHandle} />
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.modalTitle}>Nova Música</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <MaterialCommunityIcons name="close" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                keyboardShouldPersistTaps="handled"
                // Garante que o conteúdo role para cima do teclado
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.form}>
                  <Text style={styles.label}>NOME DA VERSÃO / ARRANJO</Text>
                  <View style={styles.inputBox}>
                    <MaterialCommunityIcons name="music-box-outline" size={20} color="#999" style={{marginRight: 10}} />
                    <TextInput 
                      style={styles.input} 
                      value={versao} 
                      onChangeText={setVersao} 
                      placeholder="Ex: Versão Piano, Adoração 2024..." 
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={{flex: 1, marginRight: 15}}>
                      <Text style={styles.label}>TOM PRINCIPAL</Text>
                      <View style={styles.inputBox}>
                        <MaterialCommunityIcons name="music-clef-treble" size={20} color="#999" style={{marginRight: 10}} />
                        <TextInput 
                          style={styles.input} 
                          value={tom} 
                          onChangeText={setTom} 
                          placeholder="G" 
                          autoCapitalize="characters" 
                        />
                      </View>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.label}>BPM (TEMPO)</Text>
                      <View style={styles.inputBox}>
                        <MaterialCommunityIcons name="metronome" size={20} color="#999" style={{marginRight: 10}} />
                        <TextInput 
                          style={styles.input} 
                          value={bpm} 
                          onChangeText={setBpm} 
                          placeholder="72" 
                          keyboardType="numeric" 
                        />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.btnSaveText}>Confirmar Alterações</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContainer: { 
    backgroundColor: '#F8F9FA', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    width: '100%', 
    // AJUSTE: Altura mínima para ocupar quase a tela toda e evitar o teclado
    minHeight: '90%', 
    maxHeight: '94%' 
  },
  dragHandle: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#DDD', 
    borderRadius: 10, 
    alignSelf: 'center', 
    marginTop: 12 
  },
  content: { 
    flex: 1, 
    padding: 24 
  },
  scrollContent: { 
    // AJUSTE: Preenchimento inferior extra para o scroll conseguir subir os campos do final
    paddingBottom: Platform.OS === 'ios' ? 150 : 200, 
    flexGrow: 1 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1A1A1A' 
  },
  closeBtn: { 
    backgroundColor: '#EEE', 
    padding: 8, 
    borderRadius: 12 
  },
  label: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#888', 
    marginBottom: 8, 
    letterSpacing: 0.5 
  },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    paddingHorizontal: 15, 
    height: 60, 
    marginBottom: 20 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#333' 
  },
  row: { 
    flexDirection: 'row' 
  },
  btnSave: { 
    backgroundColor: '#0072B1', 
    height: 60, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  btnSaveText: { 
    color: '#FFF', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
});