import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import ToggleSwitch from '../components/ToggleSwitch';
import { AuthContext } from "../context/AuthContext";
import OrderCard from '../components/orderCard';
import { getFCMToken, getTokenValue } from '../NotificationService';
import Geolocation from 'react-native-geolocation-service';

// import { getFCMToken } from '../NotificationService';
const OrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  const [toggle, setToggle] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [deliveryBoylocationId, setDeliveryBoyLocationId] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ latitude: null, longitude: null });

  const uploadToken = async () => {
    console.log(">>>>>>>>>>>>>>>>>VCALLIN")
    const token = await getTokenValue();
    // console.log("TOKEN>>>>>>>>>>>>>>>>>",token,ApiService)
    const value = await ApiService.uploadFcmToken(token,user?.id,user?.delivery_boy_location_id);
        setDeliveryBoyLocationId(user?.delivery_boy_location_id)

    console.log("value",value)
  }

   const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('Permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true; // iOS assumes permission if declared in Info.plist
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId = null;

      const getLocation = async () => {
        const hasPermission = await requestPermission();
        console.log('Permission granted:', hasPermission);
        if (!hasPermission) {
          Alert.alert(
            'Location Permission Denied',
            'Please enable location permission in your settings.',
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
          return false;
        }
        return true;
      };

      const fetchLocation = () => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Location Update (1 min) - Latitude:', latitude, 'Longitude:', longitude);
            setDriverLocation({ latitude, longitude }); // Update state with latest location
            const payload={
              user_id:user?.id,
              latitude:latitude,
              longitude:longitude,
              locationId:deliveryBoylocationId
            }
            console.log(payload,'payload');
            // Optionally send to backend
            // ApiService.postDeliveryBoyLocation(user?.id, { latitude, longitude},deliveryBoylocationId);
          },
          (error) => {
            console.log('❌ Error getting location:', error.code, error.message);
            let message = 'Unable to fetch location. Please try again.';
            if (error.code === 1) {
              message = 'Location permission denied. Please enable it in settings.';
            } else if (error.code === 2) {
              message = 'Location services are unavailable. Please enable them.';
            } else if (error.code === 3) {
              message = 'Location request timed out. Please try again.';
            }
            Alert.alert('Location Error', message, [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
          {
            enableHighAccuracy: false, // Set to true if higher accuracy is needed
            timeout: 20000,
            maximumAge: 30000,
          }
        );
      };

      const startLocationTracking = async () => {
        //  if (toggle !== 1) return; // Only track location when online

        if (toggle === 1) {
          const permissionGranted = await getLocation();
          if (!permissionGranted) return;

          // Fetch location immediately
          fetchLocation();

          // Set interval to fetch location every 10 seconds
          intervalId = setInterval(() => {
            fetchLocation();
          }, 10000);
        }
      };

      startLocationTracking();

      // Cleanup on screen blur or component unmount
      return () => {
        if (intervalId !== null) {
          clearInterval(intervalId);
          console.log('🛑 Cleared interval');
        }
      };
    }, [toggle, user, deliveryBoylocationId])
  );

  useEffect(() => {
    console.log(user,'user')
    if (user?.id) {
      fetchOrders();
      uploadToken()
    }
  }, [user]);

  useEffect(() => {
    const ongoingOrder = orders.find(order => order.order_status === 2);
    setAcceptedOrder(ongoingOrder || null);
  }, [orders]);

  // Function to fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await ApiService.getOrders(user);
      console.log(response, 'response');
      if (response?.status === 200) {
        setOrders(response.data);
      } else {
        // Alert.alert("Error", response?.message || "Failed to load orders.");
      }
    } catch (error) {
      // Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch orders when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleAccept = orderId => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_ids === orderId ? { ...order, order_status: 2 } : order
      )
    );
  };

  const handleComplete = orderId => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_ids === orderId ? { ...order, order_status: 3 } : order
      )
    );
    fetchOrders();
  };

  const filteredOrders = orders.filter(order =>
    activeTab === 'new'
      ? order.order_status === 1
      : order.order_status === 2 || order.order_status === 8
  );

  return (
    <>
      <StatusBar backgroundColor="green" barStyle="light-content" />
      <View style={styles.header}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="bars" size={scale(24)} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {user?.delivery_boy_name ? user?.delivery_boy_name.charAt(0).toUpperCase() + user.delivery_boy_name.slice(1) : "Welcome"}
          </Text>
        </View>
        {!acceptedOrder && <ToggleSwitch toggle={toggle} setToggle={setToggle} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{flex:1,backgroundColor: '#F8F9FA'}}>
        <View style={{ backgroundColor: '#F8F9FA', flex: 1 }}>
        {/* Top Tabs (New Orders and Accepted Orders) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'new' ? styles.activeTab : null]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={[styles.tabText, activeTab === 'new' ? styles.activeTabText : null]}>
              New Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'accepted' ? styles.activeTab : null]}
            onPress={() => setActiveTab('accepted')}
          >
            <Text style={[styles.tabText, activeTab === 'accepted' ? styles.activeTabText : null]}>
              Ongoing Orders
            </Text>
          </TouchableOpacity>
        </View>

      <View style={styles.container}>
        {toggle === 0 && !acceptedOrder ? (
          <View style={styles.offlineContainer}>
            <Icon name="wifi" size={scale(50)} color="gray" />
            <Text style={styles.offlineText}>You are offline</Text>
            <Text style={styles.offlineSubText}>
              Please go online to see new orders.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
            }
          >
            {filteredOrders.length === 0 && !loading ? (
              <View style={styles.noOrdersContainer}>
                <Icon name="exclamation-circle" size={scale(50)} color="gray" />
                <Text style={styles.noOrdersText}>No Orders Available</Text>
                <Text style={styles.noOrdersSubText}>
                  Pull down to refresh and check for new orders.
                </Text>
              </View>
            ) : (
              filteredOrders
                .filter(order => !acceptedOrder || order.order_ids === acceptedOrder.order_ids)
                .map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      navigation.navigate('Ordertracking', {
                        orderDetails: item,
                        handleAccept,
                        handleComplete,
                        driverLocation:driverLocation,
                        status:'beforeComplete'  // this is for only to convert the dateformat
                      })
                    }
                  >
                    <OrderCard order={item} />
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        )}
      </View>

        </View>
    </ScrollView>  
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: wp(3), backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: wp(3),
    backgroundColor: 'green',
    marginBottom: hp(1),
    width: '100%',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    marginLeft: wp(3),
    color: 'white',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  offlineText: {
    fontSize: scale(20),
    fontWeight: "bold",
    color: "gray",
    marginTop: verticalScale(10),
  },
  offlineSubText: {
    fontSize: scale(14),
    color: "gray",
    marginTop: verticalScale(5),
    textAlign: "center",
    paddingHorizontal: wp(10),
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    height: hp(55),
  },
  noOrdersText: {
    fontSize: scale(20),
    fontWeight: "bold",
    color: "gray",
    marginTop: verticalScale(10),
  },
  noOrdersSubText: {
    fontSize: scale(14),
    color: "gray",
    marginTop: verticalScale(5),
    textAlign: "center",
    paddingHorizontal: wp(10),
  },

   tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    padding: moderateScale(4),
    marginHorizontal: wp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(6),
  },
  activeTab: {
    backgroundColor: 'green',
    borderRadius: moderateScale(6),
  },
  tabText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
});

export default OrdersScreen;
