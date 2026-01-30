import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { AppContext } from "../src/Data/contextApi";
import { getItem } from "../src/Data/storage";

const { width } = Dimensions.get("window");

// --- CORES CONFIGURADAS COM #0072B1 ---
const THEME = {
  background: "#FFFFFF",      // Branco puro para máximo contraste
  primary: "#0072B1",         // O seu Azul específico
  textMain: "#0072B1",        // Porcentagem no mesmo tom
  textSecondary: "#546E7A",   // Cinza azulado para o subtexto
  progressTrack: "#E1E8ED",   // Cinza muito claro para o fundo da barra
};

const icons = [
  { lib: FontAwesome5, name: "dove" },
  { lib: FontAwesome5, name: "cross" },
  { lib: MaterialCommunityIcons, name: "book-open-variant" },
];

export default function IntroAfterLogin() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const { userContext } = useContext(AppContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const uidGetAsyncStorage = getItem("uid");
    
    if (userContext.isLogged === false || !uidGetAsyncStorage) {
      router.push("/");
      return;
    }

    const animateNext = () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateNext();

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % icons.length);
        animateNext();
      });
    }, 2000);

    // Animação da barra (6 segundos)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.quad),
    }).start();

    const listener = progressAnim.addListener(({ value }) => {
      setPercent(Math.floor(value * 100));
    });

    const timeout = setTimeout(() => {
      router.push("/tabs/home");
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      progressAnim.removeListener(listener);
    };
  }, []);

  const CurrentIcon = icons[index].lib;

  return (
    <View style={[styles.container, { backgroundColor: THEME.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <CurrentIcon name={icons[index].name} size={width * 0.25} color={THEME.primary} />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.percentText, { color: THEME.textMain }]}>{percent}%</Text>
        
        <View style={[styles.progressTrack, { backgroundColor: THEME.progressTrack }]}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: THEME.primary,
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.loadingSubtext, { color: THEME.textSecondary }]}>
          Preparando sua experiência...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingBottom: 80,
    alignItems: "center",
  },
  percentText: {
    fontSize: 28,
    fontWeight: "300",
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: width * 0.6,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  loadingSubtext: {
    marginTop: 20,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
});