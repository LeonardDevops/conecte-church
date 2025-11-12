import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
export default function Ofertas() {
  const [linkPag , setLinkPag] = useState('');
  
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(linkPag)
      .then(()=> {
      console.log('copiado');

    }).catch(()=> {
      console.log('erro')
    })
  };
  


  useEffect(()=> {
     
    setLinkPag('00020126580014BR.GOV.BCB.PIX01362c7bb10f-91f8-4a35-9175-cb039c5a75915204000053039865802BR5925Caio Sergio Alves da Silv6009SAO PAULO62140510A0M4qoOw6l6304314E')

  },[])
  

  


  return (
        <View style={styles.container}>
            <Text style={styles.title}>Dízimo & Ofertas</Text>
            <Image source={require('../img/qrcode.jpg')} style={styles.image} />
            <TextInput style={styles.input} editable={false} placeholder="00020126580014BR.GOV.BCB.PIX01362c7bb10f-91f8-4a35-9175-cb039c5a75915204000053039865802BR5925Caio Sergio Alves da Silv6009SAO PAULO62140510A0M4qoOw6l6304314E"
            backgroundColor="#E0E0E0"  value={linkPag}
            />
            <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
                <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
        </View>
  );
}







const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '40%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',  
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6200EE",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  
});