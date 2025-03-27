import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Separator from './Separator';


const OrderCard = ({ order }) => {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",  // "Mar"
      day: "2-digit",  // "21"
      year: "numeric", // "2025"
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,  // Ensures 12-hour format
    }).format(date);
  };
  return (
    <View style={styles.card}>
      {/* Order Header - Category & Time */}
      <View style={{ flexDirection: "column" }}>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ marginBottom: 5 }}># { } {order.order_id}</Text>
          <View style={{flexDirection: "row"}}>
            <MaterialIcons name="currency-rupee" size={18} color="#555" />
            <Text style={{ marginBottom: 5 }}>{order.grand_total}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.timeText}>{formatDate(order.order_date)}</Text>
        </View>
      </View>
      <Separator />
      <View style={styles.header}>
        {/* <Image source={{ uri: order.category_image }} style={styles.categoryIcon} /> */}
        <FontAwesome5 name="map-marker-alt" size={18} color="#E53935" />
        <Text style={styles.categoryText}>{order.shop_name}</Text>
      </View>

      {/* Item Image & Info */}
      {/* <View style={styles.itemContainer}>
        <Image source={{ uri: order.category_image }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{order.item_name}</Text>
          <Text style={styles.itemPrice}>₹{order.item_price} x {order.item_count}</Text>
        </View>
      </View> */}

      {/* Address & Distance */}
      <View style={styles.infoRow}>
        <FontAwesome5 name="location-arrow" size={18} color="green" />
        <Text style={styles.infoText} numberOfLines={2}>
          {order.delivery_address}
        </Text>
      </View>

      {/* Delivery Details */}
      <View style={styles.deliveryInfo}>
        {/* <View style={styles.infoRow}>
          <MaterialIcons name="directions-bike" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>Distance: {order.order_distance} km</Text>
        </View> */}
        {/* <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#2196F3" />    
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customer_mobile_number}`)}>
          <Text style={styles.infoText}>{order.customer_mobile_number}</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Total & OTP */}
      {/* <View style={styles.footer}>
        <Text style={styles.totalText}>Grand Total: ₹{order.grandTotal}</Text>
        <View style={styles.otpContainer}>
          <Text style={styles.otpText}>OTP: {order.customerOtp}</Text>
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 5
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#777',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  deliveryInfo: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  otpContainer: {
    backgroundColor: '#FFEB3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  otpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default OrderCard;
