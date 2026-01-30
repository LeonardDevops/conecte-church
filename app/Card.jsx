import { useContext } from "react";
import { Dimensions, Image, PixelRatio, StyleSheet, Text, View } from 'react-native';
import { AppContext } from "../src/Data/contextApi";

const { width } = Dimensions.get("window");

// Função para escalonamento responsivo
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Card() {
    const { userContext } = useContext(AppContext);

    return (
        <View style={styles.content}>
            <View style={styles.cardContainer}>
                
                {/* Cabeçalho do Card com a cor Azul da Logo */}
                <View style={styles.headerCard}>
                    <View style={styles.headerInfo}>
                        {/* Nome corrigido para Ministério Conecte Church */}
                        <Text style={styles.orgName}>Ministério Conecte Church</Text>
                        <Text style={styles.cardType}>MEMBRO</Text>
                    </View>
                    {/* Recomendo atualizar esta imagem para a logo nova em PNG transparente */}
                    <Image style={styles.logoImg} source={require('./img/icon.png')} />
                </View>

                {/* Corpo de Dados */}
                <View style={styles.bodyCard}>
                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>NOME COMPLETO</Text>
                            <Text style={styles.value}>{userContext?.name || "---"}</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>NASCIMENTO</Text>
                            <Text style={styles.value}>{userContext?.birthDate || "---"}</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>TIPO SANGUÍNEO</Text>
                            {/* Ajustado para uma cor neutra para não conflitar com o novo design */}
                            <Text style={[styles.value, { color: '#000000' }]}>{userContext?.tsg || "---"}</Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>CONTATO</Text>
                            <Text style={styles.value}>{userContext?.phone || "---"}</Text>
                        </View>
                    </View>

                    {/* Rodapé Interno com Atribuição usando o Cinza da Logo */}
                    <View style={styles.footerInfo}>
                        <View>
                            <Text style={styles.labelDark}>ATRIBUIÇÃO / CARGO</Text>
                            <Text style={styles.valueDark}>{userContext?.atribuicao || "Membro"}</Text>
                        </View>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(15)
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        height: normalize(230),
        backgroundColor: '#0072B1', // Cor principal da sua logo
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)', // Um tom escurecido sutil para o header
        paddingHorizontal: normalize(15),
        paddingVertical: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    headerInfo: {
        flex: 1
    },
    orgName: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: 'bold',
        letterSpacing: 1
    },
    cardType: {
        color: '#e0e0e0', // Cinza claro para o subtítulo
        fontSize: normalize(10),
        fontWeight: '600'
    },
    logoImg: {
        width: normalize(50),
        height: normalize(46),
        borderRadius: 5,
        backgroundColor: '#fff', // Fundo branco para destacar a logo colorida
    },
    bodyCard: {
        flex: 1,
        padding: normalize(12),
        justifyContent: 'space-between'
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: normalize(8)
    },
    dataRow: {
        marginBottom: normalize(8)
    },
    dataColumn: {
        flexDirection: 'column'
    },
    label: {
        color: '#b0d4e8', // Tom de azul claro para labels sobre o fundo azul
        fontSize: normalize(9),
        fontWeight: 'bold',
        marginBottom: 2
    },
    value: {
        color: '#fff',
        fontSize: normalize(13),
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    footerInfo: {
        backgroundColor: '#F2F2F2', // O cinza suave que sugerimos antes
        marginHorizontal: normalize(-12),
        marginBottom: normalize(-12),
        padding: normalize(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    labelDark: {
        color: '#58595B', // O Cinza exato da palavra "CHURCH"
        fontSize: normalize(8),
        fontWeight: 'bold',
        marginLeft: "5%"
    },
    valueDark: {
        color: '#000',
        fontSize: normalize(12),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginLeft: "5%"
    }
});