import { useContext } from "react";
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppContext } from "./Data/contextApi";



export default function Card(params) {


    const { userContext } = useContext(AppContext) 


    return (
        <View style={styles.content}>

            <View style={styles.container}>

                <View style={styles.nome}>
                    <Text style={styles.title}>Nome: {userContext.nome}</Text>
                </View>
                <Text style={styles.title}></Text>
                <Text style={styles.title}>Data Nascimento: {userContext.dataNascimento}</Text>
                <Text style={styles.title}></Text>
                <View style={styles.logo}>

                    <Text style={styles.rodape}>##########################</Text>
                    <Image style={styles.logoimg} source={require('./img/meta.webp')} />
                </View>
                <Text style={styles.titleAtribuicao}>Atribuicao: {userContext.atribuicao}</Text>
                <Text style={styles.title}>Tipo Sanguíneo: {userContext.tsg}</Text>
                <Text style={styles.target}>Pr.Sergio && Pra.Cristina</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex:3,
        borderRadius: 8,
        backgroundColor: '#000000e7',
        width: '98%',
        height: 250,
        shadowColor: '#000',
        shadowOffset: {
            borderColor: '#000000f5',
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        width: '96%',
        marginLeft: 10,
    },
    content: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    nome: {
        flexDirection: 'row',

        justifyContent: 'center',
        alignItems: 'center'

    },
    logo: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: "#e2dfdfe7",
        borderColor: '#000000ff',
        borderWidth: 2


    },
    logoimg: {
        width: 55,
        height: 42,
        backgroundColor: "#ffffffff"

    },
    titleAtribuicao: {
        color: '#ffffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10


    },
    target: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 200,
        marginTop: 10,
        color: '#e6e6e6ff'
    },

    rodape: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffffe7',
    }
});