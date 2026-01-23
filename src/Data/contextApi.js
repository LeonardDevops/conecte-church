import { collection, getDocs, query, where } from "firebase/firestore";
import { createContext, useEffect, useMemo, useState } from "react";
import { db } from "./FirebaseConfig";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    id: null,
    email: null,
    name: null,
    churches: [], // Vamos padronizar como 'churches'
    isLogged: false,
    pixConfig: null,
    pr: null
  });

  async function carregarDados() {
    try {
      // Buscamos apenas as igrejas ativas
      const q = query(collection(db, "branches"), where("status", "==", "active"));
      const querySnapshot = await getDocs(q);

      const branchesFormatted = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          branchId: doc.id,
          branchName: data.name, // Verifique se no banco é 'name' ou 'branchName'
          churchId: data.churchId || doc.id,
          churchName: data.churchName || "Ministério Tálamo",
          pastor: data.pastor || null, // Guardamos o objeto do pastor completo
          pixConfig: data.pixConfig || null
        };
      });

      // Atualizamos o estado preservando o que já existe no usuário logado
      setUserContext((prev) => ({ 
        ...prev, 
        churches: branchesFormatted 
      }));
      
      console.log("Igrejas carregadas no Contexto:", branchesFormatted.length);
    } catch (error) {
      console.error("Erro ao carregar dados das branches:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ✅ CORREÇÃO: O useMemo deve observar o userContext
  const contextValue = useMemo(
    () => ({
      userContext,
      setUserContext,
      carregarDados,
    }),
    [userContext] // Se o userContext mudar, os componentes serão notificados
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};