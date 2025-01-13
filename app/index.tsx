import { Pressable, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";

const adminSearch = () => {
  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: "#192031",
      }}
    >
      <StatusBar style="light" />
      <View className=" h-full">
        <View className="w-full px-4 items-center my-16">
          <Animated.View
            entering={FadeInDown.duration(200).springify()}
            className="flex-row justify-center items-center pb-24"
          >
            <MaterialCommunityIcons name="airplane" size={24} color="#12B3A8" />

            <Text className="text-[#FFFFFF] text-xl leading-[60px] pl-1">
              HKBU
            </Text>
            <Text className="text-[#4AE8DD] text-xl leading-[60px] pl-1 italic">
              FLY
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(200).delay(200).springify()}
          >
            <Text className="text-[#FFFFFF] text-[52px] font-medium leading-[60px]">
              Discover your  Flight Easily
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(200).delay(400).springify()}
            className="mt-4"
          >
            <Text className="text-neutral-300 text-lg leading-[30px]">
              find an easy way to buy airline tickets with just a few clicks in
              the applications.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(200).delay(600).springify()}
            className="h-1/4 w-full justify-start pt-8 px-4"
          >
            <Pressable
              onPress={() => router.push("/adminSearch")}
              className="bg-[#12B3A8] rounded-lg justify-center items-center py-4 "
            >
              <Text className="text-white font-bold text-lg">Discover</Text>
            </Pressable>
          </Animated.View>

          <View className="flex-row mt-4 w-full justify-center gap-2">
            <Text className="text-neutral-300 text-medium leading-[38px] text-center">
              Don't have an account?
            </Text>
            <Text className="text-neutral-300 text-semibold leading-[38px] text-center">
              Register
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default adminSearch;
