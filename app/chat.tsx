import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Alert, TextInput, FlatList } from 'react-native'
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
    const [userId, setUserId] = useState('');
    // const [loading, setLoading] = useState(false);
    const [photoPath, setPhotoPath] = useState<string | null>(null);
    const route = useRoute();
    const [message, setMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();
    const { fullname, flightId, photo, friendEmail } = route.params as RouteParams;
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null); // 修改类型
    interface RouteParams {
        flightId: string;
        fullname: string; // Add fullname to the type
        photo: string;
        friendEmail: string;
    }

    interface Message {
        _id: string;
        senderemail: string;
        receiveremail: string;
        content: string;
        timestamp: string;

    }

    interface ChatHistoryProps {
        userEmail: string;
        friendEmail: string;
    }

    useEffect(() => {
        const fetchChatHistory = async () => {
            setLoading(true); // 在开始请求之前设置加载状态
            try {
                console.log("Fetching chat history for:", { userEmail, friendEmail });
                const response = await axios.post(`${API_URL}/chathistory`, {
                    useremail: userEmail, // 确保这里的字段名是正确的
                    receiveremail: friendEmail,
                });
                setChatHistory(response.data.data); // 假设响应数据在 data 属性中
                console.log("Fetched chat history:", response.data); // 打印获取的聊天记录
            } catch (error) {
                setError('Error fetching chat history');
            } finally {
                setLoading(false); // 请求完成后重置加载状态
            }
        };

        fetchChatHistory();
    }, [userEmail, friendEmail]);

    useEffect(() => {
        const fetchUserEmailAndFriends = async () => {
            try {
                // Retrieve user email from AsyncStorage
                const storedUserEmail = await AsyncStorage.getItem('userEmail');
                if (storedUserEmail) {
                    const email = JSON.parse(storedUserEmail);
                    setUserEmail(email);
                }
            } catch (error) {
                console.error('Error fetching user data', error);
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

    const sendMessage = async () => {
        if (message.trim()) {
            // 创建新消息对象，确保包含所有必需的属性
            const newMessage: Message = {
                _id: generateUniqueId(), // 生成唯一 ID 的函数
                content: message,
                senderemail: userEmail,
                receiveremail: friendEmail,
                timestamp: new Date().toISOString(),

            };

            // 先将新消息添加到 chatHistory
            setChatHistory(prevChatHistory => [...prevChatHistory, newMessage]);

            try {
                // 发送消息到后端
                const response = await axios.post(`${API_URL}/chatMessage`, {
                    senderemail: userEmail,
                    receiveremail: friendEmail,
                    content: message,
                });
                console.log('Message sent successfully:', response.data);
                setMessage(''); // 清空输入框
            } catch (error) {
                console.error('Error sending message:', error);
                // 如果发送失败，可以选择从 chatHistory 中移除刚刚添加的消息
                setChatHistory(prevChatHistory => prevChatHistory.filter(msg => msg._id !== newMessage._id));
            }
        }
    };

    // 生成唯一 ID 的示例函数
    const generateUniqueId = () => {
        return Math.random().toString(36).substr(2, 9); // 生成一个简单的随机字符串
    };



    return (
        <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: 'white' }}>
            {/* background */}
            <View style={{ width: '100%', height: '12%', position: 'absolute', zIndex: 1 }}>

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
                                        {photo ? (

                                            <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} className="w-16 h-16 border-2 border-white rounded-full" />
                                        ) : (
                                            <Image source={require('../assets/images/favicon.png')} style={{ width: 64, height: 64, borderWidth: 2, borderColor: 'white', borderRadius: 32 }} />
                                        )}
                                    </View>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>{fullname}</Text>
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

            </View>

            <ScrollView style={{ width: '100%', position: 'relative', zIndex: 2, paddingTop: 20 }}>
                {chatHistory
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // 按时间升序排序
                    .map((item, index) => {
                        const currentTimestamp = new Date(item.timestamp).getTime();
                        const previousTimestamp = index > 0 ? new Date(chatHistory[index - 1].timestamp).getTime() : null;

                        // 计算时间间隔
                        const showTimestamp = previousTimestamp === null || (currentTimestamp - previousTimestamp) > 10 * 60 * 1000;

                        // 格式化日期为 YYYY/MM/DD
                        const date = new Date(item.timestamp);
                        const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

                        // 格式化时间为 12小时制
                        const hours = date.getHours();
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const formattedTime = `${hours % 12 || 12}:${minutes}${ampm}`; // 12小时制格式化

                        return (
                            <View key={index} style={{ marginVertical: 5 }}>
                                {showTimestamp && (
                                    <Text style={{ textAlign: 'center', marginVertical: 5, fontWeight: 'bold' }}>
                                        {`${formattedDate} ${formattedTime}`}
                                    </Text>
                                )}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: item.senderemail === userEmail ? 'flex-end' : 'flex-start',
                                }}>
                                    <Text style={{
                                        backgroundColor: item.senderemail === userEmail ? '#d1e7dd' : '#f8d7da',
                                        padding: 10,
                                        borderRadius: 5,
                                        maxWidth: '80%', // 限制消息宽度
                                    }}>
                                        {`${item.content}`}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                     <View style={{ height: 20 }} /> 
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