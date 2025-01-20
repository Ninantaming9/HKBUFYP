import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { router, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { API_URL } from '../backend/address';
import AsyncStorage from "@react-native-async-storage/async-storage";
const SeatSelection: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const router = useRouter(); // 使用 useRouter 获取 router 实例
  const route = useRoute(); // 获取路由信息
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [seatStatus, setSeatStatus] = useState<{ [key: string]: string }>({});
  const { flightId } = route.params as { flightId: string };

  const [cabinClass, setcabinClass] = useState('');

 


  useEffect(() => {
    const fetchData = async () => {
  
      try {
        const flightResponse = await fetch(`${API_URL}/findFlightId`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ flightId }),
        });

         // 从 AsyncStorage 中获取用户全名
         const storeCabinclass = await AsyncStorage.getItem('cabinClass');
         // 如果存在，更新状态
         if (storeCabinclass) {
           setcabinClass(JSON.parse(storeCabinclass)); // 解析 JSON 字符串
         }

         console.log("asdsadasdas"+ cabinClass)

        if (flightResponse.ok) {
          const flightData = await flightResponse.json();
          setFlightDetails(flightData);

          const seatResponse = await fetch(`${API_URL}/getSelectedSeatsByFlight`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              flightNumber: flightData.flightNumber,
              date: flightData.date,
              departureLocation: flightData.departureLocation,
              arrivalLocation: flightData.arrivalLocation,
              departureTime: flightData.departureTime,
              arrivalTime: flightData.arrivalTime,
              ticketPrice: flightData.ticketPrice
            })
          });

          if (seatResponse.ok) {
            const seatData = await seatResponse.json();
            // 假设 seatData.selectedSeats 是一个数组，可能包含嵌套数组
            const seats: string[] = seatData.selectedSeats.flatMap((seat: string) =>
              seat.split(',').map((s: string) => s.trim())
            );
            console.log(seats); // 打印座位状态

            // 创建一个座位状态对象
            const updatedSeatStatus: { [key: string]: string } = {};
            seats.forEach((seat: string) => {
              updatedSeatStatus[seat] = 'selected'; // 标记为已被选中
            });

            setSeatStatus(updatedSeatStatus); // 更新座位状态
          } else {
            console.log('Error fetching seat status');
          }
        } else {
          console.log('Error fetching flight details');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [flightId]);


  const onSeatSelect = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((selectedSeat) => selectedSeat !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const isSeatSelected = (seat: string) => selectedSeats.includes(seat);

  const renderSeats = () => {
    const rows = 6;
    const seatsPerRow = 5; // 保持为5，方便处理空白
    const renderedSeats = [];
    const seatLetters = ['A', 'B', 'C', 'D', 'E']; // 包含C列
  
    for (let i = 0; i < rows; i++) {
      const rowSeats = [];
      for (let j = 0; j < seatsPerRow; j++) {
        const seat = `${i + 1}${seatLetters[j]}`;
        
        // 如果是C列，显示空白
        if (seatLetters[j] === 'C') {
          rowSeats.push(
            <View key={seat} style={{ width: 60, height: 60 }} /> // 空白占位
          );
        } else {
          const seatColor = seatStatus[seat] === 'selected'
            ? "#808080" // 灰色表示已被他人选中
            : selectedSeats.includes(seat)
              ? "#FF0000" // 红色表示已被选中
              : "#00FF00"; // 绿色表示可选
  
          rowSeats.push(
            <Pressable
              key={seat}
              style={[
                styles.seatButton,
                { backgroundColor: seatColor },
                seatStatus[seat] === 'selected' && { opacity: 0.5 }
              ]}
              onPress={() => {
                if (seatStatus[seat] === 'selected') {
                  alert(`Seat ${seat} has already been selected by someone else!`);
                } else {
                  onSeatSelect(seat);
                }
              }}
              disabled={seatStatus[seat] === 'selected'}
            >
              <Text>{seat}</Text>
            </Pressable>
          );
        }
      }
  
      renderedSeats.push(
        <View key={`row-${i}`} style={{ flexDirection: "row" }}>
          {rowSeats}
        </View>
      );
    }
  
    return renderedSeats;
  };


  const handleContinue = () => {
    console.log(selectedSeats + "asdadasdsa")
    // 将选定的座位数据传递到 flightDetail 页面
    router.push({
      pathname: "/flightDetail",
      params: { selectedSeats, flightId }, // 传递 selectedSeats
    });
  };

  return (
    <ImageBackground
      source={require('../assets/images/plane.png')} // 替换为你的图片路径
      style={{ flex: 1,marginTop: -200  }}
      imageStyle={{ opacity: 1 }} // 设置图片的透明度为50%
    >

    <View style={{ flex: 1,marginTop: 200}}>
      {/* Background View */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginTop: 35 }}>
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
      {/* Header */}
    

      {/* Main Content */}
      <View style={styles.container}>
        <Text style={styles.headerText}>Select Your Seats</Text>
        <View style={styles.seatContainer}>{renderSeats()}</View>
        <Text style={styles.selectedSeatsText}>
          Selected Seats: {selectedSeats.join(", ") || "None"}
        </Text>

        <View>
          <TouchableOpacity onPress={handleContinue}>
            <View style={{ backgroundColor: 'orange', padding: 20, borderRadius: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <MaterialIcons name="next-plan" size={30} color="white" />
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#fff', textAlign: 'center' }}>Continue</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  seatContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  seatButton: {
    margin: 5,
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "lightblue", // 座位的背景色
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "gray",
  },
  selectedSeatsText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default SeatSelection;