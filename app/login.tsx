import { useState } from 'react';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { HStack } from '@/components/HStack';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
// import { useAuth } from '@/context/AuthContext';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { globals } from '@/styles/_global';
import { router } from 'expo-router';
import axios, { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../backend/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../backend/address';
import { AntDesign, Ionicons } from '@expo/vector-icons';
export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async () => {
    try {
      const userData = {
    
        email: email,
        password: password
      };
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter email format");
        return;
      }

      const response = await axios.post(`${API_URL}/login`, userData);
      if (response.data.message === 'Login successful') {
        Alert.alert('Login successful', '', [
            {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.setItem('userId', response.data.userId);
                  await AsyncStorage.setItem('user', JSON.stringify(response.data.fullname));
                  router.push({
                    pathname: "/(tabs)/search",
                    params: { userId: response.data.userId } // 传递 userId
                  });
                }
            }
        ]);
    } else {
        if (response.data.message === 'Invalid email') {
          Alert.alert('ERROR', 'Invalid email');
        } else if (response.data.message === 'Invalid password') {
          Alert.alert('ERROR', 'Invalid password');
        } else {
          Alert.alert('ERROR', 'Account and password do not match');
        }
        console.log('Login failed');
      }
    }  catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('ERROR', error.response.data.message);
      } else {
        Alert.alert('ERROR', 'An error occurred during login');
      }

    }
  };
  
  return (
    <KeyboardAvoidingView behavior="padding" style={globals.container}>
      <ScrollView contentContainerStyle={globals.container}>
  

        <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>

          <HStack gap={10}>
            <Text fontSize={30} bold mb={20}>Airline Ticket Booking</Text>
            <TabBarIcon name="ticket" size={50} />
          </HStack >

          <VStack w={"100%"} gap={30}>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={48}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">Password</Text>
              <Input
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={48}
                p={14}
              />
            </VStack>

            {/* <Button isLoading={ isLoadingAuth } onPress={ onAuthenticate }>{ authMode }</Button> */}

          </VStack>

          {/* <Divider w={ "90%" } />
          <Text onPress={ onToggleAuthMode } fontSize={ 16 } underline>
            Login
          </Text> */}

          <View className='h-1/4 w-full justify-start pt-8 px-4'>
            <Pressable
                onPress={()=>handleSubmit()}
              // onPress={() => router.push("/search")}
              className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
              <Text className="text-white font-bold text-lg">Login

              </Text>

            </Pressable>

            <View className='flex-row mt-4 w-full justify-center gap-2'>
              <Text className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
                Don't have account?
              </Text>
        
              <Pressable
              onPress={() => router.push("/register")}>
                <Text style={{ color: '#FF7F7F' }} className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
                
                Register
              </Text>

            </Pressable>

            </View>

          </View>
          {/* <Text onPress={onToggleAuthMode} fontSize={16} underline>
            {authMode === 'login' ? 'Register new account' : 'Login to account'}
          </Text> */}
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView >
  );
}
