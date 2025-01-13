import { View, Text, Pressable, Alert, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";


const bookconfirm = () => {



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
                Book Confirm
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

        </View>
<ScrollView
showsHorizontalScrollIndicator={false}
contentContainerStyle = {{
  alignItems:"center",
  justifyContent:"center",
  paddingBottom:200,
}}
>

  <View className="w-full px-8 justify-center items-center py-8 h-full">
    <FontAwesome name="check-circle" size={80} color="#12B3A8"/>

    <Text className="text-lg text-center font-semibold">Congratulations, Your ticket purchase successfully completed</Text>
 
 {/* <View className="w-full justify-cetner items-center py-8 shadow-lg bg-[#12B3A8] rouded-lg px-4 my-4" >

 </View> */}

<View className="w-full justify-center items-center py-8 shadow-lg"></View>

<View className="w-full">
 <Pressable onPress={()=> router.replace("/search")}
  className="bg-[#12B3A8] rounded-lg justify-center items-center py-3 w-full">
<Text className="text-white font-bold text-lg py-2">Go home</Text>
 </Pressable>
 </View>
  </View>
  
</ScrollView>



      </View>
    </View>
  );
};

export default bookconfirm;
