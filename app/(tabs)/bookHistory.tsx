import { View, Text, Pressable, TextInput, FlatList, ScrollView, TouchableOpacity, Alert, Modal } from "react-native";
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
  const [email, setEmail] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    const fetchUserDataAndFlightBookings = async () => {
      try {

        const storedFullName = await AsyncStorage.getItem('user');
        const storedUserRole = await AsyncStorage.getItem('userRole');

        if (storedFullName) {
          setFullName(JSON.parse(storedFullName));
        }

        if (storedUserRole) {
          setUserRole(JSON.parse(storedUserRole));
        }

        const userId = await AsyncStorage.getItem('userId');
        const response = await axios.get(`${API_URL}/getAllFlightBookings`, {
          params: { userId }
        });
        setBookHistory(response.data.bookings);
        setFlightCount(response.data.bookings.length);
        setLoading(false);
        console.log('Retrieved flight bookings:', response.data.bookings.length);
      } catch (error) {

        setLoading(false);
      }
    };

    fetchUserDataAndFlightBookings();
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
  const handleSearch = async () => {
    // 检查是否有搜索内容
    if (!email.trim()) {
      alert('please input message'); // 弹出提示框
      return; // 结束函数执行
    }

    try {
      const response = await fetch(`${API_URL}/searchBookbyadmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      // 检查响应是否成功
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An error occurred while searching.';
        throw new Error(errorMessage); // 抛出错误
      }

      const data = await response.json();

      // 检查是否有匹配的内容
      if (!Array.isArray(data)) {
        alert('error'); // 弹出提示框
        return;
      }

      // 这里检查数据长度
      if (data.length === 0) {
        alert('not match message'); // 弹出提示框
      } else {
        // 直接检查是否有匹配的 email
        const hasMatchingEmail = data.some(item => item.email === email.trim());
        if (!hasMatchingEmail) {
          alert('not match message'); // 弹出提示框
        } else {
          setBookHistory(data);
        }
      }

      setModalVisible(false);
      setEmail('');
    } catch (err) {

      const errorMessage = (err as Error).message || 'some thing';

      if (errorMessage) {
        Alert.alert(
          'error',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setEmail('');
              },
            },
          ],
          { cancelable: false }
        );
      }





    }
  };



  const handleDeleteFlight = async (flightId: any, flightNumber: any, fullName: any) => {
    const isConfirmed = await showDeleteConfirmation();
    if (isConfirmed) {
      try {
        const response = await axios.post(`${API_URL}/deleteFlightById`, { flightId, flightNumber, fullName });

        if (response.status === 200) {
          alert('Flight deleted successfully');

          // Update the local state to remove the deleted flight
          setBookHistory((prevBookHistory) =>
            prevBookHistory.filter(flight => flight._id !== flightId)
          );

          // Optionally, refresh the key to re-fetch data
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
        body: JSON.stringify({ flightId }),
      });

      if (response.ok) {
        const flightDetails = await response.json();
        console.log('Flight Details:', flightDetails._id);


        router.push({
          pathname: "/ticketDetails",
          params: { flightId: flightDetails._id },
        });

      } else {
        const errorData = await response.json();
        console.log('Error booking flight:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewQRCode = (flightId: string) => {
    router.push("/login");
    console.log(`Viewing QR Code for flight ID: ${flightId}`);
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
                {userRole === 'user' ? (
                  <View>
                    <View>
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={30}
                        color="white"
                      />
                    </View>
                  </View>
                ) : (
                  <View className="flex-1 justify-center items-center">
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                      <MaterialCommunityIcons
                        name="magnify"
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>

                    {/* 搜索框的模态框 */}
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={isModalVisible}
                      onRequestClose={() => setModalVisible(false)}
                    >
                      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View className="w-[80%] h-[15%] bg-white rounded-lg p-6 shadow-lg">
                          <View className="flex-row gap-4 justify-start items-center px-2">
                            <TextInput
                              className="border border-gray-300 rounded-md p-3 flex-1"
                              placeholder="Search by email or Fullname"
                              value={email}
                              onChangeText={setEmail}
                            />
                            <TouchableOpacity
                              onPress={handleSearch}
                              className="bg-blue-500 text-white rounded-md p-2 flex justify-center items-center"
                            >
                              <Text className="text-white">Search</Text>
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="mt-4 bg-red-500 text-white rounded-md p-2 flex justify-center items-center"
                          >
                            <Text className="text-white">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>
                )}
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
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 500 }}>Search result </Text>
                            <TouchableOpacity onPress={() => router.push("/flightDetail")}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, paddingRight: 10, fontWeight: 500 }}>Filter</Text>
                                    <MaterialIcons name="filter-list-alt" size={24} color="black" />
                                </View>
                            </TouchableOpacity>
                        </View> */}

            {/* show content card */}

            <View>
              {bookHistory.map((flight, index) => (
                <TouchableOpacity key={index} onPress={() => {

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                      <Text>Total Price</Text>
                      <Text style={{ fontSize: 16, fontWeight: '500', marginLeft: 5 }}>${flight.totalPrice}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                      <TouchableOpacity onPress={() => handleViewQRCode(flight._id)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#66b3f8', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 5, marginRight: 10 }}>
                          <AntDesign name="qrcode" size={16} color="#66b3f8" />
                          <Text style={{ color: '#66b3f8', fontWeight: '500', fontSize: 12, marginLeft: 3 }}>View QR Code</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity key={index} onPress={() => handleDeleteFlight(flight._id, flight.flightNumber, fullName)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f87f66', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 5 }}>
                          <AntDesign name="delete" size={16} color="#f87f66" />
                          <Text style={{ color: '#f87f66', fontWeight: '500', fontSize: 12, marginLeft: 3 }}>Delete</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
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

