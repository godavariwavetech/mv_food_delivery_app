import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Separator from './Separator';

// The component now accepts onPress and onAccept props
const OrderCard = ({ order, onPress, onAccept }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    // The whole card is wrapped in a TouchableOpacity for navigation
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View>
        {/* Order Header - ID, Total, and Time */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}># {order.order_ids}</Text>
          <Text style={styles.grandTotal}>₹{order.grand_total}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.timeText}>{formatDate(order?.order_date)} {order?.order_time}</Text>
        </View>

        <Separator />

        {/* Shop and Delivery Address */}
        <View style={styles.addressSection}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="store-alt" size={15} color="#E53935" />
            <Text style={styles.infoText} numberOfLines={1}>{order.shop_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome5 name="location-arrow" size={15} color="#262757" />
            <Text style={styles.infoText} numberOfLines={2}>
              {order.delivery_address}
            </Text>
          </View>
        </View>

        {/* Driver's Earnings */}
        {order.delivery_charges && (
          <>
            <Separator />
            <View style={styles.earningContainer}>
              <Text style={styles.earningLabel}>Your Earnings</Text>
              <Text style={styles.earningValue}>
                ₹{order.delivery_charges}
              </Text>
            </View>
          </>
        )}

        {/* --- MODIFICATION START: Accept Button for New Orders --- */}
        {order.order_status === 1 && (
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </TouchableOpacity>
        )}
        {/* --- MODIFICATION END --- */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, // Reduced padding
    marginVertical: 6, // Reduced vertical margin
    marginHorizontal: 4, // Added horizontal margin for shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, // Reduced shadow radius
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },
  addressSection: {
    marginVertical: 8, // Reduced margin
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4, // Reduced margin
  },
  infoText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    color: '#333',
  },
  earningContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
  },
  earningLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  // --- STYLES FOR ACCEPT BUTTON ---
  acceptButton: {
    backgroundColor: '#27ae60', // Green color for accept
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default OrderCard;