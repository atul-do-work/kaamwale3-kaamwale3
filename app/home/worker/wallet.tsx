import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../../../styles/WorkerWalletStyles';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE as API_URL } from '../../../utils/config';
import { socket } from '../../../utils/socket'; // ✅ Import Socket.IO
import { connectSocket } from '../../../utils/socket'; // ✅ Import connect function
// Define types for wallet and transactions
type Transaction = {
  type: 'deposit' | 'withdraw' | 'payment'; // ✅ Added 'payment' type for contractor payments
  amount: number;
  date: string;
};

type WalletType = {
  balance: number;
  transactions: Transaction[];
};

export default function Wallet(): React.ReactElement {
  const [wallet, setWallet] = useState<WalletType>({ balance: 0, transactions: [] });
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(null);
  const [walletFetchPending, setWalletFetchPending] = useState(false); // ✅ Prevent race conditions
  const previousUserPhoneRef = useRef<string | null>(null); // ✅ Track previous user to detect changes

  // API_URL imported from central config

  // ✅ Check for user changes when screen comes into focus (no dependency on currentUserPhone to avoid stale closures)
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const userStr = await AsyncStorage.getItem('user');
        const userPhone = userStr ? JSON.parse(userStr).phone : null;
        
        // If user changed (compare with ref, not state), reset wallet state immediately
        if (userPhone && userPhone !== previousUserPhoneRef.current) {
          console.log(`👤 Wallet: User changed from ${previousUserPhoneRef.current} to ${userPhone}, resetting wallet`);
          previousUserPhoneRef.current = userPhone;
          setCurrentUserPhone(userPhone);
          setWallet({ balance: 0, transactions: [] });
        } else if (!userPhone && previousUserPhoneRef.current !== null) {
          // User logged out
          console.log(`👤 Wallet: User logged out, resetting wallet`);
          previousUserPhoneRef.current = null;
          setCurrentUserPhone(null);
          setWallet({ balance: 0, transactions: [] });
        }
      })();
    }, [])
  );

  // Fetch wallet data when component mounts
  useEffect(() => {
    // ✅ Get current user to detect user changes on initial mount
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const userPhone = userStr ? JSON.parse(userStr).phone : null;
      
      // If user changed, reset wallet state
      if (userPhone && userPhone !== currentUserPhone) {
        console.log(`👤 User changed from ${currentUserPhone} to ${userPhone}, resetting wallet`);
        setCurrentUserPhone(userPhone);
        setWallet({ balance: 0, transactions: [] });
      }
    })();
  }, []);

  // Fetch wallet when user phone changes
  useEffect(() => {
    if (currentUserPhone) {
      console.log(`💼 Fetching wallet for user: ${currentUserPhone}`);
      (async () => {
        // ✅ Ensure socket is connected with auth token (don't disconnect if already connected)
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          if (!socket.connected) {
            socket.auth = { token: storedToken };
            socket.connect();
            console.log("✅ Socket connecting with token for wallet");
          } else {
            console.log("✅ Socket already connected for wallet");
          }
        }
      })();

      // Small delay to ensure socket is ready
      const timer = setTimeout(() => {
        fetchWallet();
      }, 500);

      // ✅ Listen for job updates (payment) and refresh wallet
      const handleJobUpdated = (job: any) => {
        console.log("📱 Job updated event received:", job.paymentStatus);
        if (job.paymentStatus === "Paid") {
          console.log("💰 Payment detected, refreshing wallet...");
          // ✅ Prevent race condition: Only refresh if no other fetch is pending
          if (!walletFetchPending) {
            setWalletFetchPending(true);
            setTimeout(() => {
              fetchWallet().finally(() => setWalletFetchPending(false));
            }, 500);
          } else {
            console.log("⏳ Wallet fetch already pending, skipping duplicate fetch");
          }
        }
      };

      // ✅ Listen for wallet refresh events (from payment)
      const handleWalletRefresh = (data: any) => {
        console.log(`💸 Wallet refresh event received:`, data);
        if (!walletFetchPending) {
          setWalletFetchPending(true);
          setTimeout(() => {
            fetchWallet().finally(() => setWalletFetchPending(false));
          }, 500);
        }
      };

      // ✅ Listen for wallet updated events (from Razorpay payment)
      const handleWalletUpdated = (data: any) => {
        console.log(`💰 Wallet updated from payment:`, data);
        if (data.phone === currentUserPhone && !walletFetchPending) {
          setWalletFetchPending(true);
          setTimeout(() => {
            fetchWallet().finally(() => setWalletFetchPending(false));
          }, 500);
        }
      };

      socket.on("jobUpdated", handleJobUpdated);
      socket.on("walletRefresh", handleWalletRefresh);
      socket.on("walletUpdated", handleWalletUpdated);

      return () => {
        clearTimeout(timer);
        socket.off("jobUpdated", handleJobUpdated);
        socket.off("walletRefresh", handleWalletRefresh);
        socket.off("walletUpdated", handleWalletUpdated);
      };
    }
  }, [currentUserPhone]);

  // ✅ Refresh wallet when screen comes into focus (fallback for missed socket events)
  useFocusEffect(
    React.useCallback(() => {
      console.log("📱 Wallet screen focused - refreshing balance");
      fetchWallet();
    }, [])
  );

  const fetchWallet = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Promise.reject('No token');

      const res = await axios.get(`${API_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.wallet) {
        console.log(`💰 Wallet fetched: ₹${res.data.wallet.balance}`);
        setWallet({
          balance: res.data.wallet.balance || 0,
          transactions: res.data.wallet.transactions || []
        });
        return Promise.resolve();
      }
      return Promise.reject('Failed to fetch wallet');
    } catch (err) {
      console.error('Failed to fetch wallet', err);
      return Promise.reject(err);
    }
  };

  const handleDepositClick = () => {
    setShowDeposit(true);
    setShowWithdraw(false);
  };

  const handleWithdrawClick = () => {
    setShowWithdraw(true);
    setShowDeposit(false);
  };

  const confirmDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount to deposit');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/wallet/deposit`,
        { amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setWallet(res.data.wallet);
        Alert.alert('Success', `₹${depositAmount} deposited!`);
        setDepositAmount('');
        setShowDeposit(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Deposit failed');
    }
  };

  const confirmWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount to withdraw');
      return;
    }
    if (Number(withdrawAmount) > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/wallet/withdraw`,
        { amount: Number(withdrawAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setWallet(res.data.wallet);
        Alert.alert('Success', `₹${withdrawAmount} withdrawn!`);
        setWithdrawAmount('');
        setShowWithdraw(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Withdrawal failed');
    }
  };

  // Map transactions to cards
  const cards = wallet.transactions.map((t, idx) => ({
    id: idx + 1,
    title: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    amount: t.amount,
    date: new Date(t.date).toLocaleDateString(),
    icon: t.type === 'deposit' ? 'attach-money' : (t.type === 'payment' ? 'paid' : 'money-off')
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Earnings Header */}
      <LinearGradient
        colors={['#2a2a31ff', '#6a0dad']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <Text style={styles.headerText}>Earnings</Text>
        <Text style={styles.amountText}>₹{wallet.balance}</Text>
      </LinearGradient>

      {/* Pocket Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Pocket Balance</Text>
        <Text style={styles.balanceAmount}>₹{wallet.balance}</Text>
      </View>

      {/* Available Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹{wallet.balance}</Text>
      </View>

      {/* Deposit & Withdraw Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#610e9c' }]}
          onPress={handleDepositClick}
        >
          <Text style={styles.buttonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
          onPress={handleWithdrawClick}
        >
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Deposit Input */}
      {showDeposit && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={depositAmount}
            onChangeText={setDepositAmount}
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#610e9c', flex: 0.3 }]}
            onPress={confirmDeposit}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conditional Withdraw Input */}
      {showWithdraw && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2ecc71', flex: 0.3 }]}
            onPress={confirmWithdraw}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cards Grid */}
      <View style={styles.cardsRow}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardContainer}>
            <MaterialIcons name={card.icon as any} size={28} color="#610e9c" />
            <Text style={styles.cardAmount}>₹{card.amount}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDate}>{card.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
