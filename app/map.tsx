import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';

const MapScreen: React.FC = () => {
    // Hong Kong overview coordinates
    const [region, setRegion] = useState({
        latitude: 22.3193,
        longitude: 114.1694,
        latitudeDelta: 1.0, // Wider view for overview
        longitudeDelta: 1.0,
    });

    // Detailed location coordinates (replace with your actual target)
    const targetLocation = {
        latitude: 22.3392, // Your detailed location latitude
        longitude: 114.1826, // Your detailed location longitude
        latitudeDelta: 0.01, // More zoomed in
        longitudeDelta: 0.01,
    };

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        // After 1 second, animate to the detailed location
        const timer = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.animateToRegion(targetLocation, 3000); // 3000ms = 3 seconds animation
            }
        }, 1000); // Wait 1 second before starting animation

        return () => clearTimeout(timer);
    }, []);

    const handleMarkerPress = () => {
        Alert.alert("地址", "东道街11号");
    };

    const zoomIn = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...region,
                latitudeDelta: Math.max(region.latitudeDelta / 2, 0.001),
                longitudeDelta: Math.max(region.longitudeDelta / 2, 0.001),
            }, 100); // 500ms animation
        }
    };

    const zoomOut = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...region,
                latitudeDelta: Math.min(region.latitudeDelta * 2, 100),
                longitudeDelta: Math.min(region.longitudeDelta * 2, 100),
            }, 100); // 500ms animation
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <View style={styles.backButton}>
                        <Ionicons name='chevron-back' size={20} color={'black'} />
                    </View>
                </TouchableOpacity>
                <View style={styles.zoomControls}>
                    <TouchableOpacity onPress={zoomIn}>
                        <View style={styles.zoomButton}>
                            <AntDesign name="plus" size={20} color="black" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={zoomOut}>
                        <View style={styles.zoomButton}>
                            <AntDesign name="minus" size={20} color="black" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region} // Use initialRegion for the first render
                onRegionChangeComplete={setRegion}
            >
                <Marker
                    coordinate={targetLocation}
                    title="Hong Kong Baptist Airport"
                    //onPress={handleMarkerPress}
                />
            </MapView>
        </View>
    );
};

// ... (keep the same styles)
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        width: '100%',
        position: 'absolute',
        zIndex: 50,
        paddingTop: Constants.statusBarHeight + 10, // Added more padding
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: 'transparent', // Changed to transparent
    },
    backButton: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: 'white', // Changed to white for better visibility
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    zoomControls: {
        flexDirection: 'row',
        gap: 10,
    },
    zoomButton: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default MapScreen;