    import { View, Text, useWindowDimensions, TextInput, ScrollView, TouchableOpacity, Image, StatusBar, Modal, ActivityIndicator, Pressable } from 'react-native'
    import React, { useEffect, useState } from 'react'
    import Constants from "expo-constants";
    import Svg, { Defs, Path, LinearGradient, Stop } from "react-native-svg";
    import { AntDesign, FontAwesome, Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
    import MaterialIcons from '@expo/vector-icons/MaterialIcons';
    import { router, useRouter } from "expo-router";
    import { useRoute } from '@react-navigation/native';
    import axios from 'axios';
    import { API_URL } from '../backend/address';
    import DateTimePickerModal from 'react-native-modal-datetime-picker';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { Picker } from '@react-native-picker/picker';
    import { ArrowPathRoundedSquareIcon, ChevronDoubleRightIcon } from 'react-native-heroicons/outline';
    const flightCreat = () => {
        const { width, height } = useWindowDimensions();
        const [ticketType, setticketType] = useState("One Way");
        const [departureLocation, setdepartureLocation] = useState('Beijing');
        const [arrivalLocation, setarrivalLocation] = useState('Shanghai');
        const [cabinClass, setcabinClass] = useState('Economy Class');
        const [priceRange, setPriceRange] = useState('');
        const [departureTime, setDepartureTime] = useState("");
        const [arrivalTime, setArrivalTime] = useState("");
        const [ticketPrice, setTicketPrice] = useState("");

        const [flightCount, setFlightCount] = useState(0);
        const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
        const [flightNumber, setFlightNumber] = useState("");
        const [flightData, setFlightData] = useState(null);
        const [fullName, setFullName] = useState(null);
        const [date, setdate] = useState('');
        const [photoPath, setPhotoPath] = useState<string | null>(null);
        const [userRole, setUserRole] = useState(null);
        // const router = useRouter(); // 使用 useRouter 获取 router 实例
        const [modalVisible, setModalVisible] = useState(false);
        const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
        const route = useRoute();

        const [isDescending, setIsDescending] = useState(false);

        const locations = [
            { label: 'Beijing', value: 'Beijing' },
            { label: 'Shanghai', value: 'Shanghai' },
            { label: 'Wuhan', value: 'Wuhan' },
            { label: 'Guangzhou', value: 'Guangzhou' }
        ];



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
            <View style={{ flex: 1, width: '100%', backgroundColor: '#EAEAEA' }}>

                <ScrollView>
                    <View className="flex-1 items-center bg-[#F5F7FA] relative">
                        {/* <StatusBar style="light" /> */}

                        {/* Header */}

                        <View

                            className="h-64 mb-4 justify-start border-orange-600 w-full bg-[#192031] relative pt-16"
                            style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}

                        >
                            <Pressable
                                onPress={() => router.push("/search")}
                                className="flex-row justify-center items-center h-14 w-[20%]"
                            >
                                <View className="rounded-full items-center justify-center bg-gray-500 h-10 w-10">
                                    <MaterialIcons
                                        name="keyboard-arrow-left"
                                        size={30}
                                        color={"#fff"}
                                    />
                                </View>
                            </Pressable>
                       
               
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ marginTop: -170 }} className="text-white font-extrabold text-lg">
                                    Create flight
                                </Text>
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
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', paddingVertical: 10 }}>Price Range</Text>
                                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                                <MaterialIcons name="attach-money" size={20} color="gray" />
                                                <TextInput
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#EAEAEA',
                                                        borderRadius: 5,
                                                        padding: 10,
                                                        flex: 1,
                                                        marginLeft: 10
                                                    }}
                                                    placeholder="Enter price"
                                                    keyboardType="numeric"
                                                    value={priceRange}
                                                    onChangeText={setPriceRange}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>



                                {/* Search Button */}
                                <TouchableOpacity style={{ paddingHorizontal: 10, marginTop: 20 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'green', paddingVertical: 15, borderRadius: 10 }}>
                                        <MaterialCommunityIcons name="airplane-search" size={25} color="white" />
                                        <Text style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>Create</Text>
                                    </View>
                                </TouchableOpacity>






                            </View>
                        </View>

                    </View>
                </ScrollView>
            </View>
        )
    }

    export default flightCreat