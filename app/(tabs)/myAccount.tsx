import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useRouter } from 'expo-router'
import { Ionicons, AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { useFonts } from 'expo-font';
// 📗 khai báo thư viện mà expo hổ trỡ để lấy giá trị chiều cao  statusBar
import Constants from "expo-constants";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '../../backend/address';

import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';

const MyAccountScreen = () => {
  const [fullName, setFullName] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [userId, setUserId] = useState('');

  const options: ImageLibraryOptions = {
    mediaType: 'photo', // This should be 'photo' or 'video'
    includeBase64: true,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 从 AsyncStorage 中获取用户全名
        const storedFullName = await AsyncStorage.getItem('user');
        // 从 AsyncStorage 中获取用户 ID
        const storedUserId = await AsyncStorage.getItem('user');

        // 如果存在，更新状态
        if (storedFullName) {
          setFullName(JSON.parse(storedFullName)); // 解析 JSON 字符串
        }

        if (storedUserId) {
          setUserId(JSON.parse(storedUserId)); // 解析 JSON 字符串
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
    // 执行退出操作
    // 导航到登录页面
    router.push('/login');
  };

  const handleImageUpload = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (!response.assets || response.assets.length === 0) {
        console.log('No image selected or an error occurred');
        Alert.alert('Error', 'No image selected or an error occurred');
      } else {
        const asset: Asset = response.assets[0]; // Get the first asset

        // Ensure uri, type, and name are defined
        const uri = asset.uri || '';
        const type = asset.type || 'image/jpeg'; // Default type if undefined
        const name = asset.fileName || 'photo.jpg'; // Default name if undefined

        const formData = new FormData();
        formData.append('photo', {
          uri: uri,
          type: type,
          name: name,
        } as any); // Use 'as any' to bypass TypeScript error

        formData.append('userId', userId);

        // Upload the image to the server
        fetch(`http://${API_URL}/uploadProfilePicture`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              Alert.alert('Error', data.error);
            } else {
              Alert.alert('Success', data.message);
              // Optionally, update the state to reflect the new profile picture
            }
          })
          .catch((error) => {
            console.error('Error uploading profile picture:', error);
            Alert.alert('Error', 'Failed to upload profile picture.');
          });
      }
    });
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
            <TouchableOpacity onPress={handleImageUpload}>
              <View style={{ width: 100, height: 100, backgroundColor: '#FFF', borderRadius: 20, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={require('../../assets/images/avatar/1.png')} style={{ width: 80, height: 80, borderRadius: 20, alignSelf: 'center' }} />
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
              <TouchableOpacity style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#e7c506', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <AntDesign name="edit" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000' }}>Edit Profle</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/changePassword")} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#facb1d', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome name="sign-out" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000', lineHeight: 24 }}>Edit password</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
              {/* <TouchableOpacity style={{width:'100%',paddingHorizontal:10,paddingVertical:15}}>
                                        <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                            <View style={{width:35,height:35,borderRadius:8,backgroundColor:'#000',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                             
                                              <MaterialIcons name="grid-view" size={20} color="#fff" />
                                            </View>
                                            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:16,fontFamily:'Montserrat',color:'#000'}}>Views Blocked Users</Text>
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
              {/* <TouchableOpacity style={{width:'100%',paddingHorizontal:10,paddingVertical:15}}>
                                        <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                            <View style={{width:35,height:35,borderRadius:8,backgroundColor:'#ae49fe',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                             
                                              <MaterialIcons name="preview" size={20} color="#fff" />
                                            </View>
                                            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:16,fontFamily:'Montserrat',color:'#000'}}>Review Ratings</Text>
                                                <Ionicons name='chevron-forward' size={24} color="black" />
                                            </View>
                                        </View>
                                      </TouchableOpacity> */}
              <TouchableOpacity style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 35, height: 35, borderRadius: 8, backgroundColor: '#370ca9', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <AntDesign name="setting" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat', color: '#000' }}>Settings</Text>
                    <Ionicons name='chevron-forward' size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLogout()} style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
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


            </View>
          </View>

          {/* end body */}

        </View>
      </ScrollView>

    </View>
  )
}

export default MyAccountScreen