import React, { useState } from 'react';
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
import axios from 'axios';
import { API_URL } from '../backend/address';
import Icon from 'react-native-vector-icons/FontAwesome'; // 假设您选择了FontAwesome图标库
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   

      if (!fullname || !email || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (!emailPattern.test(email)) {
        alert("Please enter email format");
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password should be at least 6 characters long');
        return;
      }

   


      const userData = {
        fullname:fullname,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      };

      const response = await axios.post(`${API_URL}/register`, userData);
 

      if (response.data.message === 'User registered successfully') {
        Alert.alert('User register successful', '', [
          {
              text: 'OK',
              onPress: async () => {
               
                router.push("/login")
              }
          }
      ]);
      } else {
  
        if (response.status === 400 && response.data.message === 'Email is already registered') {
          Alert.alert('Error', 'Email is already registered');
        } else {
          Alert.alert('Error', response.data.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Email is already registered');
    }
  };


  return (
    <KeyboardAvoidingView behavior="padding" style={globals.container}>
      <ScrollView contentContainerStyle={globals.container}>

      <View style={{ width: '100%', position: 'relative', zIndex: 50, paddingTop: Constants.statusBarHeight }}>
        {/* header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#888', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name='chevron-back' size={20} color={'black'} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>

            <TouchableOpacity>
              <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="sharealt" size={20} color="black" />
              </View>
            </TouchableOpacity>

          </View>
        </View>
        {/* end header */}
      </View>
        <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>
          <HStack gap={10}>
            <Text fontSize={30} bold mb={20}>Register Account</Text>
            <TabBarIcon name="ticket" size={50} />
          </HStack>

          <VStack w={"100%"} gap={30}>

          <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">Full name</Text>
              <Input
                value={fullname}
                onChangeText={setFullname}
                placeholder="Your full name"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={48}
                p={14}
              />
            </VStack>

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
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="darkgray"
                  autoCapitalize="none"
                  autoCorrect={false}
                  h={48}
                  p={14}
                // 删除不支持的属性
                />
               
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">Confirm Password</Text>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm Password"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={48}
                p={14}

              />

            </VStack>
          </VStack>

          <View className='h-1/4 w-full justify-start pt-8 px-4'>
            <Pressable
              onPress={handleSubmit}
              className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
              <Text className="text-white font-bold text-lg">Confirm</Text>
            </Pressable>

            <View className='flex-row mt-4 w-full justify-center gap-2'>
              <Text className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
                Already have account?
              </Text>
        
              <Pressable
              onPress={() => router.push("/login")}>
                <Text style={{ color: '#FF7F7F' }} className="text-neutral-300 font-medium text-lg leading-[38px] text-center">
                
                Go Back!
              </Text>

            </Pressable>

            </View>
          </View>




        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );

}
