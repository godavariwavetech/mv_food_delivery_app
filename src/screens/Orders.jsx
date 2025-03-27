import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
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

const OrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  const [toggle, setToggle] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
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
      if (response?.status === 200) {
        setOrders(response.data);
      } else {
        Alert.alert("Error", response?.message || "Failed to load orders.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
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
        order.order_id === orderId ? { ...order, order_status: 2 } : order
      )
    );
  };

  const handleComplete = orderId => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_id === orderId ? { ...order, order_status: 3 } : order
      )
    );
    fetchOrders();
  };

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
            {orders.length === 0 && !loading ? (
              <View style={styles.noOrdersContainer}>
                <Icon name="exclamation-circle" size={scale(50)} color="gray" />
                <Text style={styles.noOrdersText}>No Orders Available</Text>
                <Text style={styles.noOrdersSubText}>
                  Pull down to refresh and check for new orders.
                </Text>
              </View>
            ) : (
              orders
                .filter(order => !acceptedOrder || order.order_id === acceptedOrder.order_id)
                .map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      navigation.navigate('Ordertracking', {
                        orderDetails: item,
                        handleAccept,
                        handleComplete,
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
  }
});

export default OrdersScreen;
