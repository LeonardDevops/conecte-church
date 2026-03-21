import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Redes() {
  
  const abrirLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Erro ao abrir link", err));
  };

  return (
    <View style={styles.body}>
      <View style={{ width: 300, height: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Igreja Meta Palmares</Text>
      </View>

      <View style={styles.containerRedes}>
        {/* Botão Instagram */}
        <TouchableOpacity 
          style={styles.containerItens} 
          onLongPress={() => abrirLink("https://www.instagram.com/metapalmares/")}
          onPress={() => abrirLink("https://www.instagram.com/metapalmares/")}
        >
          <Entypo name="instagram" size={30} color="#bd1212" />
          <Text style={styles.textContainer}>Instagram</Text>
        </TouchableOpacity>

        {/* Botão Whatsapp */}
        <TouchableOpacity 
          style={styles.containerItens} 
          onPress={() => abrirLink("https://chat.whatsapp.com/HS5CO4HaZLFF0rja4b2Pww")}
        >
          <AntDesign name="whats-app" size={30} color="#48e200" />
          <Text style={styles.textContainer}>Whatsapp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerRedes: {
    backgroundColor: '#000',
    marginTop: 10,
    gap: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerItens: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 220,
  },
  textContainer: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});