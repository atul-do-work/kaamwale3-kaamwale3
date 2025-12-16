import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

// Distance calculation using Haversine formula
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface JobLocationMapProps {
  visible: boolean;
  onClose: () => void;
  jobTitle: string;
  jobLat: number;
  jobLon: number;
  contractorName: string;
}

export default function JobLocationMap({
  visible,
  onClose,
  jobTitle,
  jobLat,
  jobLon,
  contractorName,
}: JobLocationMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number>(0);
  const [jobLocationName, setJobLocationName] = useState<string>('Job Location');
  const [currentLocationName, setCurrentLocationName] = useState<string>('Your Location');

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        setLoading(true);

        // Get current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to show the map');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const currentLoc = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(currentLoc);

        // Calculate distance
        const dist = getDistanceFromLatLonInKm(
          currentLoc.latitude,
          currentLoc.longitude,
          jobLat,
          jobLon
        );
        setDistance(dist);

        // Get location names
        try {
          const currentAddress = await Location.reverseGeocodeAsync(currentLoc);
          if (currentAddress?.[0]) {
            const { name, city } = currentAddress[0];
            setCurrentLocationName(name && city ? `${name}, ${city}` : name || 'Your Location');
          }

          const jobAddress = await Location.reverseGeocodeAsync({ latitude: jobLat, longitude: jobLon });
          if (jobAddress?.[0]) {
            const { name, city } = jobAddress[0];
            setJobLocationName(name && city ? `${name}, ${city}` : name || 'Job Location');
          }
        } catch (err) {
          console.log('Could not reverse geocode location names');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error getting location:', err);
        Alert.alert('Error', 'Could not get current location');
        setLoading(false);
      }
    })();
  }, [visible]);

  const handleOpenGoogleMaps = () => {
    if (!currentLocation) return;

    // Google Maps URL for navigation
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${jobLat},${jobLon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  if (!currentLocation && visible) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' }}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={{ marginTop: 12, textAlign: 'center', color: '#333' }}>Loading location...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header */}
        <View style={{ 
          paddingTop: 40, 
          paddingBottom: 12, 
          paddingHorizontal: 16, 
          backgroundColor: '#1b1b2f',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', flex: 1 }}>
            {jobTitle}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        {currentLocation && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: (currentLocation.latitude + jobLat) / 2,
              longitude: (currentLocation.longitude + jobLon) / 2,
              latitudeDelta: Math.abs(currentLocation.latitude - jobLat) + 0.05,
              longitudeDelta: Math.abs(currentLocation.longitude - jobLon) + 0.05,
            }}
          >
            {/* Worker Location Marker */}
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              description={currentLocationName}
              pinColor="#2196F3"
            >
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#2196F3',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#fff'
              }}>
                <MaterialIcons name="my-location" size={20} color="#fff" />
              </View>
            </Marker>

            {/* Job Location Marker */}
            <Marker
              coordinate={{ latitude: jobLat, longitude: jobLon }}
              title={jobTitle}
              description={jobLocationName}
              pinColor="#FF6B6B"
            >
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#FF6B6B',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#fff'
              }}>
                <MaterialIcons name="location-on" size={20} color="#fff" />
              </View>
            </Marker>

            {/* Route Line */}
            <Polyline
              coordinates={[
                { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                { latitude: jobLat, longitude: jobLon },
              ]}
              strokeColor="#667eea"
              strokeWidth={3}
            />
          </MapView>
        )}

        {/* Bottom Info Card */}
        <View style={{ 
          backgroundColor: '#1b1b2f', 
          padding: 16,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}>
          {/* Distance Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialIcons name="straighten" size={24} color="#667eea" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#aaa', fontSize: 12 }}>Distance</Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                {distance.toFixed(2)} km
              </Text>
            </View>
          </View>

          {/* Location Info */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialIcons name="my-location" size={20} color="#2196F3" />
              <Text style={{ color: '#2196F3', marginLeft: 8, fontWeight: '600' }}>Your Location</Text>
            </View>
            <Text style={{ color: '#ccc', fontSize: 13, marginLeft: 28 }}>
              {currentLocationName}
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
              <Text style={{ color: '#FF6B6B', marginLeft: 8, fontWeight: '600' }}>Job Location</Text>
            </View>
            <Text style={{ color: '#ccc', fontSize: 13, marginLeft: 28 }}>
              {jobLocationName}
            </Text>
          </View>

          {/* Open Maps Button */}
          <TouchableOpacity 
            onPress={handleOpenGoogleMaps}
            style={{ 
              backgroundColor: '#667eea',
              paddingVertical: 14,
              borderRadius: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <MaterialIcons name="directions" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 16 }}>
              Open in Google Maps
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
