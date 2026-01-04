
import AsyncStorage from '@react-native-async-storage/async-storage';

// Salvar algo
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log('Erro ao salvar item:', error);
  }
};

// Ler algo
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value; // Retorna string ou null
  } catch (error) {
    console.log('Erro ao ler item:', error);
    return null;
  }
};

// Remover algo
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Erro ao remover item:', error);
  }
};

// Limpar tudo
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Erro ao limpar storage:', error);
  }
};
