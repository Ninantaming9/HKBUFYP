import { useState } from 'react';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { HStack } from '@/components/HStack';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { globals } from '@/styles/_global';
import { router } from 'expo-router';
import axios, { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../backend/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../backend/address';
import { AntDesign, Ionicons } from '@expo/vector-icons';




export default function Login() {  
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async () => {
    try {
      const userData = {
        email: email,
        password: password,
      };
  
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email format");
        return;
      }
  
      const response = await axios.post(`${API_URL}/login`, userData)
        .catch(error => {
          console.error('Login request failed:', error);
          throw error;
        });
  
      console.log('Login response:', response.data);
  
      if (response.data.message === 'Login successful') {
        Alert.alert('Login successful', '', [
          {
            text: 'OK',
            onPress: async () => {
              await AsyncStorage.multiSet([
                ['userId', response.data.userId],
                ['user', JSON.stringify(response.data.fullname)],
                ['userRole', JSON.stringify(response.data.role)],
                ['userEmail', JSON.stringify(response.data.email)],
                ['token', response.data.token]
              ]);
  
              if (!response.data.token) {
                Alert.alert('Error', 'No token received');
                return;
              }
  
              const decodeJWT = (token: string) => {
                try {
                  const base64Url = token.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  return JSON.parse(
                    decodeURIComponent(
                      atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    )
                  );
                } catch (error) {
                  console.error('Manual JWT decode failed:', error);
                  return null;
                }
              };
  
        
              let decodedToken;
              try {
                decodedToken = decodeJWT(response.data.token); // 移除了重复的 const 声明
                console.log('Decoded token:', decodedToken);
              } catch (error) {
                console.error('JWT decode error:', error);
                Alert.alert('Error', 'Invalid token format');
                return;
              }
  
              if (!decodedToken?.exp) {
                console.error('Invalid token structure:', decodedToken);
                Alert.alert('Error', 'Token missing expiration time');
                return;
              }
  
              const expirationTime = decodedToken.exp * 1000;
              startTokenExpiryCheck(expirationTime);
  
              router.push('/(tabs)/search');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login');
    }
  };


const startTokenExpiryCheck = (expirationTime: number) => {
  const currentTime = Date.now();
  const timeLeft = expirationTime - currentTime;
  
  console.log(`Token will expire in ${timeLeft}ms`);
  
  if (timeLeft <= 0) {
    handleTokenExpiry();
    return;
  }
  
  setTimeout(handleTokenExpiry, timeLeft);
};

const handleTokenExpiry = async () => {
  console.log('Handling token expiry');
  Alert.alert(
    'Session Expired',
    'Your login session has expired. Please log in again.',
    [
      {
        text: 'OK',
        onPress: async () => {
          console.log('Clearing storage and redirecting to login');
          await AsyncStorage.multiRemove(['userId', 'user', 'userRole', 'userEmail', 'token']);
          router.replace('/login');
        },
      },
    ],
    { cancelable: false }
  );
};


// const handleSubmit = async () => {
//   try {
//     const userData = {
//       email: email,
//       password: password
//     };
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//       alert("Please enter a valid email format");
//       return;
//     }

//     const response = await axios.post(`${API_URL}/login`, userData);
//     if (response.data.message === 'Login successful') {
//       Alert.alert('Login successful', '', [
//         {
//           text: 'OK',
//           onPress: async () => {
//             // 存储用户信息
//             await AsyncStorage.setItem('userId', response.data.userId);
//             await AsyncStorage.setItem('user', JSON.stringify(response.data.fullname));
//             await AsyncStorage.setItem('userRole', JSON.stringify(response.data.role));
//             await AsyncStorage.setItem('userEmail', JSON.stringify(response.data.email));
//             await AsyncStorage.setItem('token', response.data.token); // 存储token
            
//             // 设置1分钟后的过期提醒
//             setTimeout(() => {
//               Alert.alert(
//                 'Session Expired',
//                 'Your login session has expired. Please log in again.',
//                 [
//                   {
//                     text: 'OK',
//                     onPress: () => {
//                       // 清除存储的数据
//                       AsyncStorage.multiRemove(['userId', 'user', 'userRole', 'userEmail', 'token']);
//                       // 跳转到登录页面
//                       router.replace('/login'); // 使用replace而不是push，避免返回
//                     }
//                   }
//                 ],
//                 { cancelable: false } // 用户必须点击OK，不能通过点击外部取消
//               );
//             }, 60000); // 1分钟 = 60,000毫秒

//             const userRole = response.data.role; 
//             router.push('/(tabs)/search');
//           }
//         }
//       ]);
//       } else {
//         if (response.data.message === 'Invalid email') {
//           Alert.alert('ERROR', 'Invalid email');
//         } else if (response.data.message === 'Invalid password') {
//           Alert.alert('ERROR', 'Invalid password');
//         } else {
//           Alert.alert('ERROR', 'Account and password do not match');
//         }
//         console.log('Login failed');
//       }
//     } catch (error: any) {
//       if (error.response && error.response.data && error.response.data.message) {
//         Alert.alert('ERROR', error.response.data.message);
//       } else {
//         Alert.alert('ERROR', 'An error occurred during login');
//       }
//     }
//   };


  return (
    <KeyboardAvoidingView behavior="padding" style={globals.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>



      <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>
        <HStack gap={10}>
          <Text fontSize={30} bold mb={20}>Airline Ticket Booking</Text>
          <TabBarIcon name="ticket" size={50} />
        </HStack>

        <VStack w={"100%"} gap={30}>
          <VStack gap={5}>
            <HStack alignItems="center" w="100%">
              <Ionicons name="mail-outline" size={30} color="gray" style={{ marginRight: 15 }} />
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={55}
                p={14}
                w="83%"
              />
            </HStack>
          </VStack>
          <VStack gap={5}>
            <HStack alignItems="center" w="100%">
              <Ionicons name="lock-closed-outline" size={30} color="gray" style={{ marginRight: 15 }} />
              <View style={{ flex: 1, position: 'relative' }}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} 
                  placeholder="Password"
                  placeholderTextColor="darkgray"
                  autoCapitalize="none"
                  autoCorrect={false}
                  h={55}
                  p={14}
                  w="98%"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 12, 
                  }}
                >
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={30} color="gray" />
                </Pressable>
              </View>
            </HStack>
          </VStack>
        </VStack>

        <View style={{ marginTop: -10 }} className='h-1/4 w-full justify-start pt-8 px-4'>
          <Pressable
            onPress={handleSubmit}
            className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
            <Text className="text-white font-bold text-lg">Login</Text>
          </Pressable>

          <View className='flex-row mt-4 w-full justify-end gap-2'>
            <Pressable onPress={() => router.push("/forgetpassword")}>
              <Text className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
                Forget password?
              </Text>
            </Pressable>
          </View>
        </View>



        <View className='flex-row mt-4 w-full justify-center gap-2'>
          <Text className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
            Don't have account?
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text style={{ color: '#FF7F7F' }} className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
              Register
            </Text>
          </Pressable>
        </View>

      </VStack>

    </KeyboardAvoidingView >
  );
}
