import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, PixelRatio, Platform, Pressable } from "react-native";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

const scaleFont = (size) => {
  const scale = width / 375;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

const ICON_SIZE = Math.min(width * 0.07, 28);
const HEADER_FONT = scaleFont(18);
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 70;

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#0072B1",
          height: HEADER_HEIGHT,
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: HEADER_FONT,
          fontWeight: 'bold'
        },
        tabBarShowLabel: true, // Desativamos o label padrão para usar o customizado do botão
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === 'ios' ? 90 : 70,
          backgroundColor: "#0072B1",
          opacity: 0.95,
          borderTopWidth: 0,
          elevation: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarActiveTintColor: "#fff",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => <Entypo name="home" size={ICON_SIZE} color={"#fff"} />,
        }}
      />

      <Tabs.Screen
        name="ofertas"
        options={{
          title: "Ofertas",
          tabBarLabel: "Ofertas",
          tabBarActiveTintColor: "#fff",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="qrcode-scan" size={ICON_SIZE} color={"#fff"} />,
        }}
      />

      <Tabs.Screen
        name="work"
        options={{
          title: "Tarefas",
          tabBarLabel: "Tarefas",
          tabBarActiveTintColor: "#fff",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => <FontAwesome name="tasks" size={ICON_SIZE} color={"#fff"} />,
        }}
      />

      <Tabs.Screen
        name="config"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarActiveTintColor: "#fff",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={ICON_SIZE} color={"#fff"} />,
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarLabel: "Mais",
          tabBarActiveTintColor: "#fff",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => <Entypo name="menu" size={ICON_SIZE} color={"#fff"} />,
        }}
      />
    </Tabs>
  );
}

function CustomTabBarButton({ children, accessibilityState, onPress, accessibilityLabel }) {
  const focused = accessibilityState?.selected ?? false;
  
  const scale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.15 : 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  // Interpolação para um visual mais "limpo" (Azul claro sobre azul escuro)
  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "rgb(255, 255, 255)"],
  });

  const textColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#bbbbbb", "#ffffff"],
  });

  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ scale }] }}>
        
        {/* Renderiza o ícone (children do Tabs.Screen) */}
        {children}

        <Animated.Text
          style={{
            marginTop: 4,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            color: textColor,
            backgroundColor: backgroundColor,
            fontSize: scaleFont(10),
            fontWeight: focused ? "bold" : "normal",
          }}
        >
          {accessibilityLabel}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}