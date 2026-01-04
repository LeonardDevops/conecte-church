import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppContext } from "../../src/Data/contextApi";
import { clearAll } from "../../src/Data/storage";
export default function Menu() {

  const router = useRouter();
  const {  setUserContext } = useContext (AppContext);
  function redirect(params) {
    setUserContext('');
     router.back('/Login');
      clearAll('user');
  }


  function goCard() {
    router.push('/Card');
  }

  function goRedes(params) {
    router.push('/redes');
  }

  function goEventos(params) {
    router.push('/eventos');
  }

  return (
        <View style={styles.container}>
          <TouchableOpacity 
           onPress={goRedes}
          style={styles.button}>
            <Entypo name="instagram" size={24} color="#df493eff" />
            <FontAwesome name="whatsapp" size={28} color="#05c76cff" />
            <Text style={styles.text}>Redes Sociais</Text> 
          </TouchableOpacity>

            <TouchableOpacity style={styles.button}
            onPress={goCard}
            >
          <FontAwesome name="id-card" size={24} color="#a3a3a3ff" />
            <Text style={styles.text}>Carteirinha</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.button}>
            <Entypo name="google-play" size={28} color="#e00000ff" />
            <Text style={styles.text}>PlayList</Text>  
            </TouchableOpacity>
            
          <TouchableOpacity style={styles.button}>
          <FontAwesome5 name="bible" size={24} color="#b35f11ff" />
          <Text style={styles.text}>Palavra do Dia</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
          onPress={goEventos}
          style={styles.button}>
            <MaterialIcons name="event" size={24} color="#2188e9ec" />
           <Text style={styles.text}>Eventos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={redirect}
          style={styles.button2}>
            
            <Ionicons name="exit" size={30} color="#fff" />
           <Text style={styles.text}>Sair</Text>
          </TouchableOpacity>
           


        </View>
  );
}




const styles = StyleSheet.create({
  container :{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    gap:20,
    marginBottom:'30%',
    
  },


  button :{
    backgroundColor:'#000000e3',
    width:'98%',
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:1,
    shadowOpacity:0.5,
    shadowRadius:20,
    shadowOffset:{width:0,height:2},
    elevation:5,
    flexDirection:'row',
    gap:10
  },
  button2 :{
    backgroundColor:'#3f3a3cec',
    width:'40%',
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    shadowOpacity:0.5,
    shadowRadius:20,
    shadowOffset:{width:0,height:2},
    elevation:5,
    flexDirection:'row',
    gap:10
  },

  text :{
    color:'#fff',
    fontSize:25,
    fontWeight:'bold'

  }

})