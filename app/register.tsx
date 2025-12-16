import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/config';
import styles from '../styles/RegisterScreenStyles';

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
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        // Save user locally for convenience
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        // Request OTP so developer can see it in server console (dev-mode)
        try {
          await fetch(`${API_BASE}/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, name, role }),
          });
        } catch (e) {
          console.warn('Failed to request OTP:', e);
        }

        Alert.alert('Success', 'Registration completed! OTP sent (dev-mode — check server console)');
        // Navigate to OTP verification screen so user can enter code and complete sign-in
        router.push('/verify-otp');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (err) {
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
