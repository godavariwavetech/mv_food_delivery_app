import React, {useCallback, useContext, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {scale, moderateScale, verticalScale} from 'react-native-size-matters';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import ApiService from '../services/apiservice';
import {AuthContext} from '../context/AuthContext';

const PRIMARY_GREEN = '#28A745';
const DANGER_RED = '#FF3B30';
const WARNING_ORANGE = '#FF9500';
const INFO_BLUE = '#007AFF';
const TEXT_DARK = '#212529';
const TEXT_GREY = '#6C757D';
const BACKGROUND = '#F8F9FA';

// balance_after_approval tracks what's still owed on the request (starts
// equal to amount, decreases as payment_history entries are added), so the
// paid/partial/unpaid status is derived from it rather than request_status,
// which does not reliably map to the admin dashboard's Not Paid / Partially
// Paid / Paid labels.
const statusInfo = (amount, remaining) => {
  const total = Number(amount || 0);
  const left =
    remaining === null || remaining === undefined ? total : Number(remaining);
  if (left <= 0) return {label: 'Paid', color: PRIMARY_GREEN};
  if (left < total) return {label: 'Partially Paid', color: WARNING_ORANGE};
  return {label: 'Not Paid', color: DANGER_RED};
};

const formatAmount = value =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Server timestamps arrive as UTC (e.g. "...T10:27:32.000Z"); rendering them
// raw showed the wrong time. Date() converts to the device's local timezone,
// so format from that instead of printing the string as-is.
const formatDateTime = dateStr => {
  if (!dateStr) return '';
  const d = new Date(String(dateStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
};

const formatDateOnly = date => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${
    MONTHS[d.getMonth()]
  } ${d.getFullYear()}`;
};

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const normalizeAdvance = item => ({
  id: `advance-${item.id}`,
  type: 'advance',
  title: 'Advance Taken',
  subtitle: item.reason || item.purpose || 'Advance Request',
  note: item.note || '',
  date: item.requested_date || item.created_at || '',
  amount: item.amount,
  sign: '+',
  adminRemarks: item.admin_remarks || '',
  reviewedDate: item.reviewed_date || '',
  balanceAfterApproval: item.balance_after_approval,
});

// advance_request_t.payment_history is a JSON array of repayments logged
// against the request (shown in the admin dashboard's "Payment History"
// modal as Date / Amount Paid / Remaining After / Remarks) — surface each
// entry as its own history card so paid-back amounts are visible here too.
const parsePaymentHistory = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const normalizePayments = item =>
  parsePaymentHistory(item.payment_history).map((payment, index) => ({
    id: `payment-${item.id}-${index}`,
    type: 'payment',
    title: 'Advance Repaid',
    subtitle: payment.remarks || payment.remark || item.reason || 'Repayment',
    date: payment.date || payment.paid_date || payment.paid_on || '',
    amount:
      payment.amount_paid ?? payment.paid_amount ?? payment.amount ?? 0,
    sign: '-',
    balanceAfterApproval:
      payment.remaining_after ?? payment.balance_after ?? payment.remaining,
  }));

const ADVANCE_ICON = {name: 'wallet-outline', color: PRIMARY_GREEN, bg: '#E8F5EA'};
const PAYMENT_ICON = {
  name: 'cash-refund',
  color: INFO_BLUE,
  bg: '#E6F1FF',
};

const PendingAmountHistoryScreen = () => {
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState({from: null, to: null});
  const [draftFrom, setDraftFrom] = useState(null);
  const [draftTo, setDraftTo] = useState(null);
  const [pickerMode, setPickerMode] = useState(null); // 'from' | 'to' | null

  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const advanceResponse = await ApiService.getAdvanceRequestsForDeliveryBoy(
        user?.id,
      );

      const requests = Array.isArray(advanceResponse) ? advanceResponse : [];
      const advances = requests.map(normalizeAdvance);
      const payments = requests.flatMap(normalizePayments);

      const combined = [...advances, ...payments].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      setHistoryData(combined);
    } catch (error) {
      console.error('Error fetching pending amount history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredData = useMemo(() => {
    if (!appliedFilter.from && !appliedFilter.to) return historyData;
    return historyData.filter(entry => {
      const d = new Date(String(entry.date).replace(' ', 'T'));
      if (isNaN(d.getTime())) return false;
      if (appliedFilter.from && d < startOfDay(appliedFilter.from)) return false;
      if (appliedFilter.to && d > endOfDay(appliedFilter.to)) return false;
      return true;
    });
  }, [historyData, appliedFilter]);

  const isFilterActive = Boolean(appliedFilter.from || appliedFilter.to);

  const openFilter = () => {
    setDraftFrom(appliedFilter.from);
    setDraftTo(appliedFilter.to);
    setFilterVisible(true);
  };

  const applyFilter = () => {
    setAppliedFilter({from: draftFrom, to: draftTo});
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setDraftFrom(null);
    setDraftTo(null);
    setAppliedFilter({from: null, to: null});
    setFilterVisible(false);
  };

  const onPickerChange = (event, selectedDate) => {
    const mode = pickerMode;
    setPickerMode(null);
    if (event.type === 'dismissed' || !selectedDate) return;
    if (mode === 'from') setDraftFrom(selectedDate);
    if (mode === 'to') setDraftTo(selectedDate);
  };

  const renderItem = ({item}) => {
    const isAdvance = item.type === 'advance';
    const status = isAdvance
      ? statusInfo(item.amount, item.balanceAfterApproval)
      : null;
    const balanceToShow = item.balanceAfterApproval;
    const icon = isAdvance ? ADVANCE_ICON : PAYMENT_ICON;

    return (
      <View style={styles.card}>
        <View style={[styles.iconCircle, {backgroundColor: icon.bg}]}>
          <MaterialCommunityIcons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {status ? (
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: `${status.color}1A`},
                ]}>
                <Text style={[styles.statusBadgeText, {color: status.color}]}>
                  {status.label}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          {item.note ? <Text style={styles.cardNote}>{item.note}</Text> : null}
          {item.adminRemarks ? (
            <Text style={styles.cardNote}>Remarks: {item.adminRemarks}</Text>
          ) : null}
          <Text style={styles.cardDate}>
            {formatDateTime(item.date)}
            {item.reviewedDate
              ? `  ·  Reviewed: ${formatDateTime(item.reviewedDate)}`
              : ''}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text
            style={[
              styles.cardAmount,
              {color: isAdvance ? TEXT_DARK : PRIMARY_GREEN},
            ]}>
            {item.sign} ₹{formatAmount(item.amount)}
          </Text>
          {balanceToShow !== undefined && balanceToShow !== null ? (
            <Text style={styles.cardBalance}>
              Balance : ₹{formatAmount(balanceToShow)}
            </Text>
          ) : null}
        </View>
      </View>
    );
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
        <Text style={styles.navTitle}>Pending Amount History</Text>
        <TouchableOpacity style={styles.navButton} onPress={openFilter}>
          <View>
            <Ionicons name="filter" size={20} color="#fff" />
            {isFilterActive ? <View style={styles.filterDot} /> : null}
          </View>
        </TouchableOpacity>
      </View>

      {isFilterActive ? (
        <View style={styles.filterChipRow}>
          <MaterialCommunityIcons
            name="calendar-range"
            size={14}
            color={PRIMARY_GREEN}
          />
          <Text style={styles.filterChipText}>
            {appliedFilter.from ? formatDateOnly(appliedFilter.from) : 'Any'}
            {'  -  '}
            {appliedFilter.to ? formatDateOnly(appliedFilter.to) : 'Any'}
          </Text>
          <TouchableOpacity onPress={clearFilter}>
            <Ionicons name="close-circle" size={16} color={TEXT_GREY} />
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_GREEN]}
              tintColor={PRIMARY_GREEN}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={60}
                color="#CFD8DC"
              />
              <Text style={styles.emptyText}>
                {isFilterActive
                  ? 'No transactions in this date range'
                  : 'No transactions yet'}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        transparent
        animationType="fade"
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalSheet}
            onPress={() => {}}>
            <Text style={styles.modalTitle}>Filter by Date</Text>

            <Text style={styles.filterLabel}>From</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setPickerMode('from')}>
              <Text style={styles.dateInputText}>
                {draftFrom ? formatDateOnly(draftFrom) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={TEXT_GREY} />
            </TouchableOpacity>

            <Text style={styles.filterLabel}>To</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setPickerMode('to')}>
              <Text style={styles.dateInputText}>
                {draftTo ? formatDateOnly(draftTo) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={TEXT_GREY} />
            </TouchableOpacity>

            <View style={styles.filterActionsRow}>
              <TouchableOpacity
                style={styles.filterClearButton}
                onPress={clearFilter}>
                <Text style={styles.filterClearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={applyFilter}>
                <Text style={styles.filterApplyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {pickerMode ? (
        <DateTimePicker
          value={(pickerMode === 'from' ? draftFrom : draftTo) || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onPickerChange}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: scale(15),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  navButton: {
    width: 30,
    alignItems: 'flex-end',
  },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFEB3B',
  },

  // Active filter chip
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EA',
    marginHorizontal: moderateScale(16),
    marginTop: verticalScale(12),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: scale(11),
    color: TEXT_DARK,
    fontWeight: '600',
    marginHorizontal: 6,
  },

  // Filter modal
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
    marginBottom: verticalScale(14),
  },
  filterLabel: {
    fontSize: scale(12),
    fontWeight: '600',
    color: TEXT_GREY,
    marginBottom: verticalScale(6),
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E5E8',
    borderRadius: 10,
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(14),
  },
  dateInputText: {
    fontSize: scale(14),
    color: TEXT_DARK,
  },
  filterActionsRow: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
  },
  filterClearButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    marginRight: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E2E5E8',
  },
  filterClearButtonText: {
    color: TEXT_GREY,
    fontSize: scale(14),
    fontWeight: '700',
  },
  filterApplyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    backgroundColor: PRIMARY_GREEN,
  },
  filterApplyButtonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '700',
  },

  listContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(30),
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: moderateScale(14),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: TEXT_DARK,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: scale(9.5),
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: scale(11.5),
    color: TEXT_GREY,
    marginTop: 2,
  },
  cardNote: {
    fontSize: scale(10.5),
    color: TEXT_GREY,
    marginTop: 2,
    fontStyle: 'italic',
  },
  cardDate: {
    fontSize: scale(10.5),
    color: '#A0A6AB',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: scale(13.5),
    fontWeight: '700',
  },
  cardBalance: {
    fontSize: scale(10.5),
    color: TEXT_GREY,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(60),
    opacity: 0.6,
  },
  emptyText: {
    marginTop: verticalScale(12),
    color: '#999',
    fontSize: scale(15),
    fontWeight: '500',
  },
});

export default PendingAmountHistoryScreen;
