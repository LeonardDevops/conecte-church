import Feather from '@expo/vector-icons/Feather';
import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useSharedValue } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { db } from "../../src/Data/FirebaseConfig";
import { AppContext } from '../../src/Data/contextApi';

const { width, height } = Dimensions.get("window");

export default function Work() {

  const { userContext } = useContext(AppContext);

  const [selectedDate, setSelectedDate] = useState("");
  const [evento, setEvento] = useState(""); // ✅ string
  const [openDrawer, setOpenDrawer] = useState(false);
  const [listaTarefas, setListaTarefas] = useState([]);
  const [listaGrupos, setListaGrupos] = useState([]); // ✅ grupos
  const [selectedGroupId, setSelectedGroupId] = useState(""); // ✅ agora é o id do grupo

  const widthValue = useSharedValue(0);
  const heightValue = useSharedValue(0);

  async function addEvento() {

    if (!selectedDate || evento.trim() === "" || !selectedGroupId) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos!',
        text1Style: {
          fontSize: height * 0.018,
          fontWeight: 'bold',
          color: '#fff',
        }
      });
      return;
    }

        if (!userContext?.id) {
  Toast.show({
    type: 'error',
    text1: 'Usuário não encontrado!',
    text1Style: {
      fontSize: height * 0.018,
      fontWeight: 'bold',
      color: '#fff',
    }
  });
  return;
}
 

    await addDoc(collection(db, "tasks"), {





      evento: evento.trim(),
      idUser: userContext.id,
      idTaskOption: selectedGroupId,
      data: selectedDate,
      grupo:selectedGroupId.replace(/^.*\?/, "") // Extrai o nome do grupo do id
      
    })
    .then(() => {
      Toast.show({
        type: 'success',
        text1: 'Tarefa adicionada com sucesso!',
        duration: 3000,
        text1Style: {
          fontSize: height * 0.018,
          fontWeight: 'bold',
          color: '#030101',
        }
      });

      setEvento('');
      setSelectedGroupId('');
      
      // Atualizar a lista de tarefas se o drawer estiver aberto
      if (openDrawer && selectedDate) {
        getTarefasDaData(selectedDate);
      }
    })
    .catch((error) => {
      console.log('Erro ao adicionar tarefa:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar tarefa',
        text1Style: {
          fontSize: height * 0.018,
          fontWeight: 'bold',
          color: '#fff',
        }
      });
    });
  }

  // 🔹 BUSCA GRUPOS
useEffect(() => {
  async function getGrupos() {
    try {
      const snapshot = await getDocs(
        collection(db, 'tasksOpitions')
      );

      console.log(snapshot, 'snapshot dos grupos');

      const data = [];

      snapshot.forEach((doc) => {
        const options = doc.data().options || [];

        options.forEach((option) => {
          data.push({
            id:`${doc.id}?${option}`,
            taskOption: option
        });
      
      });

      });
      setListaGrupos(data);
      console.log(data,'grupos carregados');

    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  }

  getGrupos();
}, []);


  return (
    <View style={{
      flex: 1,
      padding: width * 0.05,
      marginTop: height * 0.01,
      zIndex: 1
    }}>

      <View style={{
        width: '100%',
        height: height * 0.10,
        flexDirection: 'row',
        gap: width * 0.02,
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        <TouchableOpacity
          onPress={addEvento}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00a516',
            height: height * 0.07,
            width: height * 0.07,
            marginBottom: height * 0.02,
            marginLeft: '2%',
            borderRadius: 10
          }}>
          <Feather name="check-circle" size={height * 0.035} color="#fff" />
        </TouchableOpacity>

        <TextInput
          onChangeText={(e) => setEvento(e)}
          value={evento}
          placeholder="Digite algo..."
          style={{
            height: height * 0.07,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: height * 0.02,
            fontSize: height * 0.022,
            width: '88%',
            color: '#000',
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: width * 0.03,
          }}
        />
      </View>

      <Picker
        style={{
          height: height * 0.08,
          width: '100%',
          borderWidth: 1,
          borderColor: '#000',
          backgroundColor: '#fff',
          marginBottom: height * 0.02,
          color: '#000'
        }}
        selectedValue={selectedGroupId}
        onValueChange={(itemValue) => setSelectedGroupId(itemValue)}
      >
        <Picker.Item label='Selecione uma opção' value='' />
        {listaGrupos.map((item) => (
          <Picker.Item
            key={item.id}
            label={item.taskOption}
            value={item.id}
          />
        ))}
      </Picker>

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          if (openDrawer) {
            getTarefasDaData(day.dateString);
          }
        }}
        markedDates={{
          [selectedDate]: { 
            selected: true, 
            marked: true, 
            selectedColor: "blue",
            dotColor: 'blue' 
          },
        }}
      />
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  tarefas: {
    padding: 15,
    width: '100%',
    backgroundColor: '#010101',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  textTarefas: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  flatListContainer: {
    zIndex: 2,
    position: 'absolute',
    top: height * 0.55,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: '#c4c4c4',
    borderRadius: 10,
    overflow: 'hidden',
  },
  flatList: {
    width: '100%',
    height: '100%',
  },
  textList: {
    fontWeight: 'bold',
    color: '#000'
  }
});