import { createContext, useMemo, useState } from 'react';

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

  // Log apenas quando userContext mudar
  // (e não toda vez que o componente renderiza)
  // Forma mais limpa
  // useEffect(() => {
  //   console.log("📌 UserContext atualizado:", userContext);
  // }, [userContext]);

  // Evita re-renderização desnecessária dos componentes filhos
  const contextValue = useMemo(() => ({
    userContext,
    setUserContext,
  }), [userContext]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
