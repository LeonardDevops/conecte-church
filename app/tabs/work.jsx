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
import { useSharedValue } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from '../../src/Data/contextApi';

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

// Configuração do Calendário para Português
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
  const [openDrawer, setOpenDrawer] = useState(false);
  const [listaTarefas, setListaTarefas] = useState([]);
  const [listaGrupos, setListaGrupos] = useState([]); 
  const [selectedGroupId, setSelectedGroupId] = useState(""); 

  const widthValue = useSharedValue(0);
  const heightValue = useSharedValue(0);

  async function addEvento() {
    if (!selectedDate || evento.trim() === "" || !selectedGroupId) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos!',
      });
      return;
    }

    if (!userContext?.id) {
      Toast.show({ type: 'error', text1: 'Usuário não encontrado!' });
      return;
    }

    await addDoc(collection(db, "tasks"), {
      evento: evento.trim(),
      idUser: userContext.id,
      idTaskOption: selectedGroupId,
      data: selectedDate,
      grupo: selectedGroupId.replace(/^.*\?/, "") 
    })
    .then(() => {
      Toast.show({
        type: 'success',
        text1: 'Tarefa adicionada com sucesso!',
      });
      setEvento('');
      setSelectedGroupId('');
    })
    .catch((error) => {
      console.log('Erro ao adicionar tarefa:', error);
      Toast.show({ type: 'error', text1: 'Erro ao adicionar tarefa' });
    });
  }

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user)=> {
      if (user) {
      async function getGrupos() {
    
          const uid = user.uid;
          console.log(uid); 
          
          
          
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
    getGrupos();
  } else {
    alert("usuario nao tem permissao")
  }

 
})
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* CARD DE INPUT PRINCIPAL */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>O que precisa ser feito?</Text>
          <View style={styles.actionRow}>
            <TextInput
              onChangeText={(e) => setEvento(e)}
              value={evento}
              placeholder="Digite a tarefa..."
              placeholderTextColor="#999"
              style={styles.textInput}
            />
            <TouchableOpacity onPress={addEvento} style={styles.addButton} activeOpacity={0.7}>
              <Feather name="check-circle" size={normalize(24)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ÁREA DO SELETOR DE CATEGORIA */}
        <View style={styles.pickerSection}>
          <Text style={styles.label}>Categoria / Grupo</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              onValueChange={(itemValue) => setSelectedGroupId(itemValue)}
              style={styles.pickerStyle}
              dropdownIconColor="#000"
              mode="dropdown"
            >
              <Picker.Item label='Selecione uma opção...' value='' color="#dddddd"/>
              {listaGrupos.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={item.taskOption}
                  value={item.id}
                  color="#dddddd"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* CALENDÁRIO PROFISSIONAL */}
        <View style={styles.calendarCard}>
          <Text style={styles.label}>Data da Atividade</Text>
          <Calendar
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#000',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00a516',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#000',
              monthTextColor: '#000',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: normalize(14),
              textMonthFontSize: normalize(16),
              textDayHeaderFontSize: normalize(12)
            }}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { 
                selected: true, 
                disableTouchEvent: true, 
                selectedColor: '#000' 
              }
            }}
          />
        </View>

      </ScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: width * 0.05,
  },
  label: {
    fontSize: normalize(12),
    fontWeight: '800',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: normalize(50),
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: normalize(15),
    color: '#000',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addButton: {
    width: normalize(50),
    height: normalize(50),
    backgroundColor: '#00a516',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    height: normalize(55),
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  pickerStyle: {
    width: '100%',
    color: '#000',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 30,
  },
});