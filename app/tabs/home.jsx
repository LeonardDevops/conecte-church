// ===== Importações =====
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { AppContext } from "../../src/Data/contextApi";
import { db, storage } from "../../src/Data/FirebaseConfig";


// Captura a largura da tela do dispositivo
const { width } = Dimensions.get("window");

export default function Home() {
  // === Estado para armazenar as URLs das imagens ===
  const [dataImg, setDataImg] = useState([]);

  const {userContext} = useContext(AppContext);
  

  // === useEffect roda assim que o componente é montado ===
 

  useEffect(() => {

     console.log("userContext no home", userContext.id)  
    const loadImages = async () => {
      try {

        const storage =  query(collection(db, "events"), where("branchId", "==", userContext.branchId));
        const dataRef =   await (getDocs(storage)) ;
        
        let result = [] ;

          dataRef.forEach((data)=> {
          result.push(data.data().banner);
          setDataImg(result);
        })
        
      } catch (error) {
        console.log("❌ Erro ao carregar imagens:", error);
      }
    };

    
   if (storage) loadImages();
  }, []); // O array vazio faz o efeito rodar só uma vez (ao abrir a tela)

  // === Renderização do componente ===
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {dataImg.length > 0 ? (
        // Quando há imagens carregadas, mostra o carrossel
        <Carousel
          // O carrossel recebe o array de URLs das imagens
          data={dataImg}

          // Define como cada item será renderizado
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image
                // "item" é uma URL, então passamos ela no objeto { uri: item }
                source={{ uri: item }}
                style={styles.image}
              />
            </View>
          )}

          // Define o tamanho de cada item
          width={width}
          height={570}

          // Espaçamento e aparência
          style={{ marginTop: 20 }}

          // Faz o carrossel repetir infinitamente
          loop

          // Faz as imagens trocarem automaticamente
          autoPlay

          // Duração da animação entre as imagens (em milissegundos)
          scrollAnimationDuration={2000}
        />
      ) : (
        // Caso ainda não tenha imagens, mostra uma tela de "carregando"
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando imagens...</Text>
        </View>
      )}
    </View>
  );
}

// ===== Estilos =====
const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // A imagem preenche o container mantendo proporção
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#777",
  },
});
