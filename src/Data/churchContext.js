import { createContext, useState } from 'react';

const ChurchContext = createContext();

  const ChurchProvider = ({ children }) => {
  const [churchContext, setChurchContext] = useState([]);
    console.log(churchContext, 'to recebendo os dados do firebase')
    return (
        <ChurchContext.Provider value={{ setChurchContext , churchContext }}>
            {children}
        </ChurchContext.Provider>
    );
};

 export { ChurchContext, ChurchProvider };

