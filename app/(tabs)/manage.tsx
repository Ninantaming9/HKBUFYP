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
  return (
    <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: 'white' }}>
      {/* background */}
      <View style={{ width: '100%', height: '40%', position: 'absolute', zIndex: 1 }}>
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

            <TouchableOpacity>
              <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="sharealt" size={20} color="black" />
              </View>
            </TouchableOpacity>

          </View>
        </View>
        {/* end header */}
      </View>
      <ScrollView style={{ width: '100%', position: 'relative', zIndex: 2 }}>

        <View style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>


          {/* avatar */}
          <View>
            <TouchableOpacity onPress={handleChoosePhoto}>
              <View style={{ width: 100, height: 100, backgroundColor: '#FFF', borderRadius: 20, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                {photoPath ? (
                  <Image source={{ uri: photoPath }} style={{ width: 80, height: 80, borderRadius: 20, alignSelf: 'center' }} />
                ) : (
                  <Image source={require('../../assets/images/avatar/1.png')} style={{ width: 80, height: 80, borderRadius: 20, alignSelf: 'center' }} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 22, alignSelf: 'center', marginTop: 10, fontFamily: 'HelvetIns', color: '#000' }}>{fullName}</Text>
            {/* <TouchableOpacity style={{width:120,margin:'auto',padding:5, borderRadius:20,backgroundColor:'#fcf864',justifyContent:'center',alignItems:'center',marginTop:10}}>
                                      <Text style={{fontSize:13,alignSelf:'center',fontFamily:'Montserrat',color:'#000'}}>Join 5 year</Text>
                                  </TouchableOpacity> */}
          </View>


          {/* end avatar */}

          {/* body */}
          <View style={{ flex: 1, paddingTop: 30, height: '100%' }}>

            <View style={{ width: '100%', backgroundColor: '#fff', borderTopRightRadius: 30, borderTopLeftRadius: 30, padding: 30 }}>
              {/* <TouchableOpacity style={{width:'100%',paddingHorizontal:10,paddingVertical:15}}>
                                        <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                            <View style={{width:35,height:35,borderRadius:8,backgroundColor:'#066ce7',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                              <AntDesign name="wechat" size={20} color="#fff" />
                                              
                                            </View>
                                            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:16,fontFamily:'Montserrat',color:'#000'}}>Start a Chat</Text>
                                                <Ionicons name='chevron-forward' size={24} color="black" />
                                                
                                            </View>
                                        </View>
                                      </TouchableOpacity> */}
              {/* <TouchableOpacity style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#e7c506', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <AntDesign name="edit" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000' }}>Edit Profle</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity> */}
              {/* <TouchableOpacity onPress={() => router.push("/changePassword")} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#facb1d', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome name="sign-out" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000', lineHeight: 24 }}>Edit Password</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity> */}

              {/* <TouchableOpacity style={{width:'100%',paddingHorizontal:10,paddingVertical:15}}>
                                        <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                            <View style={{width:35,height:35,borderRadius:8,backgroundColor:'#feb149',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                              <AntDesign name="edit" size={20} color="#fff" />
                                            </View>
                                            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:16,fontFamily:'Montserrat',color:'#000'}}>Expert replies</Text>
                                                <Ionicons name='chevron-forward' size={24} color="black" />
                                            </View>
                                        </View>
                                      </TouchableOpacity> */}
              {<TouchableOpacity onPress={() => router.push("/changePassword")} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#ae49fe', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <MaterialIcons name="preview" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, color: '#000' }}>Edit Password</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>}

              
              <TouchableOpacity style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#370ca9', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <AntDesign name="setting" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, color: '#000' }}>Settings</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleLogout()} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <MaterialIcons name="grid-view" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000' }}>View QR code</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => handleEditaccount()} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000' }}>Log out</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity onPress={() => handleLogout()} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#facb1d', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome name="sign-out" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000', lineHeight: 24 }}>Logout</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>

              </TouchableOpacity>
 */}

            </View>
          </View>

          {/* end body */}

        </View>
      </ScrollView>

    </View>
  )
}

export default MyAccountScreen