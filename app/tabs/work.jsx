import Feather from '@expo/vector-icons/Feather';
import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { db } from "../Data/FirebaseConfig";



export default function Work() {
  
  
  const [selectedDate, setSelectedDate] = useState("");
  const [evento, setEvento] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false)
  const [listaTarefas, setListaTarefas] = useState([]);
  const widthValue = useSharedValue(0); // valor animado numérico (não string)
  const [group, setGroup] = useState([]);
  const [selectedGroup , setSelectedGroup] = useState();
  const heightValue = useSharedValue(0);

    async function addEvento(params) {

      const requesito = await false;

      if  (!selectedDate || !evento || !selectedGroup) {
       
        return;
      }
        
    

      const newTarefas = await addDoc(collection(db, "tarefas",), {
        evento: evento,
        data: selectedDate,
        grupo:[group.filter((item)=> item.membros === selectedGroup).map((item)=> item.nomeGroup).toString()],
        membros: selectedGroup
      }).then(()=> {
        console.log('tarefa adicionada ');
        function showToast(params) {
          
          Toast.show( {
            style: 'toasterSuccess',
            type: 'success',
            text1: 'Tarefa adicionada com sucesso!',
            duration: 300,
            text1Style: { fontSize: 18, fontWeight: 'bold', color: '#030101ff', backgroundColor:'#7fff00ff', borderRadius:2 },
             

          });
        }
        showToast()
        setEvento('');

      }).catch(()=> {
        console.log('tarefa possui erros')
      })

    }

     function openTarefas(params) {
       openDrawer ? setOpenDrawer(false): setOpenDrawer(true)
       widthValue.value = withTiming(openDrawer ? 0.5 : 1.1, { duration: 500 });
       heightValue.value = withTiming(openDrawer ? 0.3 : 0.64, { duration: 500 });
     }

     const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthValue.value * 100}%`,
      height: `${heightValue.value * 100}%`,
      backgroundColor: withTiming(openDrawer ? '#8b8b8b75' : '#c4c4c4'),
    };
  });


  useEffect(()=> {
    async function getGroup(params) {
      
      try {
        const getGrou = await  getDocs(collection(db,"grupoTarefas"));
        const listaGrupos = [];

        getGrou.forEach((doc)=> {
          listaGrupos.push({id: doc.id, ...doc.data()})
        })
        setGroup(listaGrupos);
        console.log('grupo carregado', listaGrupos);
      } catch (error) {
        
      }
    }
    console.log('carregando componente');
    getGroup();
    return;

  },[selectedDate === true])



  useEffect(()=> {
    async function getList() {
      try {
        const snapshot = await getDocs(query(collection(db, "tarefas"), where("data", "==", selectedDate)));
        const lista = []; // cria um array vazio para armazenar os dados
        if (!selectedDate) {
          alert('selecione uma data pra buscar ou inserir uma nova tarefa')
          return
        }

        snapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() }); // copiando tudo que tiver dentro de data
        });

        setListaTarefas(lista); // passando pra minha state
        console.log("Tarefas carregadas:", lista);

      } catch (error) {
        console.log("Erro ao carregar tarefas:", error);
      }
    }

    if (openDrawer) getList(); // só busca quando abrir a gaveta
  }, [openDrawer]);
  






  return (
    

    <View style={{ flex: 1, padding: 20, marginTop: 1, zIndex:1 }}>
      <View style={{width:'100%', height:80, flexDirection:'row', gap:5, justifyContent:'center', alignItems:'center'}}>

      <TouchableOpacity 
      onPress={addEvento}
      style={{justifyContent:'center', 
      alignItems:'center', 
      backgroundColor:'#00a516ff',
      height:60 ,width:60,
      marginBottom:20,
      marginLeft:'2%',
      borderRadius:10
        
        }}>
      
      <Feather name="check-circle" size={24} color="#fff" />
      
        
        
     
      </TouchableOpacity>
     
      <TextInput
        onChangeText={(e) => { setEvento(e) }}
        placeholder="Digite algo..."
        style={{
          height: 60,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          fontSize:18,
          width:'88%',
          color:'#000',
          backgroundColor:'#fff',
          borderRadius:10,
          paddingHorizontal: 10,
        }}
        />
        </View>

      <Picker style={{height:50, width:'100%',
       borderWidth:1,
       borderColor:'#000',
       backgroundColor:'#fff', 
       marginBottom:20,
       color:'#000'
       
      }} 
       selectedValue={selectedGroup} onValueChange={(itemValue) => setSelectedGroup(itemValue)}>
        <Picker.Item label='Selecione um Grupo' value='' />
        {group.map((item) => (
          <Picker.Item key={item.id} label={item.nomeGroup} value={item.membros} />
        ))}

      </Picker>

        <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: "blue" },
        }}
      />

    
        <TouchableOpacity style={styles.tarefas}
        onPress={openTarefas}
        >
        <Text style={styles.textTarefas}>{!openDrawer ? 'carregar tarefas...' : 'Fechar Lista de Tarefas'}</Text>
        <Feather name={!openDrawer ? 'chevron-down' : 'chevron-up'} size={24} color="#fff" />

        </TouchableOpacity>
        {openDrawer && (
          <Animated.FlatList
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={[styles.flatList, animatedStyle]}
          data={listaTarefas} 
          renderItem={({ item }) => (
            <View key={item.id} style={{backgroundColor:'#5ceb1fff', padding:10, borderRadius:10, marginTop:10, gap:5, width:'97%',
            justifyContent:'center', alignItems:'center', marginLeft:'1.5%'
          }}>
            <Text  style={styles.textList}>Tarefa: {`${item.evento}`}</Text>
            <Text  style={styles.textList}>{`${item.data}`}</Text>
            <Text  style={styles.textList}>Grupo: {`${item.grupo ? item.grupo : '' }`}</Text>
            <Text  style={styles.textList}>Membros: {`${item.membros ? item.membros : ''}`}</Text>
            
          </View>
          )}
          />
        )}
        <Toast  />
  </View>
      
  )
}


const styles = StyleSheet.create({
  
  tarefas: {
      padding:15,
      width:'100%',
      backgroundColor:'#010101ff',
      borderRadius:10,
      justifyContent:'center',
      alignItems:'center',
      marginTop:20
  },
  textTarefas: {
      color:'#fff',
      fontSize:18,
      fontWeight:'bold',
      width:'100%',
      justifyContent:'center',
      alignItems:'center',
      marginLeft:'50%'
  },

  flatList:{
    zIndex:2,
    position:'absolute',
    marginLeft:'1%'


  }, 
   textList : {
    fontSize:20,
    fontWeight:'bold',
    color:'#000'
   }

 
})