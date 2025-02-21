import { useEffect, useState } from 'react';
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
import { router, useRouter } from 'expo-router';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../backend/address';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function Login() {
  const router = useRouter(); 
const route = useRoute(); 
  const [showPassword, setShowPassword] = useState(false);


  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [userId, setUserId] = useState<string | null>(null); 

  const getUserId = async () => {
    
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId !== null) {
        setUserId(storedUserId); 
      }
    
  };


  useEffect(() => {
    getUserId();
  }, []);


  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/changePassword`, {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      Alert.alert('Success', response.data.message);
      router.back();
    } catch (error) {
      console.log('Error changing password', error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to change password. Please try again.';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };


  return (
    <KeyboardAvoidingView behavior="padding" style={globals.container}>
      <ScrollView contentContainerStyle={globals.container}>
      <View style={{ width: '100%', position: 'relative', zIndex: 50, paddingTop: Constants.statusBarHeight }}>
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
      </View>
     
        <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>

          <HStack gap={10}>
            <Text fontSize={30} bold mb={20}>Change Password</Text>
            <TabBarIcon name="ticket" size={50} />
          </HStack >

          <VStack w={"100%"} gap={30}>

<HStack alignItems="center" w="100%">
        <Ionicons name="lock-open-outline" size={30} color="gray" style={{ marginRight: 15 }} />
        <View style={{ flex: 1, position: 'relative' }}>
          <Input
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showPassword} // Control password visibility based on state
            placeholder="Old Password"
            placeholderTextColor="darkgray"
            autoCapitalize="none"
            autoCorrect={false}
            h={55}
            p={14}
            w="100%"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: 12, // Adjust position to fit the input box
            }}
          >
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={30} color="gray" />
          </Pressable>
        </View>
      </HStack>

          <HStack alignItems="center" w="100%">
                  <Ionicons name="lock-closed-outline" size={30} color="gray" style={{ marginRight: 15 }} />
                  <View style={{ flex: 1, position: 'relative' }}>
                    <Input
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword} // Control password visibility based on state
                      placeholder="New Password"
                      placeholderTextColor="darkgray"
                      autoCapitalize="none"
                      autoCorrect={false}
                      h={55}
                      p={14}
                      w="100%"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: 12, // Adjust position to fit the input box
                      }}
                    >
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={30} color="gray" />
                    </Pressable>
                  </View>
                </HStack>

           <HStack alignItems="center" w="100%">
                   <Ionicons name="lock-closed-outline" size={30} color="gray" style={{ marginRight: 15 }} />
                   <View style={{ flex: 1, position: 'relative' }}>
                     <Input
                       value={confirmPassword}
                       onChangeText={setConfirmPassword}
                       secureTextEntry={!showPassword} // Control password visibility based on state
                       placeholder="Confirm Password"
                       placeholderTextColor="darkgray"
                       autoCapitalize="none"
                       autoCorrect={false}
                       h={55}
                       p={14}
                       w="100%"
                     />
                     <Pressable
                       onPress={() => setShowPassword(!showPassword)}
                       style={{
                         position: 'absolute',
                         right: 10,
                         top: 12, // Adjust position to fit the input box
                       }}
                     >
                       <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={30} color="gray" />
                     </Pressable>
                   </View>
                 </HStack>


            {/* <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">Phone</Text>
              <Input
                value={mobile}
                onChangeText={setMobile}
                secureTextEntry
                placeholder="Phone"
                placeholderTextColor="darkgray"
                autoCapitalize="none"
                autoCorrect={false}
                h={48}
                p={14}
              />
            </VStack> */}

        
        

            {/* <Button isLoading={ isLoadingAuth } onPress={ onAuthenticate }>{ authMode }</Button> */}

          </VStack>

          {/* <Divider w={ "90%" } />
          <Text onPress={ onToggleAuthMode } fontSize={ 16 } underline>
            Login
          </Text> */}

          <View className='h-1/4 w-full justify-start pt-8 px-4'>
            <Pressable  onPress={()=>handleChangePassword()} 
              className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
              <Text className="text-white font-bold text-lg">Confirm
              </Text>
            </Pressable>
          </View>


          {/* <Text onPress={onToggleAuthMode} fontSize={16} underline>
            {authMode === 'login' ? 'Register new account' : 'Login to account'}
          </Text> */}
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView >
  );
}
