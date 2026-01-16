import { collection, getDocs } from "firebase/firestore";
import { createContext, useEffect, useMemo, useState } from "react";
import { db } from "./FirebaseConfig";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    id: null,
    email: null,
    churches: [],
    isLogged: false,
  });

  async function carregarDados() {
    try {
      console.log("carregarDados: buscando filiais..., Do contexto das igrejas" );
      const querySnapshot = await getDocs(collection(db, "branches"));

      const branchesFormatted = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          branchId: doc.id,
          branchName: data.branchName,
          churchId: data.churchId,
          churchName: data.churchName,
          churchPr: data.pastor?.name
        };
      });

      setUserContext((prev) => ({ ...prev, branches: branchesFormatted }));
      console.log("carregarDados: branchesFormatted:", branchesFormatted);
      
    } catch (error) {
      console.error("Erro ao carregar dados das branches:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const contextValue = useMemo(
    () => ({
      userContext,
      setUserContext,
      carregarDados,
    }),
    [userContext]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
