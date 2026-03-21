import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { AppContext } from "../src/Data/contextApi";
import { getItem } from "../src/Data/storage";

const { width } = Dimensions.get("window");

// --- CORES CONFIGURADAS ---
const THEME = {
  background: "#FFFFFF",
  primary: "#0072B1",
  textMain: "#0072B1",
  textSecondary: "#546E7A",
  progressTrack: "#E1E8ED",
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
    // 1. Verificação de Segurança (Login)
    const checkUser = async () => {
      const uid = await getItem("uid");
      if (userContext.isLogged === false || !uid) {
        router.replace("/"); // Redireciona se não houver login
      }
    };
    checkUser();

    // 2. Função de Animação dos Ícones
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

    // Loop de troca de ícones
    const iconInterval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % icons.length);
        animateNext();
      });
    }, 2000);

    // 3. Animação da Barra de Progresso Visual
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.quad),
    }).start();

    // 4. Atualização da Porcentagem (Texto) de forma leve
    const percentInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev < 100) return prev + 1;
        return 100;
      });
    }, 58); // 6000ms / 100% ≈ 60ms por passo

    // 5. Navegação após concluir
    const navigationTimeout = setTimeout(() => {
      router.replace("/tabs/home"); // Use replace para evitar que o usuário volte para a intro
    }, 6500);

    // Cleanup: Limpa tudo ao sair da tela para não vazar memória
    return () => {
      clearInterval(iconInterval);
      clearInterval(percentInterval);
      clearTimeout(navigationTimeout);
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
                width: progressAnim.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: ['0%', '100%'] 
                }) 
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
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  footer: { paddingBottom: 80, alignItems: "center" },
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
  progressBar: { height: "100%" },
  loadingSubtext: {
    marginTop: 20,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
});