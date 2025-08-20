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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MeterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {scale, moderateScale} from 'react-native-size-matters';
import commonstyles from '../commonstyles/commonstyles';
import ApiService from '../services/apiservice';
const {width, height} = Dimensions.get('window');
import {AuthContext} from '../context/AuthContext';
// import Toast from 'react-native-toast-message';

// import Icon from 'react-native-vector-icons/MaterialIcons';

// const openGoogleMaps = location => {
//   const updatedURL = 'https://www.google.com/maps/dir/?api=1&origin=17.0005,81.8040&destination=16.7625,81.8423,&travelmode=driving';
//   Linking.openURL(updatedURL);
// };

const formatDate = (dateString) => {
  console.log(dateString,"++++++++++++++DATA")
  // return
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",   
    year: "numeric", 
  }).format(date);
};

const OrderTrackingScreen = ({route}) => {
  const {orderDetails, driverLocation, status} = route.params;
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();

  console.log(orderDetails, 'orders', driverLocation, 'dl');

  // Local orderStatus to manage updates in the UI.
  // Initial orderStatus is taken from orderDetails.
  const [orderStatus, setOrderStatus] = useState(orderDetails.order_status);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState(null);

  useEffect(() => {
    console.log(orderDetails, 'orderDetails');
    console.log(driverLocation, 'ordelocation');
    fetchOrders();
  }, []);

  const openGoogleMapsForShop = (shopLatitude, shopLongitude) => {
    console.log(shopLatitude, shopLongitude, 'shopLatitude,shopLongitude');
    console.log(
      driverLocation?.latitude,
      driverLocation?.longitude,
      'orderDetails.delivery',
    );

    const deliveryBoyLattitude = driverLocation?.latitude;
    const deliveryBoyLongitude = driverLocation?.longitude;
    // const updatedURL = 'https://www.google.com/maps/dir/?api=1&origin=17.0005,81.8040&destination=16.7625,81.8423,&travelmode=driving';
    const updatedURL = `https://www.google.com/maps/dir/?api=1&origin=${deliveryBoyLattitude},${deliveryBoyLongitude}&destination=${shopLatitude},${shopLongitude},&travelmode=driving`;
    Linking.openURL(updatedURL);
  };
  const openGoogleMapsForCustomer = (customerLatitude, customerLongitude) => {
    console.log(
      driverLocation?.latitude,
      driverLocation?.longitude,
      'orderDetails.delivery',
    );
    const deliveryBoyLattitude = driverLocation?.latitude;
    const deliveryBoyLongitude = driverLocation?.longitude;
    console.log(
      customerLatitude,
      customerLongitude,
      'customerLatitude,customerLongitude',
    );
    // console.log(orderDetails.shop_latitude, orderDetails.shop_longitude,'shopLatitude,shopLongitude');
    // const updatedURL = 'https://www.google.com/maps/dir/?api=1&origin=17.0005,81.8040&destination=16.7625,81.8423,&travelmode=driving';
    const updatedURL = `https://www.google.com/maps/dir/?api=1&origin=${deliveryBoyLattitude},${deliveryBoyLongitude}&destination=${customerLatitude},${customerLongitude},&travelmode=driving`;
    Linking.openURL(updatedURL);
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchOrders = async () => {
    try {
      const response = await ApiService.getOrderDetails(orderDetails.id);
      console.log(response,"++++++++++++++++++Responsseeeeee")
      if (response?.status === 200) {
        console.log('orderdetails', response.data);
        setOrderItems(response.data);
      } else {
        Alert.alert('Error', response?.message || 'Failed to load orders.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order details not available</Text>
      </View>
    );
  }

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Complete order: updates status to 3 upon successful OTP verification
  const completedOrder = async () => {
    const payload = {
      order_id: orderDetails.order_id,
      delivery_id: user.id,
      delivery_otp: otp.join(''),
    };
    try {
      const response = await ApiService.completedorder(payload);
      if (response?.status === 200) {
        setIsCompleted(true);
        setShowOtpModal(false);
        setOrderStatus(3);
        // Alert.alert("Success", "Order completed successfully");
        // Toast.show({
        //   type: 'success',
        //   text1: 'Order Completed',
        //   text2: 'Order completed successfully ✅',
        //   position: 'top',
        //   visibilityTime: 2000,
        // });
      } else {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Error',
        //   text2: response?.message || 'Failed to complete order.',
        //   position: 'top',
        //   visibilityTime: 2000,
        // });
        // Alert.alert("Error", response?.message || "Failed to complete order.");
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn('No screen to go back to');
      navigation.popToTop();
    }
  };

  const handleOtpSubmit = () => {
    // if (otp.join('').length === 4 && orderDetails.customer_otp === otp.join('')) {
    // completedOrder();
    if (
      otp.join('').length === 4 &&
      (orderStatus === 8
        ? orderDetails.vendor_otp === otp.join('')
        : orderDetails.customer_otp === otp.join(''))
    ) {
      orderStatus === 8 ? submitVendorReceived() : completedOrder();
      setOtp(['', '', '', '']);
    } else {
      Alert.alert('Wrong OTP entered');
    }
  };

  // Accept order: updates status to 8
  const accepteSubmmited = async () => {
    Alert.alert(
      'Confirm Acceptance',
      'Are you sure you want to accept this order?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            const payload = {
              deliveryarr: [user],
              id: user.id,
              order_status: 8, // update order status to 8
              order_id: orderDetails.order_id,
            };

            console.log(payload, '+++++++++++++++++++++++>>>>>>>>>>>>>PAYLOAD');

            try {
              const response = await ApiService.acceptorders(payload);
              if (response?.status === 200) {
                // Notify parent component if needed:
                route.params.handleAccept(orderDetails.order_id);
                setOrderStatus(8);
                Alert.alert('Success', 'Order accepted successfully');
              } else {
                Alert.alert(
                  'Error',
                  response?.message || 'Failed to accept order.',
                );
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Something went wrong.');
            }
          },
        },
      ],
    );
  };

  // Received from Vendor: updates status to 2
  // const handleVendorReceived = async () => {
  //   const payload = {
  //     id: orderDetails.id,
  //   };
  //   try {
  //     const response = await ApiService.vendorReceived(payload);
  //     if (response?.status === 200) {
  //       setOrderStatus(2);
  //       Alert.alert("Success", "Order received from vendor successfully");
  //     } else {
  //       Alert.alert("Error", response?.message || "Failed to update order status.");
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", error.message || "Something went wrong.");
  //   }
  // };

  // Received from Vendor: updates status to 2
  const handleVendorReceived = async () => {
    setShowOtpModal(true);
    // otpInputs.current[0]?.focus(); // Optional: Focus first input
  };
  const submitVendorReceived = async () => {
    const payload = {
      // id: orderDetails.id,
      id: orderDetails.order_id,
    };
    console.log(orderDetails.order_id, 'id');
    try {
      const response = await ApiService.vendorReceived(payload);
      console.log(response, 'response-Vendor');
      if (response?.status === 200) {
        setOrderStatus(2);
        setShowOtpModal(false);
        //Alert.alert("Success", "Order received from vendor successfully");
        // Toast.show({
        //   type: 'success',
        //   text1: '✅ Vendor Order Received',
        //   text2: 'You have successfully received the order.',
        //   position: 'top',
        //   visibilityTime: 2000,
        // });
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Failed to update order status.',
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  console.log(
    orderDetails,
    '+++++++++++++++orderItems?.orderdata[0].payment_type',
    orderStatus,
    orderItems
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={'transparent'}
        translucent
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        {/* <Icon name="location-sharp" size={24} color="#333" /> */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.orderDetails}>
          <View style={{flexDirection: 'row', gap: 5}}>
            <View style={{flexDirection: 'column', gap: 4}}>
              <Text style={styles.orderNumber}>
                <Text style={{color: '#faa819', fontWeight: 'bold'}}>
                  OrderId: {}{' '}
                </Text>
                {orderDetails.order_ids}
              </Text>
              <Text style={styles.orderDate}>
                {formatDate(orderDetails?.order_date)} - {orderDetails?.order_time}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.newOrder}>
              {orderStatus === 3
                ? 'Completed'
                : orderStatus === 2
                ? 'In Progress'
                : orderStatus === 8
                ? 'Accepted'
                : 'New Order'}{' '}
            </Text>
            {/* <Text>{orderDetails.customer_otp}</Text> */}
          </View>
        </View>

        <View style={styles.paymentCard}>
          <View>
            <Text style={styles.paymentTitle}>Payment Details</Text>
          </View>
          <View style={styles.paymentRow}>
            <View style={{flexDirection: 'row', gap: 2, alignItems: 'center'}}>
              <Text style={styles.paymentText}>Payment Mode:</Text>
              <Text style={styles.boldText}>
                {orderDetails?.payment_type || 'COD'}{' '}
              </Text>
            </View>
            {/* <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
            <Text style={styles.paymentText}>Grand Total:</Text>
            <Text style={styles.boldText}> ₹{orderDetails.grand_total || orderDetails?.total_amount}</Text>
          </View> */}

            {/* Amount shows only when payment type is COD  and  status==2*/}
            {orderDetails?.payment_type === 'COD' &&
              // orderStatus == 'Cash on Delivery' &&
             ( orderStatus === 2 || orderStatus ===3 )&& (
                <View
                  style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                  <Text style={styles.paymentText}>Grand Total:</Text>
                  <Text style={styles.boldText}>
                    {' '}
                    ₹{orderDetails?.grand_total || orderDetails?.total_amount}
                  </Text>
                </View>
              )}
          </View>
        </View>

        {orderStatus === 0 || orderStatus === 1 || orderStatus === 8 ? (
          <View style={styles.restaurantInfo}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() =>
                  openGoogleMapsForShop(
                    orderDetails?.shop_latitude,
                    orderDetails?.shop_longitude,
                  )
                }>
                <View
                  style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                  <Icon name="location-outline" size={18} color="#faa819" />
                  <Text style={styles.restaurantName}>
                    {orderDetails?.shop_name}
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                <Icon name="call-outline" size={20} color="#faa819" />
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `tel:${
                        orderDetails.shop_phone_number
                          ? orderDetails.shop_phone_number
                          : orderDetails?.franchise_mobile_number
                      }`,
                    )
                  }>
                  <Text style={styles.phone}>
                    {orderDetails?.shop_phone_number
                      ? orderDetails?.shop_phone_number
                      : orderDetails?.franchise_mobile_number}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                openGoogleMapsForShop(
                  orderDetails?.order_latitude,
                  orderDetails?.order_longitude,
                )
              }>
              <View
                style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                <FontAwesome name="location-arrow" size={18} color="#faa819" />
                <Text style={styles.address}>
                  {orderDetails?.delivery_address}
                </Text>
              </View>
              <View style={styles.mapIndication}>
                <FontAwesome name="map-marker" size={14} color="#faa819" />
                <Text style={styles.mapIndicationText}>
                  Tap to open in Google Maps
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {orderStatus === 3  || orderStatus === 2 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.headerContainer}>
              <Icon
                name="person"
                size={22}
                color="#faa819"
                style={styles.icon}
              />
              <Text style={styles.sectionHeader}>Customer Details</Text>
            </View>
            {orderDetails?.customer_name && (
              <Text style={styles.detailText}>
                👤 {orderDetails.customer_name}
              </Text>
            )}
            {orderDetails?.customer_mobile_number && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${orderDetails.customer_mobile_number}`)
                }>
                <Text style={styles.linkText}>
                  📞 {orderDetails?.customer_mobile_number}
                </Text>
              </TouchableOpacity>
            )}
            {orderDetails?.delivery_address && (
              // <Text style={styles.detailText}>📍 {orderDetails.delivery_address}</Text>
              <TouchableOpacity
                onPress={() =>
                  openGoogleMapsForCustomer(
                    orderDetails.order_latitude,
                    orderDetails.order_longitude,
                  )
                }>
                <Text style={[styles.detailText, {marginTop: 4}]}>
                  📍 {orderDetails?.delivery_address}
                </Text>
                <View style={styles.mapIndication}>
                  <FontAwesome name="map-marker" size={14} color="#faa819" />
                  <Text style={styles.mapIndicationText}>
                    Tap to open in Google Maps
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
        {/* 
 <View style={styles.mapIndication}>
  <FontAwesome name="map-marker" size={14} color="#faa819" />
  <Text style={styles.mapIndicationText}>Tap to open in Google Maps</Text>
</View> */}

        <View style={styles.trackingSection}>
          <View style={styles.statusItem}>
            <Icon
              name="checkmark-circle"
              size={24}
              color="#faa819" // Always #faa819
            />
            <Text style={styles.t1}>New Order</Text>
          </View>

          <View style={styles.statusItem}>
            <Icon
              name="bicycle"
              size={24}
              color={
                orderStatus === 8 ||
                orderStatus === 3 ||
                isCompleted ||
                orderStatus === 2
                  ? '#faa819'
                  : 'gray'
              }
            />
            <Text style={styles.t1}>Accepted</Text>
          </View>

          <View style={styles.statusItem}>
            <Icon
              name="location"
              size={24}
              color={orderStatus === 3 || isCompleted ? '#faa819' : 'gray'}
            />
            <Text style={styles.t1}>Delivered</Text>
          </View>
        </View>

        <View>
          {orderItems?.orderitemdata.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Image
                  source={{uri: item.item_image}}
                  style={styles.dishImage}
                />
                <View style={{flexDirection: 'column', gap: 5}}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <Text style={styles.t1}>Qty: {item.sub_item_count}</Text>
                </View>
              </View>
              <View>
                {/* <Text style={styles.itemPrice}>Rs. {item.item_total_amount}</Text> */}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {orderStatus === 1 ? (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={accepteSubmmited}>
              <Text style={styles.buttonTextAccept}>Accept</Text>
            </TouchableOpacity>
          ) : orderStatus === 8 ? (
            <TouchableOpacity
              style={styles.vendorButton}
              onPress={handleVendorReceived}>
              <Text style={styles.buttonTextAccept}>Received from Vendor</Text>
            </TouchableOpacity>
          ) : orderStatus === 2 ? (
            <TouchableOpacity
              style={[
                {width: '50%', alignSelf: 'center'},
                styles.completeButton,
              ]}
              onPress={handleVendorReceived}>
              <Text style={styles.buttonTextAccept}>Complete</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Customer Details Section */}

        {/* {orderStatus === 3 || isCompleted || orderStatus === 2  ? (
        <View style={styles.sectionContainer}>
          <View style={styles.headerContainer}>
            <Icon name="person" size={22} color="#faa819" style={styles.icon} />
            <Text style={styles.sectionHeader}>Customer Details</Text>
          </View>
          {orderDetails?.customer_name && (
            <Text style={styles.detailText}>👤 {orderDetails.customer_name}</Text>
          )}
          {orderDetails?.customer_mobile_number && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${orderDetails.customer_mobile_number}`)}>
              <Text style={styles.linkText}>📞 {orderDetails?.customer_mobile_number}</Text>
            </TouchableOpacity>
          )}
          {orderDetails?.delivery_address && (
            // <Text style={styles.detailText}>📍 {orderDetails.delivery_address}</Text>
            <TouchableOpacity onPress={() => openGoogleMapsForCustomer(orderDetails.order_latitude, orderDetails.order_longitude)}>
              <Text style={[styles.detailText,{marginTop:4}]} >📍   {orderDetails?.delivery_address}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null} */}

        {/* Franchise Details Section */}
        {/* {orderStatus === 8 || orderStatus === 3 || isCompleted || orderStatus === 2  ? (
        <View style={styles.sectionContainer}>
          <View style={styles.headerContainer}>
            <MeterialIcon name="store" size={22} color="#faa819" style={styles.icon} />
            <Text style={styles.sectionHeader}>Franchise Details</Text>
          </View>
          {orderItems?.orderdata[0]?.franchise_name && (
            <Text style={styles.detailText}>🏪 {orderItems.orderdata[0].franchise_name}</Text>
          )}
          {orderDetails?.franchise_location && (
            <Text style={styles.detailText}>📍 {orderDetails.franchise_location}</Text>
          )}
          {orderItems?.orderdata[0]?.franchise_mobile_number && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${orderItems.orderdata[0].franchise_mobile_number}`)}>
              <Text style={styles.linkText}>📞 {orderItems.orderdata[0].franchise_mobile_number}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null} */}

        {/* OTP Modal */}
        <Modal visible={showOtpModal} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setShowOtpModal(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Enter OTP</Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={value => handleOtpChange(index, value)}
                        maxLength={1}
                        keyboardType="numeric"
                        ref={ref => (otpInputs.current[index] = ref)}
                        onKeyPress={({nativeEvent}) => {
                          //is for moving to previous input when backspace is pressed
                          if (
                            nativeEvent.key === 'Backspace' &&
                            otp[index] === '' &&
                            index > 0
                          ) {
                            otpInputs.current[index - 1].focus();
                          }
                        }}
                      />
                    ))}
                  </View>
                  <TouchableOpacity
                    onPress={handleOtpSubmit}
                    style={styles.okButton}>
                    <Text style={styles.okButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#faa819',
    padding: hp(2),
    paddingTop: hp(8),
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: hp(2.5),
    color: '#fff',
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  orderDetails: {
    padding: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderNumber: {fontSize: hp(2.2), fontWeight: '400', color: '#000'},
  orderDate: {color: 'gray', marginTop: 4},
  newOrder: {
    color: '#faa819',
    fontWeight: 'bold',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  paymentCard: {
    backgroundColor: '#F8F8F8',
    padding: hp(2),
    margin: hp(1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'space-between',
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000',
    alignSelf: 'center',
  },
  paymentRow: {flexDirection: 'row', justifyContent: 'space-around', gap: 15},
  paymentText: {fontSize: hp(2), color: '#000'},
  boldText: {fontWeight: 'bold', color: '#000'},
  restaurantInfo: {
    padding: hp(2),
    flexDirection: 'column',
    gap: 15,
    paddingBottom: 5,
  },
  restaurantName: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: '#000',
    width: '60%',
  },
  phone: {color: '#faa819', marginTop: 4},
  address: {marginTop: 4, color: 'black'},
  trackingSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: hp(2),
    backgroundColor: '#F8F8F8',
    margin: hp(1),
    borderRadius: 10,
  },
  statusItem: {alignItems: 'center', flexDirection: 'column', gap: 5},
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: hp(2),
    backgroundColor: '#F8F8F8',
    margin: hp(1),
    borderRadius: 10,
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  t1: {color: 'gray'},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp(4),
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderColor: '#E65100',
    borderWidth: 2,
    paddingVertical: hp(1.8),
    borderRadius: 30,
    alignItems: 'center',
    marginRight: wp(2),
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#66bb6a',
    borderColor: '#00A000',
    borderWidth: 2,
    paddingVertical: hp(1.8),
    borderRadius: 30,
    alignItems: 'center',
    marginLeft: wp(2),
  },
  vendorButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderColor: '#0D47A1',
    borderWidth: 2,
    paddingVertical: hp(1.8),
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: wp(2),
  },
  buttonTextAccept: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  otpInput: {
    width: width * 0.1,
    height: width * 0.1,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: width * 0.03,
    marginHorizontal: width * 0.02,
    borderRadius: 5,
    color: '#000',
  },
  okButton: {
    backgroundColor: '#faa819',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: 5,
  },
  okButtonText: {
    color: 'white',
    fontSize: width * 0.045,
  },
  sectionContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    // marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
    marginHorizontal: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: "#A5D6A7", // Light #faa819
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Dark #faa819 Text
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  linkText: {
    fontSize: 14,
    // color: "#388E3C", // Medium #faa819 for Links
    fontWeight: 'bold',
    marginBottom: 5,
  },

  mapIndication: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 6,
    marginBottom: 10,
    // marginLeft:20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fcebea',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  mapIndicationText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#faa819',
    fontStyle: 'italic',
  },
});

export default OrderTrackingScreen;
