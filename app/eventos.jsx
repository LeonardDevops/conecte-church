import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../src/Data/FirebaseConfig";
import { AppContext } from '../src/Data/contextApi';

export default function Tasks () { 


    const [tasks, setTasks] = useState ([]);
    const {userContext} = useContext(AppContext);

    useEffect(()=> {
        const queryRef = query(collection(db, "tasks"), where("idUser", "==", userContext.id));
        const dataRef =  getDocs(queryRef);
        
        dataRef.then((snapshot)=> {

            const myTasks = []

            snapshot.forEach((item)=> {
                
                myTasks.push({

                id:item.id,
                data: item.data().data,
                text:item.data().evento,
                grupo:item.data().grupo   
                })
                

            })

            setTasks(myTasks)


        }).catch((erro)=>{
         
            console.log("erro ao buscar tarefas", erro)
        })
        


    }, [])






    return(
        <View style={styles.bodyEventos}>
            
            <Text style={styles.title}>To-do List</Text>
   {tasks.map((doc ,index) => (
       <View key={index} style={styles.containerEventos}>

        <View style={styles.infoContainer}>
       <Text style={styles.eventos}>{doc.grupo}</Text>
       <Text style={styles.eventos}>{doc.text}</Text>
       <Text style={styles.eventos}>{doc.data}</Text>
       </View>
       <TouchableOpacity>
       <FontAwesome5 name="trash" size={24} color="#d43c008c"  />
       </TouchableOpacity>
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
        flexDirection:"row",
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
     },
     text: {
        color: '#fff',
        fontSize:15
     },
     infoContainer : {   
        width: '92%',
        justifyContent:"center",
        alignItems:"center",
        textAlign:"justify"
     }

 });