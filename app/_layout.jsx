import { Stack } from "expo-router";
import React from "react";
import { Providers } from "../src/Data/proviedrs";

export default function RootLayout() {
  return (
    <Providers>
      <Stack
        // Define o estilo padrão para TODAS as telas de uma vez
        screenOptions={{
          headerShown: true,
          statusBarStyle: "light",
          headerStyle: { backgroundColor: "#0072B1" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitleVisible: false, // Limpa o texto do botão "voltar" no iOS
        }}
      >
        {/* Tela Inicial (Login/Home) */}
        <Stack.Screen
          name="index"
          options={{
            title: "Conecte Church", 
            headerShown: true,
          }}
        />

        {/* Cadastro */}
        <Stack.Screen
          name="Cadastro"
          options={{ title: "Criar Conta" }}
        />

        {/* Carteirinha de Membro */}
        <Stack.Screen
          name="Card"
          options={{ title: "Minha Carteirinha" }}
        />

        {/* QR Code / Identificação */}
        <Stack.Screen
          name="Boarding"
          options={{ title: "Identificação Digital" }}
        />

        {/* Check-in / Presença */}
        <Stack.Screen
          name="Presence"
          options={{ title: "Check-in" }}
        />

        {/* Bíblia Sagrada */}
        <Stack.Screen
          name="HolyBiblie"
          options={{ title: "Bíblia" }}
        />

        {/* Outras Telas */}
        <Stack.Screen name="redes" options={{ title: "Redes Sociais" }} />
        <Stack.Screen name="eventos" options={{ title: "Tarefas" }} />
        <Stack.Screen name="Forms" options={{ title: "Formulário" }} />

        {/* Telas que NÃO devem ter cabeçalho */}
        <Stack.Screen
          name="IntroAfterLogin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tabs"
          options={{ headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}