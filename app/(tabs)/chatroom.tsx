import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useRouter } from 'expo-router'
import { Ionicons, AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { useFonts } from 'expo-font';

import Constants from "expo-constants";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '../../backend/address';

import { launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';

const MyAccountScreen = () => {
  const [fullName, setFullName] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [userId, setUserId] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | null>(null);

  const [number1, Setnumber1] = useState('Edit Password');
  const [number2, Setnumber2] = useState('Logout');
  const [number3, Setnumber3] = useState('Detail  Account');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(null);
  //const userEmail = 'zmhaoo@gmail.com'; // 替换为当前用户的邮箱
  const router = useRouter(); // Initialize the router



  interface Friend {
    _id: string; // 假设每个好友都有一个唯一的 id
    name: string; // 假设好友有一个名字字段
    userEmail: string;
    friendEmail: string;
    fullname: string;
    photo: string;
  }


  useEffect(() => {
    const fetchUserEmailAndFriends = async () => {
      try {
        // Retrieve user email from AsyncStorage
        const storedUserEmail = await AsyncStorage.getItem('userEmail');
        if (storedUserEmail) {
          const email = JSON.parse(storedUserEmail);
          setUserEmail(email);

          // Fetch friends after setting the user email
          const response = await axios.get(`${API_URL}/getFriends/`, {
            params: { userEmail: email },
          });
          setFriends(response.data.friends);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.message || 'Error fetching friends');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchUserEmailAndFriends();
  }, []); // Empty dependency array to run only once on mount

  const handleChoosePhoto = async () => {
    console.log('photo use');


    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('error');
      return;
    }


    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    };

    try {
      const response = await ImagePicker.launchImageLibraryAsync(options);
      console.log('ImagePicker reponse:', response);

      if (response.canceled) {
        console.log('photo canceled ');
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri; // Get the URI from the first asset

        uploadPhoto(uri);
      } else {
        Alert.alert('error', 'no select any photo');
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
    }
  };

  const uploadPhoto = async (uri: string) => {
    const formData = new FormData();
    const file = {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as const;

    formData.append('photo', file as any);
    formData.append('userId', userId);

    setLoading(true);


    try {
      const response = await axios.post(`${API_URL}/uploadPhoto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      setPhotoPath(uri);
      await AsyncStorage.setItem('photoPath', uri);
      Alert.alert('success upload', response.data.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchUserPhoto = async (userId: string) => {

    const response = await axios.get(`${API_URL}/getPhoto/${userId}`);

    setPhotoPath(response.data.photoPath);

  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const userId = await AsyncStorage.getItem('userId');
        const storedFullName = await AsyncStorage.getItem('user');


        if (userId) {
          fetchUserPhoto(userId);
          setUserId(userId);
        }


        if (storedFullName) {
          setFullName(JSON.parse(storedFullName));
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, []);


  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Click OK to log out',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Canceled logout'),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => handleLogoutConfirmed() }
      ],
      { cancelable: false }
    );
  };

  const handleLogoutConfirmed = () => {
    router.push('/login');
  };



  const handleEditaccount = () => {
    router.push('/login');
  };



  const [fontsLoaded, fontError] = useFonts({
    HelvetIns: require("../../assets/fonts/HelvetIns.ttf"),
    PlaywriteNL: require("../../assets/fonts/Playwrite_NL/Playwrite-NL.ttf"),
    Montserrat: require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),

  });



  const handleClick = async (friendId: any) => {
    try {
        const response = await fetch(`${API_URL}/findFriends`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ friendId }), 
        });
        if (response.ok) {
            const friendsDetails = await response.json();
            router.push({
                pathname: "/chat",
                params: { 
                    userEmail: friendsDetails.userEmail,
                    friendEmail: friendsDetails.friendEmail,
                    fullname: friendsDetails.fullname,
                    photo: friendsDetails.photo,
                }, 
            });
        } else {
            const errorData = await response.json();
            console.log('Error finding friend:', errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


const handleChat = () => {
 
};

  return (
    <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: 'white' }}>
      {/* background */}
      <View style={{ width: '100%', height: '17%', position: 'absolute', zIndex: 1 }}>
        {/* <Image source={require('../../assets/images/travel/1.jpg')} style={{width:'100%',height:'100%'}} /> */}
        <View style={{ backgroundColor: '#77fc89', width: '100%', height: '100%' }}>

        </View>
      </View>
      <View style={{ width: '100%', position: 'relative', zIndex: 50, paddingTop: Constants.statusBarHeight }}>
        {/* header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name='chevron-back' size={20} color={'black'} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={handleChat}>
              <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="adduser" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </View>

        </View>
        {/* end header */}
      </View>
      <ScrollView style={{ width: '100%', position: 'relative', zIndex: 2 }}>

        <View style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>
          <View className='flex-row justify-between items-center px-2' style={{ marginTop: 15 }}>
            <View className='w-1/2 flex-row h-14'>
              <View className='pr-2'>
                <View className='overflow-hidden'>
                  {photoPath ? (
                    <Image source={{ uri: photoPath }} className="w-16 h-16 border-2 border-white rounded-full" />
                  ) : (
                    <Image source={require('../../assets/images/favicon.png')} className="w-16 h-16 border-2 border-white rounded-full" />
                  )}
                </View>
              </View>
              <View>
                <Text className='text-base text-neutral-400 font-medium'>Welcome Back</Text>
                <Text className='text-xl text-white font-bold'>{fullName}</Text>
              </View>
            </View>

            <View>
              <Text className='text-base text-neutral-1000 font-medium'>Chat room</Text>
            </View>
          </View>

          {friends.map((friends, index) => (
        <TouchableOpacity key={index} onPress={() => handleClick(friends._id)}>
          
          <View className='flex-row justify-between items-center px-2' style={{ marginTop: 30 }}>
            <View className='w-1/2 flex-row h-14'>
              <View className='pr-2'>
                <View className='overflow-hidden'>
                  {friends.photo ? (
                    <Image source={{ uri: `data:image/jpeg;base64,${friends.photo}` }} className="w-16 h-16 border-2 border-white rounded-full" />
                  ) : (
                    <Image source={require('../../assets/images/favicon.png')} className="w-16 h-16 border-2 border-white rounded-full" />
                  )}
                </View>
              </View>
              <View>
                <Text className='text-base text-neutral-400 font-medium'>Welcome Back</Text>
                <Text className='text-xl text-black font-bold'>{friends.fullname}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}



          {/* end body */}
        </View>
      </ScrollView>

    </View>
  )
}

export default MyAccountScreen