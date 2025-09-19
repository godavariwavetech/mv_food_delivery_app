import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Linking,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {AuthContext} from '../context/AuthContext';
import SwipeButton from 'rn-swipe-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// THEME COLORS (Centralized for easy changes)
const theme = {
  primary: '#1a43bf',
  lightPrimary: '#e3f2fd',
  accent: '#FF9800',
  success: '#4CAF50',
  text: '#333',
  lightText: '#666',
  background: '#fff',
  cardBackground: '#F8F9FA',
  borderColor: '#e0e0e0',
};

// =================================================================
// HELPER COMPONENTS FOR CLEANER UI
// =================================================================

// A reusable card component
const InfoCard = ({ title, iconName, children }) => (
  <View style={styles.infoCardContainer}>
    <View style={styles.infoCardHeader}>
      <Icon name={iconName} size={20} color={theme.primary} />
      <Text style={styles.infoCardTitle}>{title}</Text>
    </View>
    <View style={styles.infoCardContent}>
      {children}
    </View>
  </View>
);

// A reusable row for displaying details
const DetailRow = ({ iconName, label, value, isLink, onPress, children }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <View style={styles.detailRow}>
      <Icon name={iconName} size={18} color={theme.lightText} style={styles.detailRowIcon} />
      <Text style={styles.detailRowLabel}>{label}</Text>
      {value && <Text style={[styles.detailRowValue, isLink && styles.linkText]}>{value}</Text>}
      {children}
    </View>
  </TouchableOpacity>
);

// Visual progress tracker
const ProgressTracker = ({ status }) => {
  const isAccepted = status === 8 || status === 2 || status === 3;
  const isDelivered = status === 3;

  const getStepStyle = (isActive) => [
    styles.progressStep,
    isActive && styles.progressStepActive,
  ];
  const getIconColor = (isActive) => (isActive ? theme.primary : '#ccc');
  const getTextColor = (isActive) => (isActive ? theme.text : theme.lightText);
  const getLineStyle = (isActive) => [
    styles.progressLine,
    isActive && styles.progressLineActive,
  ];

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressStepWrapper}>
        <View style={getStepStyle(true)}>
          <Icon name="checkmark-circle" size={24} color={getIconColor(true)} />
        </View>
        <Text style={[styles.progressText, getTextColor(true)]}>New Order</Text>
      </View>

      <View style={getLineStyle(isAccepted)} />

      <View style={styles.progressStepWrapper}>
        <View style={getStepStyle(isAccepted)}>
          <Icon name="bicycle" size={24} color={getIconColor(isAccepted)} />
        </View>
        <Text style={[styles.progressText, getTextColor(isAccepted)]}>Accepted</Text>
      </View>

      <View style={getLineStyle(isDelivered)} />
      
      <View style={styles.progressStepWrapper}>
        <View style={getStepStyle(isDelivered)}>
          <Icon name="location" size={24} color={getIconColor(isDelivered)} />
        </View>
        <Text style={[styles.progressText, getTextColor(isDelivered)]}>Delivered</Text>
      </View>
    </View>
  );
};

// =================================================================
// Enhanced SwipeButton Component (Your logic is preserved)
// =================================================================
const EnhancedSwipeButton = ({
  onSwipeSuccess,
  title = "Swipe to Action",
  railBackgroundColor = "#66bb6a",
  railBorderColor = "#00A000",
  titleColor = "white",
  thumbIconName = "chevron-forward",
  disabled = false,
  resetKey = 0,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const swipeButtonRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (resetKey > 0) {
      setIsCompleted(false);
      setIsLoading(false);
      if (swipeButtonRef.current) {
        setTimeout(() => {
          swipeButtonRef.current.reset && swipeButtonRef.current.reset();
        }, 100);
      }
    }
  }, [resetKey]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    if (!isCompleted && !disabled && !isLoading) {
      pulse.start(); shimmer.start(); glow.start();
    } else {
      pulse.stop(); shimmer.stop(); glow.stop();
    }
    return () => {
      pulse.stop(); shimmer.stop(); glow.stop();
    };
  }, [isCompleted, disabled, isLoading]);

  const handleSwipeSuccess = async () => {
    setIsLoading(true);
    setIsCompleted(true);
    Animated.sequence([
      Animated.timing(thumbScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(thumbScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    if (onSwipeSuccess) await onSwipeSuccess();
    setIsLoading(false);
  };

  const renderThumbIcon = () => (
    <Animated.View style={[ enhancedSwipeStyles.thumbContainer, { transform: [{ scale: Animated.multiply(pulseAnim, thumbScale) }] } ]}>
      {isCompleted ? (
        <Animated.View style={enhancedSwipeStyles.successThumb}>
          <Icon name="checkmark" size={24} color="#fff" />
        </Animated.View>
      ) : (
        <View style={enhancedSwipeStyles.defaultThumb}>
          <Icon name={thumbIconName} size={24} color={railBackgroundColor} />
          <Animated.View style={[ enhancedSwipeStyles.shimmerOverlay, { opacity: shimmerAnim, transform: [{ translateX: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 90] }) }] } ]} />
          {!isLoading && (
            <Animated.View style={[ enhancedSwipeStyles.pulseRing, { borderColor: railBorderColor, transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.08], outputRange: [0.6, 0] }) } ]} />
          )}
        </View>
      )}
    </Animated.View>
  );

  const animatedGlowStyle = { shadowColor: railBorderColor, shadowOpacity: glowAnim, shadowRadius: 15 };

  return (
    <View style={[enhancedSwipeStyles.container, { marginBottom: insets.bottom }]}>
      <Animated.View style={[enhancedSwipeStyles.swipeButtonWrapper, animatedGlowStyle]}>
        <SwipeButton
          ref={swipeButtonRef}
          forceReset={(cancel) => setTimeout(() => cancel(), 300)}
          onSwipeSuccess={() => {
            handleSwipeSuccess();
            swipeButtonRef.current.reset && swipeButtonRef.current.reset();
          }}
          thumbIconComponent={renderThumbIcon}
          railBackgroundColor={railBackgroundColor}
          thumbIconBackgroundColor="transparent"
          railStyles={[ enhancedSwipeStyles.railStyles, { borderColor: railBorderColor, backgroundColor: railBackgroundColor }]}
          thumbIconStyles={enhancedSwipeStyles.thumbIconStyles}
          title={title}
          titleColor={titleColor}
          titleStyles={[ enhancedSwipeStyles.titleStyles, { color: titleColor }]}
          disabled={disabled || isLoading}
          disabledThumbIconBackgroundColor="#ccc"
          disabledRailBackgroundColor="#f0f0f0"
          shouldResetAfterSuccess={false}
          railFillBackgroundColor={railBorderColor}
          railFillBorderColor="transparent"
        />
      </Animated.View>
      {isLoading && <Text style={enhancedSwipeStyles.loadingText}>Processing...</Text>}
    </View>
  );
};


// =================================================================
// MAIN SCREEN COMPONENT
// =================================================================
const OrderTrackingScreen = ({route}) => {
  const {orderDetails, driverLocation} = route.params;
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();
  const [orderStatus, setOrderStatus] = useState(orderDetails.order_status);
  const [orderItems, setOrderItems] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = useRef([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const resetSwiper = () => {
    setResetKey(prev => prev + 1);
  };

  const openGoogleMaps = (latitude, longitude) => {
    const origin = `${driverLocation?.latitude},${driverLocation?.longitude}`;
    const destination = `${latitude},${longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    Linking.openURL(url);
  };
  
  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }

  const fetchOrders = async () => {
    try {
      const response = await ApiService.getOrderDetails(orderDetails.order_id);
      if (response?.status === 200) {
        setOrderItems(response.data);
      } else {
        Alert.alert('Error', response?.message || 'Failed to load order details.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpCancel = () => {
    setShowOtpModal(false);
    setOtp(['', '', '', '']);
    resetSwiper();
  };

  const handleOtpSubmit = () => {
    if (otp.join('').length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP.');
      return;
    }
    
    const correctOtp = orderStatus === 8 ? orderDetails.vendor_otp : orderDetails.customer_otp;

    if (otp.join('') === correctOtp) {
      if (orderStatus === 8) {
        submitVendorReceived();
      } else {
        completedOrder();
      }
      setOtp(['', '', '', '']);
    } else {
      Alert.alert('Error', 'Wrong OTP entered. Please try again.');
      resetSwiper();
    }
  };

  const completedOrder = async () => {
    try {
      const payload = { order_id: orderDetails.order_id, delivery_id: user.id, delivery_otp: otp.join('') };
      const response = await ApiService.completedorder(payload);
      if (response?.status === 200) {
        setShowOtpModal(false);
        setOrderStatus(3);
        Alert.alert('Success', 'Order completed successfully!');
        if (navigation.canGoBack()) navigation.goBack();
      } else {
        resetSwiper();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
      resetSwiper();
    }
  };

  const accepteSubmmited = () => {
    Alert.alert( 'Confirm Acceptance', 'Are you sure you want to accept this order?', [
        { text: 'Cancel', style: 'cancel', onPress: () => resetSwiper() },
        { text: 'Confirm', onPress: async () => {
            try {
              const payload = { deliveryarr: [user], id: user.id, order_status: 8, order_id: orderDetails.order_id };
              const response = await ApiService.acceptorders(payload);
              if (response?.status === 200) {
                route.params.handleAccept(orderDetails.order_id);
                setOrderStatus(8);
                Alert.alert('Success', 'Order accepted successfully');
              } else {
                resetSwiper();
                Alert.alert( 'Error', response?.message || 'Failed to accept order.');
              }
            } catch (error) {
              resetSwiper();
              Alert.alert('Error', error.message || 'Something went wrong.');
            }
          },
        },
      ],
    );
  };

  const handleVendorReceived = () => {
    setShowOtpModal(true);
  };
  
  const submitVendorReceived = async () => {
    try {
      const payload = { id: orderDetails.order_id };
      const response = await ApiService.vendorReceived(payload);
      if (response?.status === 200) {
        setOrderStatus(2);
        setShowOtpModal(false);
        Alert.alert('Success', 'Vendor pickup confirmed!');
      } else {
        Alert.alert('Error', response?.message || 'Failed to update order status.');
        resetSwiper();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
      resetSwiper();
    }
  };


  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order details not available</Text>
      </View>
    );
  }

  const getStatusText = () => {
    switch (orderStatus) {
      case 3: return 'Completed';
      case 2: return 'In Progress';
      case 8: return 'Accepted';
      default: return 'New Order';
    }
  };
  
  // Helper variable for checking payment type
  const isCOD = orderDetails?.payment_type === 'COD' || orderDetails?.payment_type === 'Cash on Delivery';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.orderDetailsHeader}>
            <View>
              <Text style={styles.orderId}>ID: {orderDetails.order_ids}</Text>
              <Text style={styles.orderDate}>{orderDetails?.order_date} - {orderDetails?.order_time}</Text>
            </View>
            <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
            </View>
        </View>

        <ProgressTracker status={orderStatus} />
        
        <InfoCard title="Payment & Earnings" iconName="wallet-outline">
            <DetailRow 
              iconName="card-outline"
              label="Payment Mode:" 
              value={orderDetails?.payment_type || 'N/A'}
            />
            {/* 👇 CHANGE 1: Display Delivery Charges */}
            <DetailRow
              iconName="bicycle-outline"
              label="Delivery Earnings:"
              value={`₹ ${orderDetails?.delivery_charge || '0.00'}`}
            />
            {/* 👇 CHANGE 2: Display "Amount to Collect" always for COD orders */}
            {isCOD && (
              <DetailRow 
                iconName="cash-outline"
                label="Amount to Collect:" 
                value={`₹ ${orderDetails?.grand_total || orderDetails?.total_amount}`}
              />
            )}
        </InfoCard>

        {/* 👇 CHANGE 3: Hide Restaurant and Customer details when order status is 3 */}
        {orderStatus !== 3 && (
            <>
                <InfoCard title="Restaurant Details" iconName="restaurant-outline">
                    <DetailRow 
                        iconName="business-outline"
                        label={orderDetails?.shop_name}
                    />
                    <DetailRow
                        iconName="call-outline"
                        label="Call Restaurant"
                        isLink
                        onPress={() => makePhoneCall(orderDetails.shop_phone_number || orderDetails?.franchise_mobile_number)}
                    />
                    <DetailRow
                        iconName="map-outline"
                        label="Get Directions"
                        isLink
                        onPress={() => openGoogleMaps(orderDetails?.shop_latitude, orderDetails?.shop_longitude)}
                    />
                </InfoCard>

                {(orderStatus === 8 || orderStatus === 2) && (
                  <InfoCard title="Customer Details" iconName="person-outline">
                      <DetailRow
                          iconName="person-circle-outline"
                          label={orderDetails.customer_name}
                      />
                      <DetailRow
                          iconName="call-outline"
                          label="Call Customer"
                          isLink
                          onPress={() => makePhoneCall(orderDetails.customer_mobile_number)}
                      />
                      <DetailRow
                          iconName="location-outline"
                          label={orderDetails?.delivery_address}
                      />
                      <DetailRow
                          iconName="map-outline"
                          label="Get Directions"
                          isLink
                          onPress={() => openGoogleMaps(orderDetails.order_latitude, orderDetails.order_longitude)}
                      />
                  </InfoCard>
                )}
            </>
        )}

        <InfoCard title="Order Items" iconName="list-outline">
          {orderItems?.orderitemdata?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image source={{uri: item.item_image}} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemQty}>Quantity: {item.sub_item_count}</Text>
              </View>
            </View>
          ))}
        </InfoCard>

      </ScrollView>

      {orderStatus !== 3 && (
        <View style={styles.buttonContainer}>
          {orderStatus === 1 && (
            <EnhancedSwipeButton
              onSwipeSuccess={accepteSubmmited}
              title="Accept Order"
              railBackgroundColor="#66bb6a"
              railBorderColor="#00A000"
              thumbIconName="checkmark-outline"
              resetKey={resetKey}
            />
          )}
          {orderStatus === 8 && (
            <EnhancedSwipeButton
              onSwipeSuccess={handleVendorReceived}
              title="Receive from Vendor"
              railBackgroundColor="#2196F3"
              railBorderColor="#0D47A1"
              thumbIconName="bag-outline"
              resetKey={resetKey}
            />
          )}
          {orderStatus === 2 && (
            <EnhancedSwipeButton
              onSwipeSuccess={() => setShowOtpModal(true)}
              title="Complete Delivery"
              railBackgroundColor="#FF9800"
              railBorderColor="#E65100"
              thumbIconName="flag-outline"
              resetKey={resetKey}
            />
          )}
        </View>
      )}

      {/* Enhanced OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={handleOtpCancel}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Icon name="shield-checkmark" size={30} color={theme.primary} />
                  <Text style={styles.modalTitle}>Enter OTP</Text>
                  <Text style={styles.modalSubtitle}>
                    {orderStatus === 8 ? 'Enter Vendor OTP' : 'Enter Customer OTP'}
                  </Text>
                </View>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                      value={digit}
                      onChangeText={value => handleOtpChange(index, value)}
                      maxLength={1}
                      keyboardType="numeric"
                      ref={ref => (otpInputs.current[index] = ref)}
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
                          otpInputs.current[index - 1].focus();
                        }
                      }}
                    />
                  ))}
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={handleOtpSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Verify OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleOtpCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// =================================================================
// STYLESHEETS
// =================================================================

// Enhanced SwipeButton Styles (Preserved)
const enhancedSwipeStyles = StyleSheet.create({
  container: { alignItems: 'center', width:"100%"},
  swipeButtonWrapper: { borderRadius: 35, overflow: 'hidden', width:"100%" },
  thumbContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)', overflow: 'hidden' },
  defaultThumb: { width: '100%', height: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  successThumb: { width: '100%', height: '100%', borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  shimmerOverlay: { position: 'absolute', top: 0, left: -20, width: 15, height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', transform: [{ skewX: '-20deg' }] },
  pulseRing: { position: 'absolute', width: '80%', height: '80%', borderWidth: 2, borderRadius: 30 },
  loadingText: { marginTop: 8, fontSize: 12, color: theme.primary, textAlign: 'center', fontWeight: '600' },
});

// Main Component Styles
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.background},
  scrollContent: { paddingBottom: 100, padding: wp(4) },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, padding: wp(4), paddingTop: hp(6) },
  headerTitle: { marginLeft: 15, fontSize: hp(2.5), color: '#fff', fontWeight: '500' },
  
  // Order Details Header
  orderDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(2) },
  orderId: { fontSize: hp(2.2), fontWeight: 'bold', color: theme.text },
  orderDate: { fontSize: hp(1.8), color: theme.lightText, marginTop: 4 },
  statusBadge: { backgroundColor: theme.lightPrimary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusBadgeText: { color: theme.primary, fontWeight: 'bold' },

  // InfoCard Component Styles
  infoCardContainer: { backgroundColor: theme.cardBackground, borderRadius: 12, borderWidth: 1, borderColor: theme.borderColor, marginBottom: hp(2), overflow: 'hidden' },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: theme.borderColor, backgroundColor: '#fff' },
  infoCardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginLeft: 10 },
  infoCardContent: { padding: 15, gap: 10 },

  // DetailRow Component Styles
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  detailRowIcon: { marginRight: 15 },
  detailRowLabel: { fontSize: 14, color: theme.text, flex: 1 },
  detailRowValue: { fontSize: 14, fontWeight: 'bold', color: theme.text },
  linkText: { color: theme.primary, textDecorationLine: 'underline' },

  // ProgressTracker Component Styles
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.cardBackground, borderRadius: 12, marginBottom: hp(2) },
  progressStepWrapper: { alignItems: 'center' },
  progressStep: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  progressStepActive: { backgroundColor: theme.lightPrimary },
  progressText: { marginTop: 5, fontSize: 12 },
  progressLine: { flex: 1, height: 2, backgroundColor: '#eee' },
  progressLineActive: { backgroundColor: theme.primary },
  
  // Item Row Styles
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.borderColor },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: theme.text },
  itemQty: { fontSize: 13, color: theme.lightText, marginTop: 4 },

  // Button Container
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: wp(4), backgroundColor: theme.background, borderTopWidth: 1, borderTopColor: theme.borderColor },
  
  // Modal Styles (Enhanced)
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: theme.primary, marginTop: 10 },
  modalSubtitle: { fontSize: 14, color: theme.lightText, marginTop: 5 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25, gap: 12 },
  otpInput: { width: 55, height: 55, borderWidth: 2, borderColor: theme.borderColor, textAlign: 'center', fontSize: 20, borderRadius: 12, color: theme.text, backgroundColor: '#f8f9fa', fontWeight: 'bold' },
  otpInputFilled: { borderColor: theme.primary, backgroundColor: theme.lightPrimary, transform: [{ scale: 1.05 }] },
  modalButtons: { flexDirection: 'column', gap: 12, width: '100%' },
  submitButton: { backgroundColor: theme.primary, paddingVertical: 15, borderRadius: 25, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cancelButton: { backgroundColor: 'transparent', paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  cancelButtonText: { color: theme.lightText, fontSize: 14, fontWeight: '600' },
  
  errorText: { fontSize: 18, color: '#ff0000', textAlign: 'center', marginTop: 50 },
});

export default OrderTrackingScreen;