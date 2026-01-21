import { Stack } from "expo-router";
import React from "react";
import { Providers } from "../src/Data/proviedrs";
export default function RootLayout() {
  return (
    
    <Providers>

      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" }, // removido flex:1
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
        />

        <Stack.Screen
          name="Card"
          options={{
            headerTitle: "Carteirinha",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
        />

        <Stack.Screen
          name="Cadastro"
          options={{
            headerTitle: "Cadastro",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />

        <Stack.Screen
          name="redes"
          options={{
            headerTitle: "Redes Sociais",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />

        <Stack.Screen
          name="eventos"
          options={{
            headerTitle: "Tarefas",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />
        <Stack.Screen
          name="IntroAfterLogin"
          options={{
            headerTitle: "IntroAfterLogin",
            headerShown: false,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />
        <Stack.Screen
          name="Forms"
          options={{
            headerTitle: "Formulario",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />
        <Stack.Screen
          name="HolyBiblie"
          options={{
            headerTitle: "Biblia",
            headerShown: true,
            statusBarStyle: "light",
            headerStyle: { backgroundColor: "#000000ff" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            title: "",
          }}
          />
      

        <Stack.Screen
          name="tabs"
          options={{
            headerShown: false,
          }}
          />
      </Stack>
          
          </Providers>
   
  );
}
