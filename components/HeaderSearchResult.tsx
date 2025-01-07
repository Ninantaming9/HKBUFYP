import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { apiToken } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HeaderSearchResult = () => {


    return (
        <View>
            <View className="flex-row justify-center items-center px-2 w-full">
                <View className="w-[70%] justify-between items-center flex-row pb-2">
                    <Text className="text-lg text-white font-extrabold capitalize">london</Text>

                    <Feather name="arrow-right" size={24} color="white"></Feather>
                    <Text className="text-lg text-white font-extrabold capitalize">fengchenp</Text>
                </View>
            </View>


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
                        0 seat
                    </Text>
                </View>

            </View>
        </View>
    );
}


export default HeaderSearchResult;