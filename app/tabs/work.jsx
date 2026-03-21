import Feather from '@expo/vector-icons/Feather';
import { Picker } from "@react-native-picker/picker";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from '../../src/Data/contextApi';

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar.','Abr.','Mai.','Jun.','Jul.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Work() {
  const { userContext } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState("");
  const [evento, setEvento] = useState(""); 
  const [listaGrupos, setListaGrupos] = useState([]); 
  const [selectedGroupId, setSelectedGroupId] = useState(""); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchGrupos();
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchGrupos() {
    try {
      const snapshot = await getDocs(collection(db, 'tasksOpitions'));
      const data = [];
      snapshot.forEach((doc) => {
        const options = doc.data().options || [];
        options.forEach((option) => {
          data.push({
            id: `${doc.id}?${option}`,
            taskOption: option
          });
        });
      });
      setListaGrupos(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  }

  async function addEvento() {
    if (!selectedDate || evento.trim() === "" || !selectedGroupId) {
      return Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha todos os campos!' });
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        evento: evento.trim(),
        idUser: userContext?.uid || getAuth().currentUser?.uid,
        idTaskOption: selectedGroupId,
        data: selectedDate,
        grupo: selectedGroupId.split('?')[1], 
        createdAt: new Date()
      });

      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Tarefa agendada com sucesso.' });
      setEvento('');
      setSelectedGroupId('');
      setSelectedDate('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <View style={styles.headerSpacer}>
          <Text style={styles.headerTitle}>Nova Atividade</Text>
          <Text style={styles.headerSubtitle}>Organize suas tarefas ministeriais</Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Descrição da Tarefa</Text>
          <View style={styles.actionRow}>
            <TextInput
              onChangeText={setEvento}
              value={evento}
              placeholder="O que será feito?"
              placeholderTextColor="#ADB5BD"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.pickerSection}>
          <Text style={styles.label}>Departamento / Grupo</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              onValueChange={(v) => setSelectedGroupId(v)}
              style={styles.pickerStyle}
              dropdownIconColor="#0072B1"
            >
              <Picker.Item label='Selecione o grupo...' value='' color="#999" />
              {listaGrupos.map((item) => (
                <Picker.Item key={item.id} label={item.taskOption} value={item.id} color="#444" />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.label}>Data Selecionada: {selectedDate || 'Nenhuma'}</Text>
          <Calendar
            theme={{
              todayTextColor: '#0072B1',
              selectedDayBackgroundColor: '#0072B1',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#0072B1',
              monthTextColor: '#1A1A1A',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#0072B1' }
            }}
          />
        </View>

        <TouchableOpacity 
          onPress={addEvento} 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Agendar Atividade</Text>
          <Feather name="calendar" size={18} color="#fff" />
        </TouchableOpacity>
          <View>

          </View>

      </ScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FB', paddingHorizontal: width * 0.06 },
  headerSpacer: { marginTop: 15, marginBottom: 20 },
  headerTitle: { fontSize: normalize(22), fontWeight: '900', color: '#1A1A1A' },
  headerSubtitle: { fontSize: normalize(14), color: '#888' },
  label: { fontSize: normalize(11), fontWeight: '800', color: '#495057', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  inputCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  textInput: { height: normalize(55), backgroundColor: '#F1F3F5', borderRadius: 14, paddingHorizontal: 15, fontSize: normalize(15), color: '#000' },
  pickerSection: { marginBottom: 20 },
  pickerWrapper: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E9ECEF', height: normalize(55), justifyContent: 'center' },
  pickerStyle: { width: '100%' },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, padding: 12, elevation: 2, shadowOpacity: 0.05, marginBottom: 10 },
  saveButton: { backgroundColor: '#0072B1', height: normalize(58), borderRadius: 16, marginBottom: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' }
});