import { StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    width: '100%',
    height: height * 0.2,
    backgroundColor: '#610e9c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  // profileIcon: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   backgroundColor: '#8e44ad',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 120,
  // },
  profileInfo: {
    flexDirection: 'column',
    paddingLeft: 80,
  },
  nameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workerId: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  // Add these below existing styles
cardsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '90%',
  alignSelf: 'center',
  marginTop: 20,
},
profileCard: {
  width: '30%',
  backgroundColor: '#fff',
  borderRadius: 15,
  paddingVertical: 20,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},
cardTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginTop: 8,
  textAlign: 'center',
},
// Referral Bonus container
referralContainer: {
  width: '100%',
  height: 100,
  backgroundColor: '#fff',
  marginTop: 20,
  paddingHorizontal: 20,
  borderRadius: 15,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},
referralTextContainer: {
  flexDirection: 'column',
  maxWidth: '70%',
},
referralHeading: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
},
referralText: {
  fontSize: 14,
  color: '#777',
  marginTop: 4,
},
// Support container
supportContainer: {
  width: '100%',
  backgroundColor: '#fff',
  marginTop: 20,
  borderRadius: 15,
  padding: 20,
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},
supportHeader: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
  marginBottom: 15,
},
supportOption: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 15,
  borderBottomWidth: 0.5,
  borderBottomColor: '#ddd',
},
supportText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#610e9c',
},
headerWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
},
logoutButton: {
  flexDirection: 'row',       // icon + text in a row
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',               // full width with some margin
  alignSelf: 'center',
  marginTop: 20,
  marginBottom: 20,
  paddingVertical: 14,
  backgroundColor: '#e74c3c', // red color for logout
  borderRadius: 25,
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},
logoutText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

profileIcon: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: "#fff",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
},
profilePhoto: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

});
