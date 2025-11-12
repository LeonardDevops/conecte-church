import { Stack } from "expo-router";
import React from "react";
import { AppProvider } from "./Data/contextApi";
export default function RootLayout() {
  return (
    <AppProvider>
        

        <React.Fragment>          
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: true,
                statusBarStyle: "light",
                headerStyle: { backgroundColor: "#000000ff" },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "bold" },
                title: "",
              }}
              
              />
            <Stack.Screen
              name="Card"
              options={{
                headerTitle:'Carteirinha',
                headerShown: true,
                statusBarStyle: "light",
                headerStyle: { backgroundColor: "#000000ff" },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "bold" },
                title: "",
              }}
            />,
            <Stack.Screen
              name="Cadastro"
              options={{
                headerTitle:'Cadastro',
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
        </React.Fragment>
              </AppProvider>
  );
}






