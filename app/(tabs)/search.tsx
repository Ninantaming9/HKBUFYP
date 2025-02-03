import {
    View,
    Text,
    ActivityIndicator,
    Pressable,
    TextInput,
    Alert,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
// import Header from "@/components/Header";
import {
    ArrowPathRoundedSquareIcon,
    ChevronDoubleRightIcon,
} from "react-native-heroicons/outline";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';

import Constants from "expo-constants";
// import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@/components/DateTimePicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from '../../backend/address';

const FlightScreen = () => {
    const [userId, setUserId] = useState('');
    const router = useRouter()
    // const [ticketType, setticketType] = useState('One Way');
    const [ticketType, setticketType] = useState("One Way");
    const [departureLocation, setdepartureLocation] = useState('Beijing');
    const [arrivalLocation, setarrivalLocation] = useState('Shanghai');
    const [cabinClass, setcabinClass] = useState('Economy Class');
    const [priceRange, setPriceRange] = useState('');
    const [departureTime, setDepartureTime] = useState("");
    const [arrivalTime, setArrivalTime] = useState("");
    const [ticketPrice, setTicketPrice] = useState("");
    const [searchResults, setSearchResults] = useState<Flight[]>([]);
    const [flightCount, setFlightCount] = useState(0);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [flightNumber, setFlightNumber] = useState("");
    const [flightData, setFlightData] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [date, setdate] = useState('');
    const [photoPath, setPhotoPath] = useState<string | null>(null);
    const [userRole, setUserRole] = useState(null);
    // const router = useRouter(); // 使用 useRouter 获取 router 实例
  
    const route = useRoute();
   
    const locations = [
        { label: 'Beijing', value: 'Beijing' },
        { label: 'Shanghai', value: 'Shanghai' },
        { label: 'Wuhan', value: 'Wuhan' },
        { label: 'Guangzhou', value: 'Guangzhou' }
    ];

    interface Flight {
        _id: string;
        flightNumber: string;
        departureTime: string;
        arrivalTime: string;
        departureLocation: string;
        arrivalLocation: string;
        ticketPrice: string;
        date: string,
        cabinClass: string,
    }


    const handleDateChange = (date: React.SetStateAction<string>) => {
        setdate(date);
    };



    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };




    const handleOptionChange = (option: React.SetStateAction<string>) => {
        setticketType(option);
    };


    const handleConfirm = (date: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
        setdate(formatDate(date));
        hideDatePicker();
    };

    const formatDate = (date: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };



    // 获取用户照片的函数
    const fetchUserPhoto = async (userId: string) => {
        const response = await axios.get(`${API_URL}/getPhoto/${userId}`);

        setPhotoPath(response.data.photoPath); // 更新状态

    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                try {
                    // 从 AsyncStorage 获取用户 ID 和全名
                    const storedUserId = await AsyncStorage.getItem('userId'); // 从 AsyncStorage 获取用户 ID
                    const storedFullName = await AsyncStorage.getItem('user'); // 从 AsyncStorage 获取用户全名
                    const storedUserRole = await AsyncStorage.getItem('userRole'); // 从 AsyncStorage 获取用户全名
       
                    // 如果存在用户 ID，调用获取照片的 API
                    if (storedUserId) {
                        fetchUserPhoto(storedUserId);
                        setUserId(storedUserId); // 更新用户 ID 状态
                    }
                    if (storedUserRole) {
            
                        setUserRole(JSON.parse(storedUserRole)); // 
                    }

                    // 如果存在用户全名，更新状态
                    if (storedFullName) {
                        setFullName(JSON.parse(storedFullName)); // 解析 JSON 字符串
                    }
                } catch (error) {
                    console.error('Error fetching user data', error);
                }
            };

            fetchUserData();
        }, [])
    );



    const handleSearch = async () => {
        try {

            const searchData = {
                flightNumber: flightNumber,
                ticketType: ticketType,
                date: date,
                departureLocation: departureLocation,
                arrivalLocation: arrivalLocation,
                cabinClass: cabinClass,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                ticketPrice: ticketPrice,
                priceRange: priceRange
            };

            const response = await fetch(`${API_URL}/searchFlight`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                
                body: JSON.stringify(searchData)
            });


            console.log("adsadsads"+priceRange);
            if (!date) {
                Alert.alert(
                    'Information',
                    'Please fill in all fields',
                    [
                        {
                            text: 'OK',
                            onPress: () => {

                            },
                        },
                    ],
                    { cancelable: false } // 不允许用户通过点击背景来关闭警报
                );
            }
            else if (response.ok) {
                Alert.alert('Search success');
                const flightData = await response.json();
                console.log('Flight Data:', flightData); // Log the flight data
                if (flightData.flights && flightData.flights.length > 0) {
                    // Access the cabinClass of the first flight (or any specific flight)
                    const cabinClass = flightData.flights[0].cabinClass; // Change the index as needed
            
                    // Check if cabinClass is defined before storing
                    if (cabinClass !== undefined) {
                        await AsyncStorage.setItem('cabinClass', JSON.stringify(cabinClass));
                 
                    } else {
                        console.warn('cabinClass is undefined, not storing in AsyncStorage');
                    }
                } else {
                    console.warn('No flights available in the response');
                }

                const searchResultsArray = Array.isArray(flightData.flights) ? flightData.flights : [];
                setSearchResults(searchResultsArray);
                setFlightCount(flightData.flightCount);
            } else if (response.status === 404) {
                const errorData = await response.json();
                Alert.alert('No flights available', errorData.error);
            } else {
                const errorData = await response.json();
                console.log('Internal server error:', errorData.error);
            }
        } catch (error) {
            console.error('Error searching for flight:', error);
        }
    };

    const handleContinue = async (flightId: any) => {
        try {
            const response = await fetch(`${API_URL}/findFlightId`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flightId }), // 发送 flightId
            });

            if (response.ok) {
                const flightDetails = await response.json();
                console.log('Flight Details:', flightDetails._id); // 打印航班 ID

                // 传递航班 ID 到 flightDetail 页面
                router.push({
                    pathname: "/seat",
                    params: { flightId: flightDetails._id }, // 传递航班 ID
                });

            } else {
                const errorData = await response.json();
                console.log('Error booking flight:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Search Flight Form
    interface SearchFlightData {
        originCity: string;
        destinationCity: string;
        departureDate: string;
        seat: number | string;
    }

    // Flight Offer Data
    interface FlightOfferData {
        originLocationCode: string;
        destinationLocationCode: string;
        departureDate: Date;
        returnDate: Date;
        adults: number;
        maxResults: number;
    }

    // Trip Option Components
    interface TripOptionProps {
        ticketType: string;
        handleNavigationChange: (type: string) => void;
    }
    const TripOption = ({
        ticketType,
        handleNavigationChange,
    }: TripOptionProps) => (
        <View className="flex-row justify-between w-full px-4 py-2">
            <Pressable

                className="flex-row w-1/2"
                onPress={() => handleNavigationChange("One Way")}
            >
                <View
                    className={`w-full justify-center items-center flex-row space-x-2 pb-2 ${ticketType === "One Way"
                        ? "border-b-4 border-[#12B3A8]"
                        : "border-t-transparent"
                        }`}
                >
                    <ChevronDoubleRightIcon
                        size={20}
                        strokeWidth={ticketType === "One Way" ? 3 : 2}
                        color={ticketType === "Round Way" ? "#12B3A8" : "gray"}
                    />
                    <Text
                        className={`text-xl pl-2 ${ticketType === "One Way" ? "text-[#12B3A8]" : "text-gray-500"
                            }`}
                        style={{
                            fontWeight: ticketType === "One Way" ? "700" : "500",
                        }}
                    >
                        One Trip
                    </Text>
                </View>
            </Pressable>



            <Pressable

                className="flex-row w-1/2"
                onPress={() => handleNavigationChange("Round Way")}
            >
                <View
                    className={`w-full justify-center items-center flex-row space-x-2 pb-2 ${ticketType === "Round Way"
                        ? "border-b-4 border-[#12B3A8]"
                        : "border-t-transparent"
                        }`}
                >
                    <ArrowPathRoundedSquareIcon
                        size={20}
                        strokeWidth={ticketType === "Round Way" ? 3 : 2}
                        color={ticketType === "One Way" ? "#12B3A8" : "gray"}
                    />
                    <Text
                        className={`text-xl pl-2 ${ticketType === "Round Way" ? "text-[#12B3A8]" : "text-gray-500"
                            }`}
                        style={{
                            fontWeight: ticketType === "Round Way" ? "700" : "500",
                        }}
                    >
                        Round Trip
                    </Text>
                </View>
            </Pressable>
        </View>
    );
    // Location Components
    interface LocationInputProps {
        placeholder: string;
        icon: React.ReactNode;
        value: string;
        onPress: () => void;
    }

    const LocationInput = ({
        placeholder,
        icon,
        value,
        onPress,
    }: LocationInputProps) => (
        <View className="border-2 border-gray-300 mx-4 mb-4 rounded-2xl justify-center">
            <Pressable onPress={onPress}>
                <View className="px-4 flex-row justify-between items-center">
                    <View className="w-[15%] border-r-2 border-gray-300">{icon}</View>

                    <View className="w-[80%] py-3">
                        {value ? (
                            <Text className="bg-transparent text-gray-600 font-bold">
                                {value}
                            </Text>
                        ) : (
                            <Text className="bg-transparent text-lg text-gray-600 font-semibold">
                                {placeholder}
                            </Text>
                        )}
                    </View>
                </View>
            </Pressable>
        </View>
    );

    // Departure Date Components
    interface DepartureDateInputProps {
        placeholder: string;
        icon: React.ReactNode;
        value: string;
        onPress: () => void;
    }

    const DepartureDate = ({
        placeholder,
        icon,
        value,
        onPress,
    }: DepartureDateInputProps) => (
        <Pressable
            onPress={onPress}
            className="border-2 border-gray-300 mx-4 mb-4 rounded-2xl justify-center py-4 flex-row items-center pl-4 "
        >
            <View className="w-[15%] border-r-2 border-gray-300">{icon}</View>
            <View className="w-[85%] px-4 items-start justify-start">
                <Text className="bg-transparent text-gray-600 font-bold">
                    {value || placeholder}
                </Text>
            </View>
        </Pressable>
    );


    const [isPending, setIsPending] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [session, setSession] = useState<any>(null);



    const [flightOffferData, setFlightOfferData] = useState<FlightOfferData>({
        originLocationCode: "",
        destinationLocationCode: "",
        departureDate: new Date(),
        returnDate: new Date(),
        adults: 1,
        maxResults: 10,
    });
    const [searchFlightData, setSearchFlightData] = useState<SearchFlightData>({
        originCity: "",
        destinationCity: "",
        departureDate: "",
        seat: 1,
    });
    const [selectedDate, setSelectedDate] = useState<any>(new Date());

    const handleNavigationChange = (type: string) => setticketType(type);


    const renderContent = () => {
        if (userRole === 'user') {
            return (
                <View className='w-full flex-row space-x-4 justify-end items-center h-14'>
                    {/* 用户角色的内容 */}
                </View>
            );
        } else if (userRole === 'admin') {
            return (
                <View className='w-full flex-row justify-between items-center h-14'>
                <TouchableOpacity
                    onPress={() => router.push("/flightCreat")}
                    className='bg-blue-600 w-fit rounded-full px-4 justify-center h-full flex-row items-center gap-4 transition-transform transform hover:scale-105'
                >
                    <View className='bg-blue-500 rounded-full w-8 h-8 justify-center items-center'>
                        <Text className='text-white font-semibold'>📖</Text>
                    </View>
                    
                </TouchableOpacity>
            
                <TouchableOpacity 
                    onPress={() => router.push("/flightCreat")}  
                    className='bg-blue-600 w-fit rounded-full px-4 justify-center h-full flex-row items-center gap-4 transition-transform transform hover:scale-105'
                >
                    <View className='bg-blue-500 rounded-full w-8 h-8 justify-center items-center'>
                        <Text className='text-white font-semibold'>✈️</Text>
                    </View>
                    
                    <View className='justify-start items-start gap-1'>
                        <Text className='text-black font-bold text-lg'>Create</Text>
                    </View>
                </TouchableOpacity>
            </View>
            
            );
        } else {
            return null; // 处理其他角色或情况
        }
    };
    

    

    return (
        <ScrollView>
            <View className="flex-1 items-center bg-[#F5F7FA] relative">
                <StatusBar style="light" />

                {isPending && (
                    <View className="absolute z-50 w-full h-full justify-center items-center">
                        <View className="bg-[#000000] bg-opacity-50 h-full w-full justify-center items-center opacity-[0.45] "></View>
                        <View>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    </View>
                )}

                {/* Header */}
                <View
                    className="h-64 mb-4 justify-start border-orange-600 w-full bg-[#192031] relative pt-16"
                    style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
                >
                    <View className='flex-row justify-between items-center px-2'>
                        <View className='w-1/2 flex-row h-14'>
                            <View className='pr-2'>
                                <View className='overflow-hidden '>


                                    {photoPath ? (
                                        <Image source={{ uri: photoPath }} className="w-16 h-16 border-2 border-white rounded-full" />
                                    ) : (
                                        <Image source={require('../../assets/images/favicon.png')} className="w-16 h-16 border-2 border-white rounded-full" />
                                    )}
                                </View>


                            </View>
                            <View>

                                <Text className='text-base text-neutral-400 font-medium'>Welcome Back</Text>
                                <Text className='text-xl text-white  font-bold'>{fullName}</Text>
                            </View>

                        </View>

                        <View className='flex-1 justify-center items-center'>
                            {renderContent()}
                        </View>

                    </View>
                </View>





                {/* Form Area */}
                <View className="w-full px-4 -mt-32 mx-4">
                    <View className="bg-white rounded-3xl pt-2 pb-4 shadow-md shadow-slate-300">
                        <View className="flex-row justify-between w-full px-4 py-2">
                            <TripOption
                                ticketType={ticketType}
                                handleNavigationChange={handleNavigationChange}
                            />
                        </View>

                        {/* Origin City */}

                        <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', }}>
                                    <MaterialIcons name="flight-takeoff" size={20} color="gray" style={{ marginRight: 10 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold', paddingVertical: 10 }}>Departure</Text>
                                        <Picker
                                            selectedValue={departureLocation}
                                            onValueChange={(itemValue) => setdepartureLocation(itemValue)}
                                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5 }}
                                        >
                                            {locations.map((location, index) => (
                                                <Picker.Item label={location.label} value={location.value} key={index} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        </View>




                        {/* Destination City */}
                        <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', }}>
                                    <MaterialIcons name="flight-land" size={20} color="gray" style={{ marginRight: 10 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold', paddingVertical: 10 }}>Destination</Text>
                                        <Picker
                                            selectedValue={arrivalLocation}
                                            onValueChange={(itemValue) => setArrivalTime(itemValue)}
                                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5 }}
                                        >
                                            {locations.map((location, index) => (
                                                <Picker.Item label={location.label} value={location.value} key={index} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Departure Date */}
                        <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30, position: 'relative' }}>
                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Text style={{ fontWeight: '500', paddingVertical: 10 }}>Depart</Text>
                                    <TouchableOpacity onPress={showDatePicker} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Fontisto name="date" size={20} color="gray" />
                                        <Text>{date || 'Select Date'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                            // minimumDate={new Date()} // 设置最小日期为今天
                            />
                        </View>
                        {/* Seat */}
                        <View style={{ paddingHorizontal: 10, marginTop: 20 }}>

                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30, position: 'relative' }}>


                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Text style={{ fontWeight: 500, paddingVertical: 10 }}>Class</Text>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <MaterialIcons name="flight-class" size={20} color="gray" />
                                        <Picker
                                            selectedValue={cabinClass}
                                            style={{ height: 50, width: '100%' }}
                                            onValueChange={(itemValue: string) => setcabinClass(itemValue)}
                                        >
                                            <Picker.Item label="Economy Class" value="Economy Class" />
                                            <Picker.Item label="Business Class" value="Business Class" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        </View>


                        <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30, position: 'relative' }}>
        
        <View style={{ width: '100%', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', paddingVertical: 10 }}>Price Range</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <MaterialIcons name="attach-money" size={20} color="gray" />
                <Picker
                    selectedValue={priceRange}
                    style={{ height: 50, width: '100%' }}
                    onValueChange={(itemValue) => setPriceRange(itemValue)}
                >
                    <Picker.Item label="100 - 500" value="100-500" />
                    <Picker.Item label="500 - 1000" value="500-1000" />
                    <Picker.Item label="1000 - 1500" value="1000-1500" />
                </Picker>
            </View>
        </View>
    </View>
</View>




                        {/* Search Button */}
                        <TouchableOpacity onPress={() => handleSearch()} style={{ paddingHorizontal: 10, marginTop: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'green', paddingVertical: 15, borderRadius: 10 }}>
                                <MaterialCommunityIcons name="airplane-search" size={25} color="white" />
                                <Text style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>Search</Text>
                            </View>
                        </TouchableOpacity>






                    </View>

                    {/* show content search */}
                    <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 500 }}>Search result : {flightCount}</Text>
                            <TouchableOpacity onPress={() => router.push("/flightDetail")}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, paddingRight: 10, fontWeight: 500 }}>Filter</Text>
                                    <MaterialIcons name="filter-list-alt" size={24} color="black" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* show content card */}

                        <View>
                            <View>
                                {searchResults.map((flight, index) => (
                                    <TouchableOpacity key={index} onPress={() => {
                                        // 打印将要传递的 ID
                                        handleContinue(flight._id);
                                    }} style={{ width: '100%', backgroundColor: 'white', marginTop: 20, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name="flight" size={24} color="green" />
                                            <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>{flight.flightNumber}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 }}>
                                            <View style={{ width: '30%' }}>
                                                <Text style={{ fontSize: 18, fontWeight: '500', paddingVertical: 2 }}>{flight.departureTime}</Text>
                                                <Text style={{ fontSize: 16, fontWeight: '500', paddingVertical: 2, color: 'gray' }}>{flight.departureLocation}</Text>
                                            </View>
                                            {/* Flight connection line logic can be added here */}
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                    <View style={{ width: 15, height: 15, borderRadius: 10, borderWidth: 1, borderColor: 'green', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ width: 5, height: 5, backgroundColor: 'green', borderRadius: 10, borderWidth: 1, borderColor: 'gray' }}></View>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, position: 'relative' }}>
                                                    <View style={{ width: '50%', height: 1, backgroundColor: 'gray' }}></View>
                                                    <MaterialIcons name="flight" size={24} color="green" />
                                                    <View style={{ width: '50%', height: 1, backgroundColor: 'gray' }}></View>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                    <View style={{ width: 15, height: 15, borderRadius: 10, borderWidth: 1, borderColor: 'green', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ width: 5, height: 5, backgroundColor: 'green', borderRadius: 10, borderWidth: 1, borderColor: 'gray' }}></View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ width: '30%' }}>
                                                <Text style={{ fontSize: 18, fontWeight: '500', paddingVertical: 2, textAlign: 'right' }}>{flight.arrivalTime}</Text>
                                                <Text style={{ fontSize: 16, fontWeight: '500', paddingVertical: 2, color: 'gray', textAlign: 'right' }}>{flight.arrivalLocation}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopColor: '#EAEAEA', borderTopWidth: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500' }}>${flight.ticketPrice}</Text>
                                                <Text>Ticket Price</Text>
                                            </View>


                                            <TouchableOpacity key={index} onPress={() => handleContinue(flight._id)}>
                                                <Text style={{ color: 'orange', fontWeight: '500', fontSize: 16 }}>Book Now</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                </View>

            </View>
        </ScrollView>
    );
}

export default FlightScreen




