import { View, Text, useWindowDimensions,TextInput, ScrollView, TouchableOpacity , Image} from 'react-native'
import React, { useEffect, useState } from 'react'
// 📗 khai báo thư viện mà expo hổ trỡ để lấy giá trị chiều cao  statusBar
import Constants from "expo-constants";
import Svg, { Defs, Path , LinearGradient,Stop} from "react-native-svg";
import { FontAwesome } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useRouter } from "expo-router";
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StyleSheet } from 'react-native';
import { API_URL } from '../backend/address';
const FlightDetailScreen = () => {
  const route = useRoute();
    const { width, height } = useWindowDimensions();
    const [flightBookDetails, setFlightBookDetails] = useState<any>(null);
    const { flightId } = route.params as { flightId: string }; // 接收航班 ID
    const [bookHistory, setBookHistory] = useState<Flightbook | null>(null); // 初始为 null
 
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
      const fetchFlightDetails = async () => {
        try {
       
              const response = await fetch(`${API_URL}/findFlightBookId`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ flightId }), // 发送 flightId
              });

              if (response.ok) {
                  const data = await response.json();
                  setBookHistory(data); // 设置航班详情
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
            <View style={{paddingTop:Constants.statusBarHeight+10,paddingHorizontal:20}}>
                {/* Passenger Information (Thông tin hành khách): */}
                <View style={{backgroundColor:'#fff',padding:20, borderRadius:10,marginBottom:20}}>
                        <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="user" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Passenger Information</Text>
                        </View>
                        <View style={styles.container}>
      <TextInput 
         value={`FullName: ${bookHistory?.fullName || ''}`} // 在前面添加 "Name: "
        placeholderTextColor={'gray'}
        placeholder='Full Name'
        style={styles.input}
        editable={false}
      />
      <TextInput
           value={`DateBirth: ${bookHistory?.dateBirth || ''}`} // 在前面添加 "Name: "
        placeholderTextColor={'gray'}
        placeholder='Date of Birth'
        style={styles.input}
        editable={false}
      />
      <TextInput
         value={`Nationality: ${bookHistory?.nationality || ''}`} // 在前面添加 "Name: "
        placeholderTextColor={'gray'}
        placeholder='Nationality'
        style={styles.input}
        editable={false}
      />
      <TextInput
        value={`Passport: ${bookHistory?.passport || ''}`} // 在前面添加 "Name: "
        placeholderTextColor={'gray'}
        placeholder='Passport or ID Number'
        style={styles.input}
        editable={false}
      />
      <TextInput
          value={`Mobile: ${bookHistory?.mobile || ''}`} // 在前面添加 "Name: "
        placeholderTextColor={'gray'}
        placeholder='Contact Information'
        style={styles.input}
        editable={false}
      />
    </View>
                </View>

                {/* Flight Details (Chi tiết chuyến bay):: */}
                <View style={{backgroundColor:'#fff',padding:20, borderRadius:10,marginBottom:20}}>
                        <View style={{flexDirection:'row',alignItems:'center',paddingBottom:10}}>
                            <FontAwesome name="plane" size={24} color={'black'}/>
                            <Text style={{fontWeight:'bold',paddingLeft:10,fontSize:16}}>Flight Details</Text>
                        </View>
                        <TextInput    value={`FlightNumber: ${bookHistory?.flightNumber || ''}`}placeholderTextColor={'gray'} placeholder='Flight Number' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}  editable={false}/>
                        <TextInput    value={`Date: ${bookHistory?.date || ''}`} placeholderTextColor={'gray'} placeholder='Date and Time Of Flight' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}  editable={false}/>
                        <TextInput    value={`departureLocation: ${bookHistory?.departureLocation || ''}`} placeholderTextColor={'gray'} placeholder='Departure and Arrival Locations' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}  editable={false}/>
                        <TextInput    value={`ArrivalLocation: ${bookHistory?.arrivalLocation || ''}`} placeholderTextColor={'gray'} placeholder='Departure and Arrival Locations' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}  editable={false}/>
                        <TextInput    value={`Seat Number: ${bookHistory?.seat || ''}`} placeholderTextColor={'gray'} placeholder='Departure and Arrival Locations' style={{height:50, width:'100%', backgroundColor:'#FFF', borderRadius:10, marginTop:10, paddingHorizontal:10,borderWidth:1, borderColor:'#EAEAEA'}}  editable={false}/>
                </View>

                 
          

                <View>
                     <TouchableOpacity onPress={() => router.back()}>
                          <View style={{backgroundColor:'orange',padding:20, borderRadius:10,marginBottom:20, flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10}}>
                              <MaterialIcons name="next-plan" size={30} color="white" />
                              <Text style={{fontWeight:'bold',fontSize:20, color:'#fff', textAlign:'center'}}>Home</Text>
                          </View>
                     </TouchableOpacity>
                </View>


            </View>
         </ScrollView>


     
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
});


export default FlightDetailScreen