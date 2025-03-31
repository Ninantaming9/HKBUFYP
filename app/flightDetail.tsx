import { View, Text, useWindowDimensions, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Constants from "expo-constants";
import Svg, { Defs, Path, LinearGradient, Stop } from "react-native-svg";
import { AntDesign, FontAwesome, Fontisto, Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useRouter } from "expo-router";
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../backend/address';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Result } from '@stripe/stripe-react-native/lib/typescript/src/types/PaymentMethod';
import { IntentCreationCallbackParams } from '@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet';


const App = () => {
  return (
    <StripeProvider publishableKey="pk_test_51R02UUR3E9eq8yl01jM5teLmWAuzcpgOPGejTtWoc55HasvWOOGSCbLZ34btPh6VOEIYksP5yoCzeDQYuWgx5rlm00GbVcrOjt">
      <FlightDetailScreen />
    </StripeProvider>
  );
};

const FlightDetailScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { width, height } = useWindowDimensions();
  const [errorMessage, setErrorMessage] = useState('');
  const route = useRoute();
  const { selectedSeats } = route.params as { selectedSeats: string[] };
  const [email, setEmail] = useState('');

  const [flightDetails, setFlightDetails] = useState<any>(null);
  const { flightId } = route.params as { flightId: string };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateBirth, setDateBirth] = useState("");
  const [mobile, setMobile] = useState("");
  const [passport, setPassport] = useState("");

  const [nationality, setNationality] = useState("");
  const [date, setdate] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  

  const [totalPrice, setTotalPrice] = useState("");

  const publishableKey = 'pk_test_51R02UUR3E9eq8yl01jM5teLmWAuzcpgOPGejTtWoc55HasvWOOGSCbLZ34btPh6VOEIYksP5yoCzeDQYuWgx5rlm00GbVcrOjt';

  const fetchPaymentSheetParams = async () => {
    console.log("asdsada")
    const response = await fetch(`${API_URL}/paymentsheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: totalPrice }),
    });
    console.log("sadasddddd")
    if (!response.ok) {
      console.error('Failed to fetch payment sheet params:', response.statusText);
      throw new Error('Failed to fetch payment sheet params');
    }
  
    const { paymentIntent, ephemeralKey, customer } = await response.json();
  
    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };
  const initializePaymentSheet = async (retries = 3) => {
    try {
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams();
  
      console.log('Payment Sheet Params:', { paymentIntent, ephemeralKey, customer });
  
      const { error } = await initPaymentSheet({
        merchantDisplayName: "shuaiqibiren",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'shuaiqibiren',
        }
      });
  
      if (error) {
        console.error('Error initializing payment sheet:', error);
      } else {
        console.log('Payment sheet initialized successfully.');
        setLoading(true);
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
      if (retries > 0) {
        console.log(`Retrying... (${3 - retries + 1})`);
        await new Promise(res => setTimeout(res, 2000)); // Wait for 2 seconds before retrying
        return initializePaymentSheet(retries - 1);
      }
    }
  };
  
  
  
  const openPaymentSheet = async () => {
    try {
      console.log('Attempting to present payment sheet...');
      const { error } = await presentPaymentSheet();
      
      if (error) {
      
      } else {
        console.log('Payment sheet presented successfully.');
        await handleSubmit();
      }
    } catch (error) {
      console.error('Error in openPaymentSheet:', error);
    }
  };
  

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

  const selectedSeatsString = selectedSeats.toString();
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

        const storedFullName = await AsyncStorage.getItem('user');
        const storedUserEmail = await AsyncStorage.getItem('userEmail');

        if (storedFullName) {
          setFullName(JSON.parse(storedFullName));
        }

        if (storedUserEmail) {
          setEmail(JSON.parse(storedUserEmail));
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
          body: JSON.stringify({ flightId }),
        });

        if (response.ok) {
          const data = await response.json();
          setFlightDetails(data);
          const totalPrice = numberOfSeats * data.ticketPrice;
          setTotalPrice(totalPrice.toString());
          console.log("Flight Details: " + JSON.stringify(data, null, 2));
        } else {
          console.log('Error fetching flight details');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchFlightDetails();
  }, [flightId]);

  const handleSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = {
        userId: userId,
        email: email,
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
        seat: selectedSeats,
        discountValue: discount,
        isUsed: true,
        isPaymoney:true
      };

      console.log('Flight Details:', flightDetails);
      const response = await axios.post(`${API_URL}/createFlightbook`, userData);
      console.log('Flight Details:', flightDetails);
      console.log(response.data);
      router.push("/bookconfirm");
    } catch (error) {
      console.error(error);
    }
  };


  const handleCheckDiscountCode = async () => {
    try {

      const numericTotalPrice = parseFloat(totalPrice);

      const response = await fetch(`${API_URL}/applyDiscountCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountValue: discount,
          originalPrice: numericTotalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {

        setTotalPrice(data.discountedPrice.toString());
        setErrorMessage('');
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error('Error checking discount code', error);
      setErrorMessage('Internal server error');
    }
  };

  
  const handlePayment = async () => {
    try {
      await initializePaymentSheet();
      await openPaymentSheet();
    } catch (error) {

    }
  };




  // const fetchPaymentSheetParams = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/paymentshow`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         amount: 1000, // 例如，10.00 美元
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  
  //     const { paymentIntent, ephemeralKey, customer } = await response.json();
  //     console.log('Payment sheet params:', { paymentIntent, ephemeralKey, customer }); // 调试输出
  
  //     return {
  //       paymentIntent,
  //       ephemeralKey,
  //       customer,
  //     };
  //   } catch (error) {
  //     console.error('Error fetching payment sheet params:', error);
  //     throw error; // 重新抛出错误以便后续处理
  //   }
  // };
  
  
  
  
  const handleUnfinishedBook = async () => {
    try {
      Alert.alert(
        "Hints",
        "The order is not completed. Do you want to jump to a new page?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Confirm",
            onPress: async () => {
              await handleNopaymoney(); // 调用 handleSubmit 函数
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
    }
  };



  const handleNopaymoney = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = {
        userId: userId,
        email: email,
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
        seat: selectedSeats,
        discountValue: discount,
        isUsed: true,
        isPaymoney: false
      };
  
      console.log('Flight Details:', flightDetails);
      const response = await axios.post(`${API_URL}/createFlightbook`, userData);
      console.log('Flight Details:', flightDetails);
      console.log(response.data);
      
      // 插入成功后跳转页面
      router.push("/(tabs)/search");
    } catch (error) {
      console.error(error);
    }
  };



  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: '#EAEAEA' }}>


      {/* fix header top */}
      <View style={{ position: 'relative' }}>
        <View style={{ position: 'absolute', top: 0, zIndex: 1 }}>
          <Svg width={`${width}`} height={200} fill="none">
            <Path
              d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
              fill="#EAEAEA"
              stroke={"transparent"}
              strokeWidth={0}
            />
          </Svg>
        </View>
        <View style={{ position: 'absolute', top: -10, left: -10, zIndex: 2 }}>
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
      <View style={{ position: 'absolute', bottom: 0, zIndex: 1, right: 0, height: 200, transform: [{ rotate: '180deg' }] }}>
        <View style={{ position: 'absolute', top: 0, zIndex: 1 }}>
          <Svg width={`${width}`} height={200} fill="none">
            <Path
              d="M 0 0 L 0 200 C 50 200 0 150 60  120 S 70 70 80 50 S 100 50 120 0"
              fill="#EAEAEA"
              stroke={"transparent"}
              strokeWidth={0}
            />
          </Svg>
        </View>
        <View style={{ position: 'absolute', top: -10, left: -10, zIndex: 2 }}>
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


      <ScrollView style={{ width: '100%', height: '100%', position: 'relative', zIndex: 100, paddingBottom: 50 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginTop: 30 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#696969', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name='chevron-back' size={20} color={'black'} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={handleUnfinishedBook} >
              <View style={{ width: 35, height: 35, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="home" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingTop: Constants.statusBarHeight + 10, paddingHorizontal: 20 }}>
          {/* Passenger Information (Thông tin hành khách): */}
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
              <FontAwesome name="user" size={24} color={'black'} />
              <Text style={{ fontWeight: 'bold', paddingLeft: 10, fontSize: 16 }}>Have Any Discount？</Text>
            </View>
            {/* <TextInput value={fullName}
              onChangeText={setFullName} placeholderTextColor={'gray'} placeholder='Full Name' style={{ height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginTop: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EAEAEA' }} /> */}

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

            <View style={styles.container}>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                placeholderTextColor={'gray'}
                placeholder='Enter discount code'
                style={styles.input}
              />
              <TouchableOpacity onPress={handleCheckDiscountCode} style={styles.button}>
                <Text style={styles.buttonText}>Check Discount Code</Text>
              </TouchableOpacity>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : (

                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 15 }}>
                  <MaterialIcons name="view-list" size={30} color="#f0a008" />
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'black' }}>  Total Price: ${parseFloat(totalPrice).toFixed(2)}</Text>
                </View>

              )}
            </View>

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
            {/*  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                 
                 <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:5}}>
                  
                    <MaterialIcons name="view-list" size={24} color="#f0a008" />
                    <Text style={{fontSize:12,fontWeight:500, color:'black'}}>Total price</Text>
                </View>
                 <Text style={{fontSize:18,fontWeight:500,color:'#fa5e3e'}}>${totalPrice}</Text>
            </View>*/}
            <StripeProvider publishableKey={publishableKey}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={handlePayment}>
                  <View style={{ backgroundColor: 'orange', padding: 20, borderRadius: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <MaterialIcons name="next-plan" size={30} color="white" />
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#fff', textAlign: 'center' }}>Finished</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </StripeProvider>
          
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  button: {
    backgroundColor: '#fa5e3e',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fa5e3e',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default FlightDetailScreen