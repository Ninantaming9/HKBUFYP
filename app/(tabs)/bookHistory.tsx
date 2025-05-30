import { View, Text, Pressable, TextInput, FlatList, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";

import axios from "axios";
import { apiToken } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderSearchResult from "@/components/HeaderSearchResult";
import {
  ArrowPathRoundedSquareIcon,
  ChevronDoubleRightIcon,
} from "react-native-heroicons/outline";
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { API_URL } from '../../backend/address';

export default function searchresult() {
  const [bookHistory, setBookHistory] = useState<Flightbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [flightCount, setFlightCount] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);
  
  interface Flightbook {
    _id: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    departureLocation: string;
    arrivalLocation: string;
    ticketPrice: string;
    date: string,
    cabinClass: string,
    seat: string,
    totalPrice: number,
    fullName: string,
    dateBirth: string,
    nationality: string,
    passport: string,
    mobile: string,
  }
 

  
  useEffect(() => {
    const fetchFlightBookings = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId'); // Retrieve userId from AsyncStorage
            const response = await axios.get(`${API_URL}/getAllFlightBookings`, {
                params: { userId } // Pass userId as a query parameter
            });
            setBookHistory(response.data.bookings);
            setFlightCount(response.data.bookings.length);
            setLoading(false);
            console.log('Retrieved flight bookings:', response.data.bookings.length);
        } catch (error) {
          
            setLoading(false);
        }
    };

    fetchFlightBookings();
}, [refreshKey]);



  const showDeleteConfirmation = () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Delete Confirmation',
        'Are you sure you want to delete this flight?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Delete',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  };
  
  const handleDeleteFlight = async (flightId: any) => {
    const isConfirmed = await showDeleteConfirmation();
    if (isConfirmed) {
      try {
        const response = await axios.post(`${API_URL}/deleteFlightById`, { flightId });

        if (response.status === 200) {
          alert('Flight deleted successfully');
          // Refresh the page after successful deletion
          setRefreshKey((prevKey) => prevKey + 1);
        } else {
          alert('Flight not found or deletion failed');
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
        alert('An error occurred while deleting the flight');
      }
    }
  };



  const handleContinue = async (flightId: any) => {
    try {
        const response = await fetch(`${API_URL}/findFlightBookId`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ flightId }), // 发送 flightId
        });
        
        if (response.ok) {
            const flightDetails = await response.json();
            console.log('Flight Details:', flightDetails._id); // 打印航班 ID


            router.push({
                pathname: "/ticketDetails",
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

  return (

    <View className="flex-1 items-center bg-[#F5F7FA] relative">
      <View className="w-full h-full">
        
        <View
          className="justify-start border-orange-600 w-full bg-[#192031] relative pt-16 pb-8"
          style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <View>
            {/* Header */}
            <View className="flex-row gap-4 justify-start items-center px-2">
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
              <View className="w-[60%] justify-center items-center flex-row">
                <Text className="text-white  font-extrabold text-lg">
                  Book History
                </Text>
              </View>

              <View>
                <View>
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    size={30}
                    color="white"
                  />
                </View>
              </View>
            </View>
          </View>
          <View>
            {/* <View className="flex-row justify-center items-center px-2 w-full">
                <View className="w-[70%] justify-between items-center flex-row pb-2">
                    <Text className="text-lg text-white font-extrabold capitalize">london</Text>

                    <Feather name="arrow-right" size={24} color="white"></Feather>
                    <Text className="text-lg text-white font-extrabold capitalize">fengchenp</Text>
                </View>
            </View> */}

            {/* 
            <View className="flex-row justify-center item-center px-2 w-full">
                <View className="w-[80%] justify-between items-center flex-row">
                    <Text className="text-sm text-neutral-400 font-extrabold">
                        2023
                    </Text>
                    <Octicons name="dot-fill" size={10} color="white"/>

                    <Text className="text-sm text-neutral-400 font-extrabold">
                        Economy
                    </Text>
                    <Octicons name="dot-fill" size={10} color="white"/>
                    <Text className="text-sm text-neutral-400 font-extrabold">
                        333seat
                    </Text>
                </View>

            </View> */}
          </View>
        </View>

        <ScrollView className="w-full">



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
              {bookHistory.map((flight, index) => (
                <TouchableOpacity key={index}   onPress={() => {
                  // 打印将要传递的 ID
                      handleContinue(flight._id);
                    }} style={{ width: '100%', backgroundColor: 'white', marginTop: 20, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="flight" size={24} color="green" />
                      <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>{flight.flightNumber}</Text>
                    </View>
                    <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>Date: {flight.date}</Text>
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

                      <Text>Total Price</Text><Text style={{ fontSize: 16, fontWeight: '500' }}>${flight.totalPrice}</Text>

                    </View>


                    <TouchableOpacity key={index} onPress={() => handleDeleteFlight(flight._id)} >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: '#f87f66', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 5 }}>
                        <AntDesign name="delete" size={16} color="#f87f66" />
                        <Text style={{ color: '#f87f66', fontWeight: 500, fontSize: 12 }}>Delete</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}



            </View>
          </View>

        </ScrollView>

      </View>
    </View>
  );
}

