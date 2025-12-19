import { Tabs } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";

export default function ContractorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 6,
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="postjobs"
        options={{
          tabBarLabel: "Post Job",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="plus-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
