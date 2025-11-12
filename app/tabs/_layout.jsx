import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { Pressable, View } from 'react-native';
export default function RootLayout() {
  return (
                 
          <Tabs screenOptions={{tabBarStyle:{backgroundColor:'#000', height:100, position:'absolute', 
            
           }, 
          tabBarItemStyle:{
            height:48,
            width:48,
            margin:'auto',
            alignItems:'center',
            justifyContent:'center',
            
          
          },
        
          tabBarButton: (props) => {
            const focused = props.accessibilityState;
            console.log('tab button accessibilityState', props.accessibilityState?.selected); // debug

            return (
            <Pressable
              {...props}
              style={({ }) => [
                {
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 50,
                  height: 50,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  
                },
              ]}
            >
              {props.children}
            </Pressable>
          );
        },
      }}
    >
            <Tabs.Screen name="menu" 
              options={{
                title:'Menu', headerTitleStyle:{ color:'#fff', fontSize:23, fontWeight:'bold' },
                headerBackground: () => (
                  <View style={{ backgroundColor: "#000000ff", height: 78}} />
                ),
                tabBarIcon:({focused})=> (

                  <View style={{
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 50,
                  height: 50,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform:[{scale:focused ? 1.2 : 0.9}]

                  }}>
                    <MaterialCommunityIcons name="menu"  size={25} color="#fff" />
                  </View>

                )
              
              }}
            />
            <Tabs.Screen name="ofertas" 
            
              options={{
                headerBackground: () => (
                  <View style={{ backgroundColor: "#000000ff", height: 78}} />
                ),
                title:'Ofertas', headerTitleStyle:{ color:'#fff', fontSize:23, fontWeight:'bold' },
              tabBarIcon:({focused})=> (

                  <View style={{
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 50,
                  height: 50,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform:[{scale:focused ? 1.2 : 0.9}]
                  

                  }}>
                    <MaterialCommunityIcons name="qrcode-scan"  size={25} color="#fff" />
                  </View>

                )
              }}
            />
            <Tabs.Screen  name="home" 
              options={{
                headerBackground: () => (
                  <View style={{ backgroundColor: "#000000ff", height: 78}} />
                ),

                title:'Home ', headerTitleStyle:{ color:'#fff', fontSize:23, fontWeight:'bold' },

                tabBarIcon:({focused})=> (

                  <View style={{
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 50,
                  height: 50,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform:[{scale:focused ? 1.2 : 0.9}]

                  }}>
                    <Entypo name="home" size={25} color="#fff" />
                  </View>

                )
                
              }}
            />
            <Tabs.Screen name="work" 
              options={{
                title:'Tarefas', headerTitleStyle:{ color:'#fff', fontSize:23, fontWeight:'bold' },
                headerBackground: () => (
                  <View style={{ backgroundColor: "#000000ff", height: 78}} />
                ),
                tabBarIcon:({focused})=> (

                  <View style={{
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 50,
                  height: 50,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform:[{scale:focused ? 1.2 : 0.9}]

                  }}>
                    <FontAwesome name="table" size={24} color="#fff" />
                  </View>

                )
                
              }}
            />
            <Tabs.Screen name="config" 
              options={{
                headerBackground: () => (
                  <View style={{ backgroundColor: "#000000ff", height: 78}} />
                ),
                title:'Perfil', headerTitleStyle:{ color:'#fff', fontSize:23, fontWeight:'bold' },
               
                tabBarIcon:({focused})=> (

                  <View style={{
                  backgroundColor: focused ? '#ffffff2c' : 'transparent',
                  width: 51,
                  height: 52,
                  borderRadius: 60 / 2, // garante que é um círculo perfeito
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform:[{scale:focused ? 1.2 : 0.9 }],
                  shadowOpacity:'#fff'
                  
                  
    

                  }}>
                   <FontAwesome name="user-circle" size={26} color="#fff" />
                  </View>

                )
              }}
            />
          </Tabs>
       
  );
}



