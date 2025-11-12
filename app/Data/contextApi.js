import { createContext, useState } from 'react';

const AppContext = createContext();

  const AppProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({});
    console.log(userContext, 'to recebendo os dados do firebase')
    return (
        <AppContext.Provider value={{ userContext, setUserContext }}>
            {children}
        </AppContext.Provider>
    );
};

 export { AppContext, AppProvider };

