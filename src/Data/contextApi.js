import { createContext, useEffect, useMemo, useState } from "react";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Estado inicial mais seguro
  const [userContext, setUserContext] = useState({
    id: null,
    email: null,
    branchName: null,
    churches: [],
    isLogged: false,
  });

  async function carregarDados() {
    try {
      const querySnapshot = await getDocs(collection(db, "branches"));

      const branchesFormatted = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          branchId: doc.id,
          branchName: data.branchName,
          churchId: data.churchId,
          churchName: data.churchName,
        };
      });

      setUserContext((prev) => ({ ...prev, churches: branchesFormatted }));
    } catch (error) {
      console.error("Erro ao carregar dados das branches:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Log apenas quando userContext mudar
  // (e não toda vez que o componente renderiza)
  // Forma mais limpa
  // useEffect(() => {
  //   console.log("📌 UserContext atualizado:", userContext);
  // }, [userContext]);

  // Evita re-renderização desnecessária dos componentes filhos
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
