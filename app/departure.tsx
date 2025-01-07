import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { apiToken } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Departure() {
  const [searchInput, setSearchInput] = useState("");

  const [autoCompleteResults, setAutoCompleteResults] = useState<
    { id: string; name: string; iataCode: string }[]
  >([]);
  const [flightOfferData, setFlightOfferData] = useState<{
    originLocationCode: string;
  }>({ originLocationCode: "" });
  const [previousSelectedDeparture, setPreviousSelectedDeparture] = useState<
    { city: string; iataCode: string }[]
  >([]);

  const loadPreviousSelectedCities = async () => {
    try {
      const cities = await AsyncStorage.getItem("departureCities");
      if (cities !== null) {
        setPreviousSelectedDeparture(JSON.parse(cities));
      }
    } catch (error) {
      console.log("Error loading previous selected cities", error);
    }
  };

  useEffect(() => {
    loadPreviousSelectedCities();
  }, []);

  const debounce = (fn: any, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: any) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const autoCompleteSearch = async (searchInput: string) => {
    try {
      const headers = {
        Authorization: `Bearer ${apiToken}`,
      };

      const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${searchInput}`;

      const response = await axios.get(url, { headers });
      setAutoCompleteResults(response.data.data);
    } catch (error: any | Error) {
      if (error.response && error.response.status === 429) {
        console.log("Rate limit exceeded. Please wait and try again later.");
      }
    }
  };

  const debounceSearch = debounce(autoCompleteSearch, 5000);

  const handleInputChange = (text: string) => {
    setSearchInput(text);
    debounceSearch(text);
  };

  const handleSelectAutoComplete = async (item: any) => {
    const previousSelectedCities = [...previousSelectedDeparture];

    previousSelectedCities.push({ city: item.name, iataCode: item.iataCode });

    await AsyncStorage.setItem(
      "departureCities",
      JSON.stringify(previousSelectedCities)
    );

    setPreviousSelectedDeparture(previousSelectedCities);

    setFlightOfferData({
      ...flightOfferData,
      originLocationCode: item.iataCode,
    });

    setSearchInput(`${item.name}, ${item.iataCode}`);
    setAutoCompleteResults([]);
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
                  Select Departure
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

        {/* Airport or City Search  */}
        <View className="w-full py-4 px-4 relative">
          <View className="flex-row justify-between items-center bg-white border-2 border-gray-400 rounded-xl h-14 overflow-hidden">
            <View className="w-full h-full justify-center">
              <TextInput
                placeholder="Search for an airport or city"
                placeholderTextColor={"gray"}
                value={searchInput}
                onChangeText={handleInputChange}
                className="bg-transparent text-gray-600 h-full px-2 capitalize"
              />
            </View>
          </View>

          {/* AutoComplete Results */}
          {autoCompleteResults?.length > 0 && (
            <View className="border-2 border-gray-400 bg-white rounded-xl shadow-md mt-4">
              <FlatList
                data={autoCompleteResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectAutoComplete(item)}
                    className="px-2 py-2 rounded-xl my-1"
                  >
                    <Text className="text-gray-500 capitalize">
                      {item.name} ({item.iataCode})
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Previous Selected Cities */}
          <View className="px-4 w-full">
            <Text className="text-gray-500 font-bold mt-4 text-lg">
              Previous Selected
            </Text>

            {previousSelectedDeparture.map((city, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setFlightOfferData({
                    ...flightOfferData,
                    originLocationCode: city.iataCode,
                  });
                  setSearchInput(`${city.city}, ${city.iataCode}`);
                }}
                className="bg-white border-2 border-gray-400 rounded-xl px-2 py-3 my-2"
              >
                <Text className="text-gray-500 capitalize">
                  {city.city} ({city.iataCode})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
