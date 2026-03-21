import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PixelRatio,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { AppContext } from "../../src/Data/contextApi";
import { db } from "../../src/Data/FirebaseConfig";

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Home() {
  const [dataImg, setDataImg] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userContext } = useContext(AppContext);

  // Estados para o texto que some
  const [showInfo, setShowInfo] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadImages = async () => {
      const branch = userContext?.branchId;
      try {
        const q = branch 
          ? query(collection(db, "events"), where("branchId", "==", branch))
          : query(collection(db, "events"));
        
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

    // Timer de 4 segundos para o texto sumir
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowInfo(false));
    }, 4000);

    return () => clearTimeout(timer);
  }, [userContext?.branchId]);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0072B1" />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0072B1" />
          <Text style={styles.loadingText}>Carregando novidades...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          
          {/* Saudação que some em 4s */}
          {showInfo && (
            <Animated.View style={[styles.infoContainer, { opacity: fadeAnim }]}>
              <Text style={styles.welcomeText}>Olá, {userContext?.name || 'Bem-vindo'}!</Text>
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>Confira os eventos em destaque abaixo.</Text>
              </View>
            </Animated.View>
          )}

          {/* Carrossel Principal */}
          {dataImg.length > 0 ? (
            <View style={styles.carouselWrapper}>
              <Carousel
                loop
                autoPlay
                autoPlayInterval={5000}
                scrollAnimationDuration={1200}
                width={width}
                height={height * 0.45} 
                data={dataImg}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <Image
                      source={{ uri: item }}
                      style={styles.image}
                      resizeMode="contain" // Faz a foto inteira caber no container
                    />
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum destaque no momento.</Text>
            </View>
          )}

          {/* Galeria Horizontal Inferior */}
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {/* Mapeie aqui fotos de uma coleção 'galeria' do Firebase se desejar */}
              {dataImg.map((img, index) => (
                <TouchableOpacity key={index} style={styles.galleryCard}>
                  <Image source={{ uri: img }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
              {/* Fotos estáticas de exemplo caso o firebase tenha poucas */}
              <TouchableOpacity style={styles.galleryCard}>
                <Image source={{ uri: 'https://picsum.photos/200/300?random=1' }} style={styles.galleryImage} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryCard}>
                <Image source={{ uri: 'https://picsum.photos/200/300?random=2' }} style={styles.galleryImage} />
              </TouchableOpacity>
            </ScrollView>
          </View>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F8F9FB" },
  
  // Saudação
  infoContainer: { padding: 20, backgroundColor: '#FFF' },
  welcomeText: { fontSize: normalize(22), fontWeight: 'bold', color: '#0072B1' },
  noticeBox: { marginTop: 8, padding: 10, backgroundColor: '#F0F7FF', borderRadius: 8 },
  noticeText: { color: '#0072B1', fontSize: normalize(13) },

  // Carrossel
  carouselWrapper: { backgroundColor: '#000' }, // Fundo preto para fotos que não ocupam tudo
  itemContainer: { width: width, height: height * 0.45, justifyContent: 'center' },
  image: { width: "100%", height: "100%" },

  // Galeria Lateral
  gallerySection: { marginTop: 25, paddingBottom: 40 },
  sectionTitle: { fontSize: normalize(18), fontWeight: "800", color: "#1A1A1A", marginLeft: 20, marginBottom: 15 },
  horizontalScroll: { paddingLeft: 20 },
  galleryCard: { marginRight: 15, borderRadius: 12, overflow: 'hidden', elevation: 3, backgroundColor: '#FFF' },
  galleryImage: { width: normalize(140), height: normalize(180), resizeMode: 'cover' },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: normalize(14), color: "#0072B1", fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: normalize(14) }
});