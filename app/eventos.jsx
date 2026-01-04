import { collection, getDocs } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db } from "../src/Data/FirebaseConfig";
import { AppContext } from '../src/Data/contextApi';

export default function Eventos () { 


    const [eventos, setEventos] = useState ([]);
    const {userContext} = useContext(AppContext);

    useEffect(()=> {

        getDocs(collection(db, "eventos")).then((data) => { 
        
            data.forEach((doc) => {
                setEventos((prevEventos) => [...prevEventos, doc.data()]);
            }); 
            
            console.log(eventos);
        })
        


    }, [])






    return(
        <View style={styles.bodyEventos}>
            
            <Text style={styles.title}>Progamacao de Eventos</Text>
   {eventos
      ?.filter(doc => doc.filial === userContext.filial)
       .map((doc, index) => (
       <View key={index} style={styles.containerEventos}>
       <Text style={styles.eventos}>31/10/2050</Text>
       <Text style={styles.eventos}>{doc.evento}</Text>
       </View>
      ))
   }

            
        </View>
    )
 }






 const styles = StyleSheet.create({


    bodyEventos: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    containerEventos: {
        width: '98%',
        backgroundColor: '#000000ff',
        alignItems: 'center',
        height: '10%',
        justifyContent: 'center',
        textAlign: 'justify',    
        marginBottom: 10,
    },

     title : {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
     },

     eventos: {
        color: '#fff',
        fontSize:15
     }

 });