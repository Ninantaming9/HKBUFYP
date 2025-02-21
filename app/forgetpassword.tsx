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
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Request code, Step 2: Reset password
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestCode = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
      }

      const response = await axios.post(`${API_URL}/requestPasswordReset`, { email });

      if (response.data.message === 'Confirmation code sent to your email.') {
        Alert.alert('Success', 'A confirmation code has been sent to your email.');
        setStep(2); // Move to the next step
      } else {
        Alert.alert('Error', response.data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send confirmation code.');
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!confirmationCode || !newPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const response = await axios.post(`${API_URL}/resetPassword`, {
        email,
        confirmationCode,
        newPassword,
      });

      if (response.data.message === 'Password has been reset successfully.') {
        Alert.alert('Success', 'Your password has been reset successfully.', [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]);
      } else {
        Alert.alert('Error', response.data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password.');
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={globals.container}>
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
        <HStack gap={10} style={{ marginLeft: 80, marginTop: 80 }}>
  <Text fontSize={30} bold mb={20}>Password Reset</Text>
  <TabBarIcon name="ticket" size={50} />
</HStack>

      </View>
      <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>
        
        <VStack w={"100%"} gap={30} style={{  marginTop: -200 }}>
          {step === 1 && (
            <>
              <HStack alignItems="center" w="100%">
                <Ionicons name="mail-outline" size={30} color="gray" style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text ml={10} fontSize={14} color="gray">Input need reset email</Text>
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
                </View>
              </HStack>
              <Pressable onPress={handleRequestCode} className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
                <Text className="text-white font-bold text-lg">Send Confirmation Code</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <HStack alignItems="center" w="100%">
                <Ionicons name="key-outline" size={30} color="gray" style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  
                  <Input
                    value={confirmationCode}
                    onChangeText={setConfirmationCode}
                    placeholder="Enter Confirmation Code"
                    placeholderTextColor="darkgray"
                    autoCapitalize="none"
                    autoCorrect={false}
                    h={48}
                    p={14}
                  />
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

              <Pressable onPress={handleResetPassword} className="bg-[#12B3A8] rounded-lg justify-center items-center py-4">
                <Text className="text-white font-bold text-lg">Reset Password</Text>
              </Pressable>
            </>
          )}
        </VStack>
      </VStack>
    </KeyboardAvoidingView>
  );
}