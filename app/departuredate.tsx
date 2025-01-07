import { View, Text, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const departuredate = () => {
  const [flightOfferData, setFlightOfferData] = useState<any>({
    departureDate: new Date(),
  });

  const saveDepartureDate = async () => {
    try {
      const departureDate = new Date(flightOfferData.departureDate);

      const dateString = departureDate.toISOString().split("T")[0];

      await AsyncStorage.setItem("departureDate", dateString);
      Alert.alert("Departure Date Saved Successfully");

      router.back();
    } catch (error) {
      console.log("Error saving departure date", error);
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
                onPress={() => router.back()}
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
                  Departure Date
                </Text>
              </View>

              <View>
                <Pressable
                  className="h-10 w-10 justify-center items-center"
                  onPress={() => saveDepartureDate()}
                >
                  <Text className="text-white text-lg font-bold">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Calendar View */}
        <Calendar
          onDayPress={(day: any) => {
            setFlightOfferData({
              ...flightOfferData,
              departureDate: new Date(day.dateString),
            });
          }}
          markedDates={{
            [flightOfferData.departureDate.toISOString().split("T")[0]]: {
              selected: true,
              selectedColor: "#12B3A8",
              selectedTextColor: "white",
              disableTouchEvent: true,
            },
          }}
        />
      </View>
    </View>
  );
};

export default departuredate;
