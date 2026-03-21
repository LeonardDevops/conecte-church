import { useContext } from "react";
import { Dimensions, Image, PixelRatio, StyleSheet, Text, View } from 'react-native';
import { AppContext } from "../src/Data/contextApi";

const { width } = Dimensions.get("window");
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function Card() {
    const { userContext } = useContext(AppContext);

    return (
        <View style={styles.content}>
            <View style={styles.cardContainer}>
                
                {/* Cabeçalho */}
                <View style={styles.headerCard}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.orgName} numberOfLines={1}>
                            Ministério Conecte Church
                        </Text>
                        <Text style={styles.cardType}>MEMBRO ATIVO</Text>
                    </View>
                    <View style={styles.logoWrapper}>
                        <Image 
                            style={styles.logoImg} 
                            source={require('./img/icon.png')} 
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Corpo de Dados */}
                <View style={styles.bodyCard}>
                    <View style={styles.dataRow}>
                        <Text style={styles.label}>NOME COMPLETO</Text>
                        <Text 
                            style={styles.value} 
                            numberOfLines={1} 
                            adjustsFontSizeToFit
                        >
                            {userContext?.name || "NOME DO MEMBRO"}
                        </Text>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>NASCIMENTO</Text>
                            <Text style={styles.value}>{userContext?.birthDate || "--/--/----"}</Text>
                        </View>
                        <View style={[styles.dataColumn, { alignItems: 'flex-end' }]}>
                            <Text style={styles.label}>TIPO SANGUÍNEO</Text>
                            <Text style={styles.value}>{userContext?.tsg || "N/A"}</Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.label}>CONTATO</Text>
                        <Text style={styles.value}>{userContext?.phone || "(00) 00000-0000"}</Text>
                    </View>
                </View>

                {/* Rodapé Interno */}
                <View style={styles.footerInfo}>
                    <View>
                        <Text style={styles.labelDark}>ATRIBUIÇÃO / CARGO</Text>
                        <Text style={styles.valueDark}>{userContext?.atribuicao || "MEMBRO"}</Text>
                    </View>
                    <View style={styles.validityBadge}>
                        <Text style={styles.validityText}>DIGITAL</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(20)
    },
    cardContainer: {
        width: '100%',
        maxWidth: 450,
        height: normalize(220),
        backgroundColor: '#0072B1', // Seu Azul Oficial
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.12)',
        paddingHorizontal: normalize(15),
        paddingVertical: normalize(4),
    },
    headerInfo: { flex: 1 },
    orgName: {
        color: '#fff',
        fontSize: normalize(13),
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    cardType: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: normalize(9),
        fontWeight: 'bold',
        marginTop: 3
    },
    logoWrapper: {
        width: normalize(45),
        height: normalize(45),
        backgroundColor: '#FFF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    logoImg: { width: '100%', height: '100%' },
    bodyCard: {
        flex: 1,
        paddingHorizontal: normalize(15),
        paddingTop: normalize(10),
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: normalize(8)
    },
    dataRow: { marginBottom: normalize(0) },
    dataColumn: { flexDirection: 'column' },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: normalize(8),
        fontWeight: 'bold',
        marginBottom: 2
    },
    value: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    footerInfo: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: normalize(15),
        paddingVertical: normalize(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    labelDark: {
        color: '#58595B', // Cinza da sua logo
        fontSize: normalize(8),
        fontWeight: 'bold',
    },
    valueDark: {
        color: '#1A1A1A',
        fontSize: normalize(12),
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    validityBadge: {
        backgroundColor: '#0072B1',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 5
    },
    validityText: {
        color: '#FFF',
        fontSize: normalize(8),
        fontWeight: 'bold'
    }
});