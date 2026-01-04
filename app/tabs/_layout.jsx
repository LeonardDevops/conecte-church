import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, PixelRatio, Pressable } from "react-native";


import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

// 📌 Função de fonte responsiva
const scaleFont = (size) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// 🟦 Medidas responsivas
const TAB_BUTTON_SIZE = Math.max(width * 0.12, 50);
const ICON_SIZE = Math.min(width * 0.075, 32);
const HEADER_FONT = scaleFont(18);
const HEADER_HEIGHT = Math.max(height * 0.10, 60);



export default function Layout() {

  return (

    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#000",
          height: HEADER_HEIGHT,
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: HEADER_FONT,
        },

        // ❗ Desativa o label nativo (para usar apenas nosso custom)
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#9c9c9c",
       
        tabBarStyle: {
          position: "absolute",
          height: height * 0.11,
          backgroundColor: "#000",
          borderTopWidth: 0,
          elevation: 10,
        },

        // 🔥 Usa nosso botão customizado
        tabBarButton: (props) => (
          <CustomTabBarButton
            {...props}
            accessibilityLabel={props.accessibilityLabel}
          
          />
        ),
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <Entypo name="menu" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ofertas"
        options={{
          title: "Ofertas",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="work"
        options={{
          title: "Tarefas",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="table" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="config"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
 
  );
}

function CustomTabBarButton({
  children,
  accessibilityState,
  onPress,
  accessibilityLabel,
}) {
  const focused = accessibilityState?.selected ?? false;
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }}
      >
        {/* Ícone */}
        {children}

        {/* Label custom */}
        <Animated.Text
          style={{
            marginTop: 4,
            paddingHorizontal: 10,
            paddingVertical: 2,
            borderRadius: 8,

            // 🔥 Cor e fundo de acordo com o foco
            color: focused ? "#fff" : "#9c9c9c",
            backgroundColor: focused ? "#c92626ff" : "transparents",
            // 📐 Estilo responsivo
            fontSize: scaleFont(12),
            fontWeight: "bold",
          }}
        >
          {accessibilityLabel}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
