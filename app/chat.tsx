import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Alert, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useRouter } from 'expo-router'
import { Ionicons, AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { useFonts } from 'expo-font';

import Constants from "expo-constants";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '../backend/address';

import { launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';

import Icon from 'react-native-vector-icons/MaterialIcons';
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
    const [message, setMessage] = useState('');
    const fakeUsers = [
        { id: 1, name: 'Alice', photo: 'https://example.com/photo1.jpg' },
        { id: 2, name: 'Bob', photo: 'https://example.com/photo2.jpg' },
        { id: 3, name: 'Charlie', photo: 'https://example.com/photo3.jpg' },
        // Add more fake users as needed
    ];



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



    const sendMessage = () => {
        if (message.trim()) {
            console.log('发送消息:', message);
            setMessage(''); 
        }
    };

    return (
        <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: 'white' }}>
            {/* background */}
            <View style={{ width: '100%', height: '10%', position: 'absolute', zIndex: 1 }}>

                <View style={{ backgroundColor: 'skyblue', width: '100%', height: '100%' }}>

                </View>
            </View>
            <View style={{ width: '100%', position: 'relative', zIndex: 50, paddingTop: Constants.statusBarHeight }}>
                {/* header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name='chevron-back' size={20} color={'black'} />
                        </View>

                        <View style={{ marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ marginRight: 10 }}>
                                    <View style={{ overflow: 'hidden' }}>
                                        {photoPath ? (
                                            <Image source={{ uri: photoPath }} style={{ width: 40, height: 40, borderWidth: 2, borderColor: 'white', borderRadius: 32 }} />
                                        ) : (
                                            <Image source={require('../assets/images/favicon.png')} style={{ width: 64, height: 64, borderWidth: 2, borderColor: 'white', borderRadius: 32 }} />
                                        )}
                                    </View>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>{fullName}</Text>
                                    <Text style={{ fontSize: 12, color: '#90EE90', fontWeight: '500' }}>Online</Text>

                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            </ScrollView>
            <View className="flex flex-row items-center p-2 border border-blue-500 rounded bg-gray-100 mt-30 justifyContent: 'flex-end'" style={{ width: '87%' }}>
                <View className="flex flex-row flex-grow items-center">
                    <TextInput
                        className="flex-grow p-2 border-none outline-none rounded bg-white max-h-24"
                        placeholder="Input message..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <View className="flex flex-row ml-2">
                        <TouchableOpacity>
                            <Icon name="attach-file" size={24} color="#007bff" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-2">
                            <Icon name="insert-emoticon" size={24} color="#007bff" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={sendMessage} className="ml-2 rounded px-4 py-2 bg-transparent">
                    <Icon name="send" size={30} color="#007BFF" /> 
                </TouchableOpacity>

            </View>

        </View>

    )
}

export default MyAccountScreen