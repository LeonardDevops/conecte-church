import { Picker } from '@react-native-picker/picker';
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaskedTextInput } from "react-native-mask-text";


export default function Cadastro() {

    const [nascimento, setNascimento] = useState('');
    const [selectedValue, setSelectedValue] = useState("Matriz");
    return(
        <View style={styles.containerBody}>
        <Text style={styles.text}>Nome</Text>

          <TextInput style={styles.textInput} />
        
          <Text style={styles.text}>email</Text>
        
            <TextInput style={styles.textInput} />
        
          <Text style={styles.text}>password</Text>
        
         <TextInput style={styles.textInput} />
        
          <Text style={styles.text} >Nascimento</Text>
        
           <MaskedTextInput
           onChangeText={(e) =>  setNascimento(e) }
           value={nascimento}
           mask='99/99/9999' 
           keyboardType='numeric'
           style={styles.textInput} />
        
          <Text style={styles.text}>Filial</Text>
        
           <Picker
        selectedValue={selectedValue}
        style={{ height: 50, width: '90%', 
          fontFamily:'sans-serif',
          color:'#fff',
          shadowColor:'#FFF',
          fontWeight:'bold', 
          fontSize:25,
          borderRadius:4,
          justifyContent:'center',
          alignItems:'center',
          textAlign:'center',
          backgroundColor:'#000000ff',
          
          
        }}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
      
        <Picker.Item  label="Matriz" value="1" />
        <Picker.Item label="Palmares" value="2" />
        <Picker.Item label="Sepetiba" value="3" />
        
        </Picker>

            <TouchableOpacity style={[styles.textInput, {justifyContent:'center', alignItems:'center',marginTop:"5%", backgroundColor:'#000'}]}>
              <Text style={{color:'#fff', fontSize:18 , }}>Cadastrar</Text>
            </TouchableOpacity>

        </View>
    )
 }




  const styles = StyleSheet.create({

    containerBody : {
        flex:1,
        justifyContent:"center",
        alignItems:"center"
        
    } ,

    textInput: {
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
          marginTop:"2%"
    },
    text:{
        fontSize:18,
        fontWeight:'bold',
        color:'#000000ff',
        marginBottom:5
    }
  })