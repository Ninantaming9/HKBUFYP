import { View, Text, Pressable, TextInput, FlatList, ScrollView, TouchableOpacity, Alert, Modal } from "react-native";
import React, { useEffect, useState } from "react";

import axios from "axios";
import { apiToken } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderSearchResult from "@/components/HeaderSearchResult";
import {
  ArrowPathRoundedSquareIcon,
  ChevronDoubleRightIcon,
} from "react-native-heroicons/outline";
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { router, useFocusEffect, useRouter } from "expo-router";
import { API_URL } from '../backend/address';
import { Picker } from "@react-native-picker/picker";
import { PieChart } from 'react-native-chart-kit';
export default function orderStatus() {
  const [bookHistory, setBookHistory] = useState<Flightbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [flightCount, setFlightCount] = useState(0);
  const [email, setEmail] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [displayText, setDisplayText] = useState("Today"); // 用于显示的文本
  const [selectedOption, setSelectedOption] = useState('Today');
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalPrice: '0',
    orderCount: '0',
    timeCategories: {
      morning: '0',
      afternoon: '0',
      evening: '0',
    },
    morningPercentage: '0',
    afternoonPercentage: '0',
    eveningPercentage: '0',
  });



  interface OrderStats {
    totalPrice: string;
    orderCount: string;
    timeCategories: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    morningPercentage: string;
    afternoonPercentage: string;
    eveningPercentage: string;
  }


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
    isPaymoney: string,
  }



  const getDataForChart = () => {
    const morningPercentage = parseFloat(orderStats.morningPercentage) || 0;
    const afternoonPercentage = parseFloat(orderStats.afternoonPercentage) || 0;
    const eveningPercentage = parseFloat(orderStats.eveningPercentage) || 0;

    const data = [
      {
        name: '% Morning',
        population: morningPercentage,
        color: '#ff6384',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: '% Afternoon',
        population: afternoonPercentage,
        color: '#36a2eb',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: '% Evening',
        population: eveningPercentage,
        color: '#ffce56',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];

    return data;
  };



  const fetchOrderStats = async (timeframe: string) => {
    try {
      const response = await fetch(`${API_URL}/getCompletedOrdersStats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeframe }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: OrderStats = await response.json();
      setOrderStats(data);

      console.log(data.afternoonPercentage)
      console.log(data.eveningPercentage)
      console.log(data.orderCount)
      console.log(data.timeCategories)
      console.log(data.totalPrice)

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching order stats:', error);
        Alert.alert('Error', `Failed to fetch order statistics: ${error.message}`);
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'Failed to fetch order statistics: An unexpected error occurred.');
      }
    }
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

  const handleConfirm = () => {
    setDisplayText(selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)); // 更新显示文本
    setModalVisible(false);
    fetchOrderStats(selectedOption.toLowerCase()); // Fetch data based on selected option
  };

  useEffect(() => {
    // 组件加载时默认获取今天的数据
    fetchOrderStats('today');
  }, []);

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
          pathname: "/login",
          params: { flightBookId: flightDetails._id },
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
    router.push({
      pathname: "/flightDetail",
      //params: {  flightId }, 
    });

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
                  Order Status
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
                    <TouchableOpacity onPress={() => setModalVisible(true)} className="rounded-md p-2">
                      <Text className="text-white" style={{ fontWeight: 'bold' }}>{displayText}</Text>
                    </TouchableOpacity>

                    {/* Picker的模态框 */}
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={isModalVisible}
                      onRequestClose={() => setModalVisible(false)}
                    >
                      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View className="w-[80%] h-[30%] bg-white rounded-lg p-6 shadow-lg">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-lg">Select Timeframe</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                              <Text className="text-red-500">Close</Text>
                            </TouchableOpacity>
                          </View>
                          <View className="mt-4">
                            <Picker
                              selectedValue={selectedOption}
                              onValueChange={(itemValue) => setSelectedOption(itemValue)}
                            >
                              <Picker.Item label="Today" value="Today" />
                              <Picker.Item label="Month" value="Month" />
                              <Picker.Item label="Year" value="Year" />
                            </Picker>
                          </View>
                          <TouchableOpacity
                            onPress={handleConfirm} // 点击确认时调用 handleConfirm
                            className="mt-4 bg-red-500 text-white rounded-md p-2 flex justify-center items-center"
                          >
                            <Text className="text-white">Confirm</Text>
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

              <TouchableOpacity style={{ width: '100%', backgroundColor: 'white', marginTop: 20, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 20 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 }}>
                  <View style={{ width: '30%'  }}>
                    <Text style={{ fontSize: 18, fontWeight: '500', paddingVertical: 2 }}>{orderStats.orderCount}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '500', paddingVertical: 2, color: 'gray' , marginLeft: -15 }}>Orders</Text>
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
                    <Text style={{ fontSize: 18, fontWeight: '500', paddingVertical: 2, textAlign: 'right' }}>${orderStats.totalPrice}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '500', paddingVertical: 2, color: 'gray', textAlign: 'right' , marginRight: -20 }}>Earnings</Text>
                  </View>
                </View>

              </TouchableOpacity>

            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 }}>
              <View style={{ width: '30%' }}>
                <Text style={{ fontSize: 18, fontWeight: '500', paddingVertical: 2 }}>Task Charts</Text>
                <PieChart
                  data={getDataForChart()}
                  width={300} // 图表宽度
                  height={220} // 图表高度
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0, // 小数位数
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  accessor="population" // 数据中用于表示比例的字段
                  backgroundColor="transparent"
                  paddingLeft="15" // 左侧内边距
                  absolute // 绝对值
                />
              </View>


            </View>

          </View>

        </ScrollView>

      </View>
    </View>
  );
}

