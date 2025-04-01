import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { router, useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from "react-native";
import { API_URL } from '../backend/address';
import AsyncStorage from "@react-native-async-storage/async-storage";
const SeatSelection: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const router = useRouter(); 
  const route = useRoute(); 
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [seatStatus, setSeatStatus] = useState<{ [key: string]: string }>({});
  const { flightId } = route.params as { flightId: string };

  const [cabinClass, setcabinClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<string | null>(null);
 
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true); 
        try {
          const flightResponse = await fetch(`${API_URL}/findFlightId`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ flightId }),
          });

          
          const storeCabinclass = await AsyncStorage.getItem('cabinClass');
          if (storeCabinclass) {
            setcabinClass(JSON.parse(storeCabinclass)); 
          }

          if (flightResponse.ok) {
            const flightData = await flightResponse.json();
            setFlightDetails(flightData);

            const seatResponse = await fetch(`${API_URL}/getSelectedSeatsByFlight`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                flightNumber: flightData.flightNumber,
                date: flightData.date,
                departureLocation: flightData.departureLocation,
                arrivalLocation: flightData.arrivalLocation,
                departureTime: flightData.departureTime,
                arrivalTime: flightData.arrivalTime,
                ticketPrice: flightData.ticketPrice,
              }),
            });

            if (seatResponse.ok) {
              const seatData = await seatResponse.json();
              const seats: string[] = seatData.selectedSeats.flatMap((seat: string) =>
                seat.split(',').map((s: string) => s.trim())
              );

              
              const updatedSeatStatus: { [key: string]: string } = {};
              seats.forEach((seat: string) => {
                updatedSeatStatus[seat] = 'selected'; 
              });

              setSeatStatus(updatedSeatStatus); 
            } else {
              console.log('Error fetching seat status');
            }
          } else {
            console.log('Error fetching flight details');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {

          setTimeout(() => {
            setLoading(false); 
          }, 2000);
        }
      };

      fetchData();
    }, [flightId])
  );

  if (loading) {
    return (
      <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const onSeatSelect = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((selectedSeat) => selectedSeat !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };



  const renderSeats = (cabinClass: string | undefined) => {
    const rows = 2;
    const seatsPerRow = 5; 
    const renderedSeats = [];
    const seatLetters = ['A', 'B', 'C', 'D', 'E']; 


    const isBusinessClass = cabinClass === 'Economy Class'; 

    for (let i = 0; i < rows; i++) {
        const rowSeats = [];
        for (let j = 0; j < seatsPerRow; j++) {
            const seat = `${i + 1}${seatLetters[j]}`;
          
            if (seatLetters[j] === 'C') {
                rowSeats.push(
                    <View key={seat} style={{ width: 60, height: 60 }} /> 
                );
            } else {
                const seatColor = isBusinessClass
                    ? "#808080" 
                    : seatStatus[seat] === 'selected'
                        ? "#808080" 
                        : selectedSeats.includes(seat)
                            ? "#FF0000" 
                            : "#00FF00"; 

                rowSeats.push(
                    <Pressable
                        key={seat}
                        style={[
                            styles.seatButton,
                            { backgroundColor: seatColor },
                            seatStatus[seat] === 'selected' && { opacity: 1 }
                        ]}
                        onPress={() => {  
                            if (seatStatus[seat] === 'selected') {
                                alert(`Seat ${seat} has already been selected by someone else!`);
                            } else {
                                onSeatSelect(seat);
                            }
                        }}
                        disabled={seatStatus[seat] === 'selected' || isBusinessClass} 
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


const renderSeats1 = (cabinClass: string | undefined) => {
  const rows = 3; 
  const seatsPerRow = 5; 
  const renderedSeats = [];
  const seatLetters = ['A', 'B', 'C', 'D', 'E']; 


  const isBusinessClass = cabinClass === 'Business Class';


  for (let i = 2; i < rows + 2; i++) { 
      const rowSeats = [];
      for (let j = 0; j < seatsPerRow; j++) {
          const seat = `${i + 1}${seatLetters[j]}`;
          

  
          if (seatLetters[j] === 'C') {
              rowSeats.push(
                  <View key={seat} style={{ width: 60, height: 60 }} /> 
              );
          } else {
              const seatColor = isBusinessClass
                  ? "#808080" 
                  : seatStatus[seat] === 'selected'
                  ? "#808080" 
                      : selectedSeats.includes(seat)
                          ? "#FF0000" 
                          : "#00FF00";

              rowSeats.push(
                  <Pressable
                      key={seat}
                      style={[
                          styles.seatButton,
                          { backgroundColor: seatColor },
                          seatStatus[seat] === 'selected' && { opacity: 1 }
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
            <View key={`row-${i}`} style={{ flexDirection: "row", justifyContent: "center" }}>
                {rowSeats}
            </View>
        );
    }

    return renderedSeats;
};



  


  const handleContinue = () => {
    console.log(selectedSeats + "asdadasdsa")

    router.push({
      pathname: "/flightDetail",
      params: { selectedSeats, flightId }, 
    });
    
  };

  return (
    <ImageBackground
      source={require('../assets/images/plane.png')} 
      style={{ flex: 1,marginTop: -200  }}
      imageStyle={{ opacity: 1 }} 
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
        <Text style={styles.headerText}>Business Class</Text>
        <View style={styles.seatContainer}>{renderSeats(cabinClass)}</View>
        <Text style={styles.headerText}>Economy Class</Text>
        <View style={styles.seatContainer}>{renderSeats1(cabinClass)}</View>

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
    backgroundColor: "lightblue", 
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