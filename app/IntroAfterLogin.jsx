import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { AppContext } from "../src/Data/contextApi";
import { getItem } from "../src/Data/storage";

const { width } = Dimensions.get("window");

// Definição dos ícones minimalistas
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
      return router.push("/");
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

    // Barra de progresso de 0 a 100
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <CurrentIcon name={icons[index].name} size={width * 0.25} color="#1A1A1A" />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.percentText}>{percent}%</Text>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
            ]} 
          />
        </View>
        <Text style={styles.loadingSubtext}>Preparando sua experiência...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    fontSize: 24,
    fontWeight: "300", // Mais fino para parecer elegante
    color: "#1A1A1A",
    marginBottom: 15,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: width * 0.6,
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1A1A1A",
  },
  loadingSubtext: {
    marginTop: 15,
    fontSize: 12,
    color: "#999999",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});