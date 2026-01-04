import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Link } from "expo-router";
import { StyleSheet, Text, View } from 'react-native';

export default function Redes() {
    
        
        
  return (
    <View style={styles.body}>
        <View >
         <View style={{width:300, height:20, alignItems:'center', justifyContent:'center'}}>
        <Text style={{fontWeight:"bold"}}>Igreja Meta Palmares</Text>
        </View>   

        <View style={styles.containerRedes}>

        <Link href="https://www.instagram.com/metapalmares/">
        <View style={styles.containerItens}>
        <Entypo name="instagram" size={30} color="#bd1212ff" />
        <Text style={styles.textContainer}>Instagram</Text>  
        </View>
        </Link>

        <Link href="https://chat.whatsapp.com/HS5CO4HaZLFF0rja4b2Pww">
        <View style={styles.containerItens} >
        <AntDesign name="whats-app" size={30} color="#48e200ff" />
         <Text style={styles.textContainer}>Whatsapp</Text>
         </View>  
        </Link>

        </View>
        
        </View>
    </View>
  )
}







const styles = StyleSheet.create({

    body: {
        flex: 1,
        backgroundColor: '#ffffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
       containerRedes:{
        backgroundColor:'#000',
        fontSize:20,
        marginTop:10,
        gap:20,
        padding:15,
        borderRadius:10,
        alignItems:'center',
        justifyContent:'center',
    }   
    ,
    redesConmtainer: {
        width:"85%",
        height:"50%"
    },
    containerItens:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        gap:10,
        borderWidth:1,
        borderColor:'#fff',
        padding:10,
        borderRadius:10,
        width:200
        
    },
    textContainer:{
        color:"#fff",
        fontWeight:"bold"
    }


})

