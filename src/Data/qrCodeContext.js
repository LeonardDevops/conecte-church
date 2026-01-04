import { createContext, useState } from 'react';

const QrcodeContext = createContext();

  const QrcodeProvider = ({ children }) => {
  const [qrCodeContext, setQrCodeContext] = useState([]);
    console.log(qrCodeContext, 'to recebendo os dados do firebase')
    return (
        <QrcodeContext.Provider value={{ setQrCodeContext , qrCodeContext }}>
            {children}
        </QrcodeContext.Provider>
    );
};

 export { QrcodeContext, QrcodeProvider };

