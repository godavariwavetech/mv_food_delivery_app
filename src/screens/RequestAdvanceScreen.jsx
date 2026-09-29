import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {scale, moderateScale, verticalScale} from 'react-native-size-matters';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import CustomAlert from '../components/CustomAlert';

const PRIMARY_GREEN = '#28A745';
const TEXT_DARK = '#212529';
const TEXT_GREY = '#6C757D';
const BACKGROUND = '#F8F9FA';

const REASONS = ['Petrol', 'Personal Use', 'Vehicle Repair', 'Other'];

const RequestAdvanceScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleSubmit = () => {
    if (!amount) return;
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_GREEN} barStyle="light-content" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Request Advance</Text>
        <View style={styles.navButton} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formCard}>
          {/* Amount */}
          <Text style={styles.label}>
            Enter Amount <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#B0B6BB"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Reason */}
          <Text style={styles.label}>
            Reason (Optional) <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setReasonModalVisible(true)}>
            <Text
              style={[
                styles.dropdownText,
                !reason && {color: '#B0B6BB'},
              ]}>
              {reason || 'Select a reason'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={TEXT_GREY} />
          </TouchableOpacity>

          {/* Note */}
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Bike petrol kosam kavali"
            placeholderTextColor="#B0B6BB"
            value={note}
            onChangeText={setNote}
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, !amount && styles.submitButtonDisabled]}
            disabled={!amount}
            onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Request Advance</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Reason Picker Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={reasonModalVisible}
        onRequestClose={() => setReasonModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReasonModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Reason</Text>
            <FlatList
              data={REASONS}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setReason(item);
                    setReasonModalVisible(false);
                  }}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {reason === item ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={PRIMARY_GREEN}
                    />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        message="Your advance request has been submitted for approval."
        onClose={() => {
          setAlertVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(14),
    paddingHorizontal: wp(5),
    backgroundColor: PRIMARY_GREEN,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 10,
  },
  navTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  navButton: {
    width: 40,
    alignItems: 'flex-start',
  },

  formCard: {
    margin: moderateScale(16),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: moderateScale(18),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: scale(13),
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(14),
  },
  required: {
    color: '#FF3B30',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    borderRadius: 10,
    paddingHorizontal: moderateScale(14),
  },
  rupeeSymbol: {
    fontSize: scale(16),
    color: TEXT_DARK,
    fontWeight: '600',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: scale(16),
    color: TEXT_DARK,
    paddingVertical: verticalScale(12),
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    borderRadius: 10,
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(13),
  },
  dropdownText: {
    fontSize: scale(14),
    color: TEXT_DARK,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E2E5E8',
    borderRadius: 10,
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(12),
    fontSize: scale(14),
    color: TEXT_DARK,
    minHeight: verticalScale(70),
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: scale(15),
    fontWeight: '700',
  },

  // Reason modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(16),
    paddingBottom: verticalScale(30),
  },
  modalTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: verticalScale(10),
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: scale(14),
    color: TEXT_DARK,
  },
});

export default RequestAdvanceScreen;
