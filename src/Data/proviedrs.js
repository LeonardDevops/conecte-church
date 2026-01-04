import { AppProvider } from "./contextApi";

function  Providers({ children }) {
  return (
    <AppProvider>
        
   
          {children}
        
        
        
        
      
    </AppProvider>
  );
}



export { Providers };

