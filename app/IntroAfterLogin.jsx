import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AppContext } from "../src/Data/contextApi";
import { getItem } from "../src/Data/storage";


const images = [
  require("./img/pomba.png"),
  require("./img/cruz.webp"),
  require("./img/biblia.jpg"),
];

export default function IntroAfterLogin() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const {userContext} = useContext(AppContext)

  useEffect(() => {

    const uidGetAsyncStorage = getItem("uid"); 

    if (uidGetAsyncStorage == "" || uidGetAsyncStorage == undefined ) {
      return router.back("/")
    }

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    // depois de mostrar todas → vai pra Home
    const timeout = setTimeout(() => {
      router.push("/tabs/home");
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={images[index]}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // pode trocar
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220,
    height: 220,
  },
});
