import { View, Text, useWindowDimensions,TextInput, ScrollView, TouchableOpacity , Image} from 'react-native'
import React, { useEffect, useState } from 'react'
import Constants from "expo-constants";
import Svg, { Defs, Path , LinearGradient,Stop} from "react-native-svg";
import { AntDesign, FontAwesome, Fontisto, Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useRouter } from "expo-router";
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../backend/address';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
const FlightDetailScreen = () => {
    const { width, height } = useWindowDimensions();

    const route = useRoute();
    const { selectedSeats } = route.params as { selectedSeats: string[] }; 
    

    const [flightDetails, setFlightDetails] = useState<any>(null);
    const { flightId } = route.params as { flightId: string }; // 接收航班 ID
  
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const [fullName, setFullName] = useState("");
    const [dateBirth, setDateBirth] = useState("");
    const [mobile, setMobile] = useState("");
    const [passport, setPassport] = useState("");
    const [totalPrice, setTotalPrice] = useState("");
    const [nationality, setNationality] = useState("");
    const [date, setdate] = useState('');

    const hideDatePicker = () => {
      setDatePickerVisibility(false);
  };

    const showDatePicker = () => {
      setDatePickerVisibility(true);
  };

  const handleConfirm = (date: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
    setDateBirth(formatDate(date));
    hideDatePicker();
};

const formatDate = (date: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

    const selectedSeatsString = selectedSeats.toString(); // 将数组转换为字符串
const seatsArray = selectedSeatsString.split(",");
    const numberOfSeats = seatsArray.reduce((count, seat) => {
      const seatFormat = /^\d+[A-Z]$/;
      if (seatFormat.test(seat.trim())) {
          return count + 1;
      }
      return count;
  }, 0);
  

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            // 从 AsyncStorage 中获取用户全名
            const storedFullName = await AsyncStorage.getItem('user');
            // 如果存在，更新状态
            if (storedFullName) {
                setFullName(JSON.parse(storedFullName)); // 解析 JSON 字符串
            }
     
        } catch (error) {
            console.error('Error fetching user data', error);
        }
    };

    fetchUserData();
}, []);

    useEffect(() => {
      const fetchFlightDetails = async () => {
        try {
              const response = await fetch(`${API_URL}/findFlightId`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ flightId }), // 发送 flightId
              });

              if (response.ok) {
                  const data = await response.json();
                  setFlightDetails(data); // 设置航班详情
                  const totalPrice = numberOfSeats * data.ticketPrice;
                  setTotalPrice(totalPrice.toString());
                  console.log("Flight Details: " + JSON.stringify(data, null, 2)); // 使用 JSON.stringify 打印对象
              } else {
                  console.log('Error fetching flight details');
              }
          } catch (error) {
              console.error('Error:', error);
          } 
      };
      fetchFlightDetails(); // 调用获取航班详情的函数
  }, [flightId]); // 依赖于 flightId，确保在其变化时重新请求

    const handleSubmit = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const userData = {
          userId:userId,
          fullName: fullName,
          dateBirth: dateBirth,
          mobile: mobile,
          passport: passport,
          nationality: nationality,
          flightNumber: flightDetails.flightNumber,
          ticketType: flightDetails.ticketType,
          date: flightDetails.date,
          departureLocation: flightDetails.departureLocation,
          arrivalLocation: flightDetails.arrivalLocation,
          cabinClass: flightDetails.cabinClass,
          departureTime: flightDetails.departureTime,
          arrivalTime: flightDetails.arrivalTime,
          totalPrice: totalPrice,
          ticketPrice: flightDetails.ticketPrice,
          seat:selectedSeats
        };
        console.log('Flight Details:', flightDetails);
        const response = await axios.post(`${API_URL}createFlightbook`, userData);
        console.log('Flight Details:', flightDetails);
        console.log(response.data); // 处理返回的数据
        router.push("/bookconfirm");
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <View style={{flex:1,width:'100%', backgroundColor:'#EAEAEA'}}>


       {/* fix header top */}
       <View style={{position:'relative'}}>
          <View style={{position:'absolute',top:0, zIndex:1}}>
            <Svg width={`${width}`} height={200} fill="none">
              <Path
                d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
                fill="#EAEAEA"
                stroke={"transparent"}
                strokeWidth={0}
              />
            </Svg>
          </View>
          <View style={{position:'absolute',top:-10,left:-10, zIndex:2}}>
            <Svg width={`${width}`} height={200} fill="none">
                <Defs>
                  <LinearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <Stop offset="0%" stopColor="green" />
                    <Stop offset="100%" stopColor="#03D12E" />
                  </LinearGradient>
                </Defs>
              <Path
                d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
                fill="url(#grad1)"
                stroke={"transparent"}
                strokeWidth={0}
              />
            </Svg>
          </View>
        </View>

        
        {/* fix footer bottom */}
        <View style={{position:'absolute',bottom:0, zIndex:1,right:0,height:200,transform:[{rotate:'180deg'}]}}>
          <View style={{position:'absolute',top:0, zIndex:1}}>
            <Svg width={`${width}`} height={200} fill="none">
              <Path
                d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
                fill="#EAEAEA"
                stroke={"transparent"}
                strokeWidth={0}
              />
            </Svg>
          </View>
          <View style={{position:'absolute',top:-10,left:-10, zIndex:2}}>
            <Svg width={`${width}`} height={200} fill="none">
                <Defs>
                  <LinearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <Stop offset="0%" stopColor="green" />
                    <Stop offset="100%" stopColor="#03D12E" />
                  </LinearGradient>
                </Defs>
              <Path
                d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
                fill="url(#grad1)"
                stroke={"transparent"}
                strokeWidth={0}
              />
            </Svg>
          </View>
          
        </View>


        <ScrollView style={{width:'100%',height:'100%',position:'relative',zIndex:100, paddingBottom:50}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginTop: 30 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#696969', justifyContent: 'center', alignItems: 'center' }}>
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
          
            <View style={{paddingTop:Constants.statusBarHeight+10,paddingHorizontal:20}}>
                {/* Passenger Information (Thông tin hành khách): */}
                <View style={{backgroundColor:'#fff',padding:20, borderRadius:10,marginBottom:20}}>
                        <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="user" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Passenger Information</Text>
            </View>
            {/* <TextInput value={fullName}
              onChangeText={setFullName} placeholderTextColor={'gray'} placeholder='Full Name' style={{ height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} /> */}
             <TextInput value={dateBirth}
              onChangeText={setDateBirth} placeholderTextColor={'gray'} placeholder='DateBirth' style={{ height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} />
{/*   
            <View>
              <TouchableOpacity onPress={showDatePicker} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Fontisto name="date" size={20} color="gray" />
                <Text>{dateBirth || 'Select Date'}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View> */}

            <TextInput value={nationality} onChangeText={setNationality} placeholderTextColor={'gray'} placeholder='Nationality' style={{ height: 50, width: '100%', backgroundColor: '#FFF', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} />
            <TextInput value={passport} onChangeText={setPassport} placeholderTextColor={'gray'} placeholder='Passsport or ID Number' style={{ height: 50, width: '100%', backgroundColor: '#FFF', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} />
            <TextInput value={mobile} onChangeText={setMobile} placeholderTextColor={'gray'} placeholder='Contact Information' style={{ height: 50, width: '100%', backgroundColor: '#FFF', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} />
            </View>

                {/* Flight Details (Chi tiết chuyến bay):: */}
            
                        {/* <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="plane" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Flight Details</Text>
                        </View> */}
                        {/* <TextInput  onPress={() => router.push("/seat")} placeholderTextColor={'gray'} placeholder='Select Seat' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}/> */}
 {/* <TextInput placeholderTextColor={'gray'} placeholder='Date and Time Of Flight' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}/>
                        <TextInput placeholderTextColor={'gray'} placeholder='Departure and Arrival Locations' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}                       /> */}
               

                    {/* Payment Information (Thông tin thanh toán):: */}
                    {/* <View style={{backgroundColor:'#fff',padding:20, borderRadius:10,marginBottom:20}}>
                        <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="credit-card" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Payment Information</Text>
                        </View>
                       <View style={{marginTop:10}}>                 
                       </View>
                    </View> */}

                     {/* Baggage Information (Thông tin hành lý): */}
                {/* <View style={{backgroundColor:'#fff',padding:20, borderRadius:10,marginBottom:20}}>
                        <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="suitcase" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Baggage Information</Text>
                        </View>
                        <TextInput placeholderTextColor={'gray'} placeholder='Number of Checked and Carry-on Bags' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}/>
                        
                </View> */}

                <View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                 
                 <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:5}}>
                  
                    <MaterialIcons name="view-list" size={24} color="#f0a008" />
                    <Text style={{fontSize:12,fontWeight:500, color:'black'}}>Total price</Text>
                </View>
                 <Text style={{fontSize:18,fontWeight:500,color:'#fa5e3e'}}>${totalPrice}</Text>
            </View>
                     <TouchableOpacity onPress={() => handleSubmit()}>
                          <View style={{backgroundColor:'orange',padding:20, borderRadius:10,marginBottom:20, flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10}}>
                              <MaterialIcons name="next-plan" size={30} color="white" />
                              <Text style={{fontWeight:'bold',fontSize:20, color:'#fff', textAlign:'center'}}>Continue</Text>
                          </View>
                     </TouchableOpacity>
                </View>
            </View>
         </ScrollView>
    </View>
  )
}

export default FlightDetailScreen