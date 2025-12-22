import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "../../../styles/WorkerProfileStyles";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_BASE } from "../../../utils/config";
import { clearAllUserData } from "../../../utils/socket";
import ReferralModal from "../../../components/ReferralModal";

export default function Profile(): React.ReactElement {
  const [userName, setUserName] = useState<string>("Worker");
  const [workerId, setWorkerId] = useState<string>("0000");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [workerName, setWorkerName] = useState<string>("");
  const [workerPhone, setWorkerPhone] = useState<string>("");
  const router = useRouter();

  // Use central API base

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const profileStr = await AsyncStorage.getItem("profilePhoto");

        if (userStr) {
          const parsed = JSON.parse(userStr);
          setUserName(parsed.name || "Worker");
          setWorkerId(parsed.phone || "0000");
          setWorkerName(parsed.name || "Worker");
          setWorkerPhone(parsed.phone || "0000");
        }

        if (profileStr) setProfilePhoto(profileStr);
      } catch (err) {
        console.error("Failed to load user/profile photo", err);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Camera roll permission is required to select a profile photo."
      );
      return;
    }

    const result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;

      // Show local image immediately
      setProfilePhoto(uri);

      try {
        const userToken = await AsyncStorage.getItem("token");
        if (!userToken) {
          Alert.alert("Error", "No auth token found");
          return;
        }

        const formData = new FormData();
        formData.append("photo", {
          uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
          name: `profile-${workerId}.jpg`,
          type: "image/jpeg",
        } as any);

        console.log("📤 Uploading profile photo...");
        const response = await axios.post(`${API_BASE}/users/photo`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userToken}`,
          },
        });

        console.log("✅ Upload response:", response.data);

        if (response.data.success && response.data.profilePhoto) {
          // URL from server is already correct (ngrok or LAN IP)
          console.log("✅ Saving profile photo URL:", response.data.profilePhoto);
          setProfilePhoto(response.data.profilePhoto);
          await AsyncStorage.setItem("profilePhoto", response.data.profilePhoto);
          Alert.alert("Success", "Profile photo updated!");
        } else {
          console.log("❌ Invalid response:", response.data);
          Alert.alert("Error", "Server returned invalid response");
        }
      } catch (err: any) {
        console.error("❌ Profile photo upload error:", err.response?.data || err.message);
        Alert.alert(
          "Upload failed",
          err?.response?.data?.message || err.message || "Could not upload profile photo."
        );
        // Revert to previously saved photo
        const savedPhoto = await AsyncStorage.getItem("profilePhoto");
        if (savedPhoto) setProfilePhoto(savedPhoto);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // ✅ Comprehensive cleanup including socket
            await clearAllUserData();
            router.replace("/");
          } catch (err) {
            console.error("Failed to logout", err);
            // Even if cleanup fails, navigate to login
            router.replace("/");
          }
        },
      },
    ]);
  };

  const navigateTo = (path: string | null) => {
    if (path) router.push(path as any);
  };

  const infoCards = [
    {
      header: "Support",
      icon: "support-agent",
      options: [
        { name: "Help Centre", screen: "/HelpCentre" },
        { name: "Support Ticket", screen: "/SupportTickets" },
      ],
    },
    {
      header: "Documents & Policies",
      icon: "description",
      options: [
        { name: "Aadhar Card & 90-Day Policy", screen: "/DocumentsAndPolicies" },
      ],
    },
    {
      header: "Partner Options",
      icon: "handshake",
      options: [
        { name: "Videos & Tutorials", screen: "/VideosAndTutorials" },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#1a2f4d", "#1a2f4d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <TouchableOpacity onPress={pickImage} style={styles.profileIcon}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <MaterialIcons name="person" size={60} color="#fff" />
          )}
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{userName}</Text>
          <Text style={styles.workerId}>Worker ID: {workerId}</Text>
          <Text style={styles.ratingText}>Rating: 4.5 ⭐</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardsRow}>
        {[
          { title: "Gig History", icon: "history", route: "/GigHistory" },
          { title: "Earnings", icon: "attach-money", route: "/wallet" },
          { title: "Settings", icon: "settings", route: "/Settings" },
        ].map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.profileCard}
            onPress={() => router.push(card.route as any)}
          >
            <MaterialIcons name={card.icon as any} size={28} color="#1a2f4d" />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.referralContainer}
        onPress={() => setReferralModalVisible(true)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.referralHeading}>Referral Bonus</Text>
          <Text style={styles.referralText}>You have earned ₹500 from referrals</Text>
        </View>
        <MaterialIcons name="card-giftcard" size={40} color="#1a2f4d" />
      </TouchableOpacity>

      {infoCards.map((card, index) => (
        <View key={index} style={styles.supportContainer}>
          <View style={styles.headerWithIcon}>
            <MaterialIcons name={card.icon as any} size={24} color="#1a2f4d" />
            <Text style={styles.supportHeader}>{card.header}</Text>
          </View>

          {card.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.supportOption}
              onPress={() => navigateTo(option.screen)}
            >
              <Text style={styles.supportText}>{option.name}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#1a2f4d" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <ReferralModal
        visible={referralModalVisible}
        onClose={() => setReferralModalVisible(false)}
        workerName={workerName}
        workerPhone={workerPhone}
      />
    </ScrollView>
  );
}
