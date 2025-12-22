import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/config';
import styles from '../styles/RegisterScreenStyles';
import { registerForPushNotificationsAsync } from '../services/notification'; // ✅ Import FCM service

type User = {
  name: string;
  phone: string;
  password: string;
  role: 'worker' | 'contractor';
};

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'worker' | 'contractor'>('worker');

  const handleRegister = async () => {
    if (!name || !phone || !password)
      return Alert.alert('Error', 'Fill all fields');

    try {
      // ✅ GET FCM TOKEN - Try from app startup first, then request
      let fcmToken = null;
      console.log('📋 Starting registration process...');
      
      try {
        // First, try to get token from app startup
        const savedToken = await AsyncStorage.getItem('appFcmToken');
        if (savedToken) {
          fcmToken = savedToken;
          console.log('✅ Using FCM token from app startup:', fcmToken.substring(0, 30) + '...');
        } else {
          // If not available, request it now
          console.log('🔔 No token from startup, requesting now...');
          fcmToken = await registerForPushNotificationsAsync();
          if (fcmToken) {
            console.log('✅ FCM Token obtained during registration:', fcmToken.substring(0, 30) + '...');
            await AsyncStorage.setItem('appFcmToken', fcmToken);
          } else {
            console.log('⚠️ FCM Token is null - user may have denied permissions');
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not get FCM token:', err);
        // Continue without token - OTP will use console fallback
      }

      console.log('📤 Sending registration request...');
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        console.log('✅ Registration successful');
        // Save user locally for convenience
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        if (fcmToken) {
          await AsyncStorage.setItem('fcmToken', fcmToken);
          console.log('💾 FCM Token saved to AsyncStorage');
        }

        // ✅ REQUEST OTP WITH FCM TOKEN
        console.log('📨 Requesting OTP with FCM token...');
        console.log('📝 Phone:', phone);
        console.log('📝 FCM Token being sent:', fcmToken ? fcmToken.substring(0, 30) + '...' : 'null');
        
        try {
          const otpRes = await fetch(`${API_BASE}/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phone, 
              name, 
              role,
              fcmToken  // ✅ SEND FCM TOKEN HERE
            }),
          });
          
          const otpData = await otpRes.json();
          console.log('✅ OTP Request response:', otpData.message);
        } catch (e) {
          console.warn('Failed to request OTP:', e);
        }

        let successMessage = 'Registration completed! ';
        if (fcmToken) {
          successMessage += 'OTP sent to your phone via notification.';
        } else {
          successMessage += 'Check server console for OTP (no FCM token).';
        }
        
        Alert.alert('Success', successMessage);
        // Navigate to OTP verification screen so user can enter code and complete sign-in
        router.push('/verify-otp');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Server not responding');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Create Account</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleButton, role === 'worker' && styles.roleButtonSelected]} onPress={() => setRole('worker')}>
          <Text style={[styles.roleText, role === 'worker' && styles.roleTextSelected]}>Worker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleButton, role === 'contractor' && styles.roleButtonSelected]} onPress={() => setRole('contractor')}>
          <Text style={[styles.roleText, role === 'contractor' && styles.roleTextSelected]}>Contractor</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}



// for firebase registeratyion
// // app/(auth)/Register.tsx

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import styles from '../styles/RegisterScreenStyles';

// import { auth, db } from '@/firebase/firebaseConfig';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { ref, set } from 'firebase/database';

// type User = {
//   name: string;
//   phone: string;
//   password: string;
//   role: 'worker' | 'contractor';
// };

// export default function Register() {
//   const router = useRouter();
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'worker' | 'contractor'>('worker');

//   const handleRegister = async () => {
//     if (!name || !phone || !password) {
//       return Alert.alert('Error', 'Fill all fields');
//     }

//     const newUser: User = {
//       name,
//       phone,
//       password,
//       role,
//     };

//     try {
//       // Firebase Auth requires email, so we convert phone to fake email
//       const email = `${phone}@kaamwale.com`;

//       // 1️⃣ Create user in Firebase Auth
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // 2️⃣ Save additional user info in Realtime DB
//       await set(ref(db, `users/${user.uid}`), {
//         name,
//         phone,
//         role,
//         profilePhoto: '', // empty initially
//         walletBalance: 0,
//       });

//       await AsyncStorage.setItem('user', JSON.stringify({ uid: user.uid, name, phone, role }));

//       Alert.alert('Success', 'Registration successful!');
//       router.replace('/');
//     } catch (error: any) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <Text style={styles.title}>Create Account</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <View style={styles.roleContainer}>
//         <TouchableOpacity
//           style={[styles.roleButton, role === 'worker' && styles.roleButtonSelected]}
//           onPress={() => setRole('worker')}
//         >
//           <Text style={[styles.roleText, role === 'worker' && styles.roleTextSelected]}>
//             Worker
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.roleButton, role === 'contractor' && styles.roleButtonSelected]}
//           onPress={() => setRole('contractor')}
//         >
//           <Text style={[styles.roleText, role === 'contractor' && styles.roleTextSelected]}>
//             Contractor
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
