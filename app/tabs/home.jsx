// ===== Importações =====
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  PixelRatio,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { AppContext } from "../../src/Data/contextApi";
import { db } from "../../src/Data/FirebaseConfig";

// Configurações de responsividade
const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Home() {
  const [dataImg, setDataImg] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userContext } = useContext(AppContext);

  useEffect(() => {
    const loadImages = async () => {
      if (!userContext?.branchId) return;
      
      try {
        const q = query(
          collection(db, "events"), 
          where("branchId", "==", userContext.branchId)
        );
        
        const querySnapshot = await getDocs(q);
        let result = [];
        
        querySnapshot.forEach((doc) => {
          if (doc.data().banner) {
            result.push(doc.data().banner);
          }
        });
        
        setDataImg(result);
      } catch (error) {
        console.log("❌ Erro ao carregar imagens:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [userContext?.branchId]);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Buscando novidades...</Text>
        </View>
      ) : dataImg.length > 0 ? (
        <View style={styles.carouselWrapper}>
          <Carousel
            loop
            autoPlay
            autoPlayInterval={5000}
            scrollAnimationDuration={1500}
            width={width}
            height={height * 0.7} // Ocupa 70% da altura da tela de forma proporcional
            data={dataImg}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {/* Overlay degradê suave opcional pode ser adicionado aqui */}
              </View>
            )}
          />
          
          {/* Indicador visual ou mensagem inferior */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
            <Text style={styles.welcomeSubtitle}>
              Fique por dentro de tudo que acontece na sua igreja.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3342/3342137.png' }} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Nenhum evento no momento.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  carouselWrapper: {
    flex: 1,
  },
  itemContainer: {
    width: width,
    height: height * 0.7,
    backgroundColor: "#EEE",
    // Sombras para dar profundidade
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  welcomeSection: {
    padding: normalize(20),
    backgroundColor: '#F8F9FB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Sobrepõe o carrossel para um efeito moderno
    flex: 1,
  },
  welcomeTitle: {
    fontSize: normalize(24),
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: normalize(14),
    color: "#666",
    lineHeight: normalize(20),
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: normalize(14),
    color: "#999",
    fontWeight: "500",
  },
  emptyIcon: {
    width: 100,
    height: 100,
    opacity: 0.2,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: normalize(16),
    color: "#BBB",
    textAlign: "center",
  },
});