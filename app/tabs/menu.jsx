import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";
import { useContext } from 'react';
import {
  Dimensions,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AppContext } from "../../src/Data/contextApi";
import { clearAll } from "../../src/Data/storage";

const { width } = Dimensions.get("window");

// Função para garantir que fontes e ícones fiquem proporcionais em qualquer tela
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Menu() {
  const router = useRouter();
  const { setUserContext } = useContext(AppContext);

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
    <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
      <View style={styles.grid}>
        
        {/* Redes Sociais */}
        <TouchableOpacity onPress={goRedes} style={styles.button}>
          <View style={styles.iconRow}>
            <Entypo name="instagram" size={normalize(22)} color="#df493e" />
            <FontAwesome name="whatsapp" size={normalize(22)} color="#05c76c" />
          </View>
          <Text style={styles.text}>Redes Sociais</Text>
        </TouchableOpacity>

        {/* Carteirinha */}
        <TouchableOpacity onPress={goCard} style={styles.buttonDisable}>
          <FontAwesome name="id-card" size={normalize(28)} color="#ddd" />
          <Text style={styles.text}>Carteirinha</Text>
        </TouchableOpacity>

        {/* PlayList */}
        <TouchableOpacity style={styles.buttonDisable}>
          <Entypo name="google-play" size={normalize(28)} color="#ca0b0b" />
          <Text style={styles.text}>PlayList</Text>
        </TouchableOpacity>

        {/* Palavra do Dia */}
        <TouchableOpacity style={styles.button}>
          <FontAwesome5 name="bible" size={normalize(28)} color="#b35f11" />
          <Text style={styles.text}>Palavra do Dia</Text>
        </TouchableOpacity>

        {/* Tarefas */}
        <TouchableOpacity onPress={goEventos} style={styles.button}>
          <FontAwesome5 name="tasks" size={normalize(28)} color="#2188e9" />
          <Text style={styles.text}>Tarefas</Text>
        </TouchableOpacity>

        {/* Formulario */}
        <TouchableOpacity style={styles.buttonDisable}>
          <Ionicons name="document-text" size={normalize(28)} color="#fff" />
          <Text style={styles.text}>Formulario</Text>
        </TouchableOpacity>

      </View>

      {/* Botão de Sair - Estilizado como rodapé de ação */}
      <TouchableOpacity onPress={redirect} style={styles.buttonExit}>
        <Ionicons name="exit" size={normalize(24)} color="#fff" />
        <Text style={styles.textExit}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: normalize(20),
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: normalize(15),
    width: '100%',
    paddingHorizontal: normalize(10),
  },
  button: {
    backgroundColor: '#fff',
    width: width * 0.43, // Define 2 colunas responsivas
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    padding: normalize(10),
  },
  buttonDisable: {
    backgroundColor: '#707070',
    width: width * 0.43,
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    padding: normalize(10),
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
  },
  text: {
    color: '#333',
    fontSize: normalize(13),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: normalize(8),
  },
  // Ajuste específico para o texto dentro do botão desabilitado (fundo escuro)
  buttonDisable: {
    backgroundColor: '#444',
    width: width * 0.43,
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  // Sobrescrevendo a cor do texto para botões escuros
  buttonDisableText: {
    color: '#fff',
  },
  buttonExit: {
    backgroundColor: '#3f3a3c',
    width: '90%',
    height: normalize(55),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: normalize(30),
    marginBottom: normalize(20),
    gap: 10,
  },
  textExit: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
  }
});