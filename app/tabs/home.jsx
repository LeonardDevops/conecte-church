// ===== Importações =====
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { AppContext } from "../../src/Data/contextApi";


// Captura a largura da tela do dispositivo
const { width } = Dimensions.get("window");

export default function Home() {
  // === Estado para armazenar as URLs das imagens ===
  const [dataImg, setDataImg] = useState([]);

  const {userContext} = useContext(AppContext);
  

  // === useEffect roda assim que o componente é montado ===
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Cria uma instância do storage configurado no Firebase
        const storage = getStorage();

        // Cria uma referência para a pasta "home/" dentro do seu storage
        const storageRef = ref(storage, `home/${userContext.branchName}`);

        // Lista todos os arquivos dentro dessa pasta
        const result = await listAll(storageRef); // result.items é um array com referências para cada arquivo

        // Para cada item encontrado, gera a URL de download pública
        const urls = await Promise.all(
          result.items.map((itemRef) => getDownloadURL(itemRef))
        );

        // Salva as URLs no estado (isso atualiza automaticamente a tela)
        setDataImg(urls);
        console.log(userContext);
        console.log("✅ Imagens carregadas com sucesso:", urls);
      } catch (error) {
        console.log("❌ Erro ao carregar imagens:", error);
      }
    };

    // Chama a função que carrega as imagens
    loadImages();
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
