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
                
                {/* Cabeçalho do Card com Faixa de Destaque */}
                <View style={styles.headerCard}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.orgName}>Ministério Tálamo</Text>
                        <Text style={styles.cardType}>MEMBRO</Text>
                    </View>
                    <Image style={styles.logoImg} source={require('./img/meta.webp')} />
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
                            <Text style={[styles.value, { color: '#ff4d4d' }]}>{userContext?.tsg || "---"}</Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>CONTATO</Text>
                            <Text style={styles.value}>{userContext?.phone || "---"}</Text>
                        </View>
                    </View>

                    {/* Rodapé Interno com Atribuição */}
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
        backgroundColor: '#1a1a1a',
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
        backgroundColor: '#000',
        paddingHorizontal: normalize(15),
        paddingVertical: normalize(10),
        borderBottomWidth: 2,
        borderBottomColor: '#333'
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
        color: '#aaa',
        fontSize: normalize(10),
        fontWeight: '600'
    },
    logoImg: {
        width: normalize(45),
        height: normalize(45),
        borderRadius: 5,
        backgroundColor: '#fff'
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
        color: '#777',
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
        backgroundColor: '#e2dfdf',
        marginHorizontal: normalize(-12),
        marginBottom: normalize(-12),
        padding: normalize(3),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    labelDark: {
        color: '#444',
        fontSize: normalize(8),
        fontWeight: 'bold',
    },
    valueDark: {
        color: '#000',
        fontSize: normalize(12),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginLeft:"5%"
    }
});