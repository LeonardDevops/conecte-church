import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const data = [
{ id: 1, title: '', image: 'https://img.cdndsgni.com/preview/13106056.jpg' },
{ id: 2, title: '', image: 'https://www.designi.com.br/images/preview/13039090.jpg' },
{ id: 3, title: '', image: 'https://www.designi.com.br/images/preview/13087534.jpg' },
{ id: 4, title: '', image: 'https://tse3.mm.bing.net/th/id/OIP.1KNOC5MlpstgTdkOkSi-mQHaKh?pid=ImgDet&w=206&h=292&c=7&dpr=1,6&o=7&rm=3' },
];

export default function Home()   {
return (
<Carousel
data={data}
renderItem={({ item }) => (
<View style={styles.itemContainer}>
<Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.image} />

</View>
)}
width={width}
height={570}
style={{marginTop:'20',}}
loop
autoPlay
scrollAnimationDuration={2000}
/>
);
};

const styles = StyleSheet.create({
itemContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#fff',
borderRadius: 10,
overflow: 'hidden',
gap:10,

},
image: {
width: '100%',
height: '100%',
resizeMode: 'cover',
backgroundColor:'#000',
},
title: {
fontSize: 16,
fontWeight: 'bold',
marginTop: 10,
width:'100%',
height:'10%',

},
});
