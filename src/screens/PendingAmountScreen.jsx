import React, {useCallback, useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {scale, moderateScale, verticalScale} from 'react-native-size-matters';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import ApiService from '../services/apiservice';
import {AuthContext} from '../context/AuthContext';

const PRIMARY_GREEN = '#28A745';
const DANGER_RED = '#FF3B30';
const INFO_BLUE = '#007AFF';
const TEXT_DARK = '#212529';
const TEXT_GREY = '#6C757D';
const BACKGROUND = '#F8F9FA';

const formatAmount = value =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const isToday = dateStr => {
  if (!dateStr) return false;
  const d = new Date(String(dateStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const PendingAmountScreen = () => {
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);

  const [summary, setSummary] = useState({
    pendingAmount: 0,
    totalAdvanceTaken: 0,
  });
  const [todaysSummary, setTodaysSummary] = useState({
    advanceTaken: 0,
    settled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const [summaryResult, advanceResult] = await Promise.allSettled([
        ApiService.getPendingAmountSummary(user?.id),
        ApiService.getAdvanceRequestsForDeliveryBoy(user?.id),
      ]);

      if (summaryResult.status === 'rejected') {
        console.error(
          'Error fetching pending amount summary:',
          summaryResult.reason,
        );
      }
      if (advanceResult.status === 'rejected') {
        console.error('Error fetching advance requests:', advanceResult.reason);
      }

      const data =
        summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const record = Array.isArray(data) ? data[0] : data;

      const advanceRequests =
        advanceResult.status === 'fulfilled' ? advanceResult.value : [];

      // advance_request_t.balance_after_approval tracks the exact amount
      // still owed per request (it starts equal to the amount and is
      // decremented as repayments land in payment_history), so the current
      // pending amount is the sum of each request's remaining balance
      // rather than the backend's pending_amount/total_advance_taken
      // aggregates, which have been unreliable.
      const totalAdvanceTaken = Array.isArray(advanceRequests)
        ? advanceRequests.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0,
          )
        : 0;
      const pendingAmount = Array.isArray(advanceRequests)
        ? advanceRequests.reduce((sum, item) => {
            const hasBalance =
              item.balance_after_approval !== null &&
              item.balance_after_approval !== undefined;
            const remaining = hasBalance
              ? item.balance_after_approval
              : item.amount;
            return sum + Number(remaining || 0);
          }, 0)
        : 0;
      const todayAdvanceTaken = Array.isArray(advanceRequests)
        ? advanceRequests
            .filter(item => isToday(item.requested_date))
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        : 0;

      setSummary({
        pendingAmount,
        totalAdvanceTaken,
      });
      setTodaysSummary({
        advanceTaken: todayAdvanceTaken,
        settled: record?.today_settled ?? 0,
      });
    } catch (error) {
      console.error('Error fetching pending amount summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [user?.id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_GREEN} barStyle="light-content" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pending Amount</Text>
        <View style={styles.navButton} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_GREEN]}
            tintColor={PRIMARY_GREEN}
          />
        }>
        {/* Current Pending Amount Card */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>Current Pending Amount</Text>
          <Text style={styles.pendingAmount}>
            ₹{formatAmount(summary.pendingAmount)}
          </Text>
          <Text style={styles.pendingSubtitle}>
            You need to settle this amount.
          </Text>
        </View>

        {/* Stat Boxes */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={20}
              color={PRIMARY_GREEN}
            />
            <Text style={styles.statLabel}>Total Advance{'\n'}Taken</Text>
            <Text style={[styles.statValue, {color: PRIMARY_GREEN}]}>
              ₹{formatAmount(summary.totalAdvanceTaken)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={20}
              color={DANGER_RED}
            />
            <Text style={styles.statLabel}>Pending{'\n'}Amount</Text>
            <Text style={[styles.statValue, {color: DANGER_RED}]}>
              ₹{formatAmount(summary.pendingAmount)}
            </Text>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Today Advance Taken</Text>
            <Text style={[styles.summaryRowValue, {color: PRIMARY_GREEN}]}>
              ₹{formatAmount(todaysSummary.advanceTaken)}
            </Text>
          </View>
          <View style={[styles.summaryRow, {borderBottomWidth: 0}]}>
            <Text style={styles.summaryRowLabel}>Today Settled</Text>
            <Text style={[styles.summaryRowValue, {color: INFO_BLUE}]}>
              ₹{formatAmount(todaysSummary.settled)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('PendingAmountHistory')}>
          <Text style={styles.historyButtonText}>View History</Text>
          <MaterialCommunityIcons
            name="clipboard-text-clock-outline"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </ScrollView>
      )}
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
    fontSize: scale(17),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  navButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(30),
  },

  // Pending card
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: verticalScale(24),
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  pendingLabel: {
    fontSize: scale(13),
    color: TEXT_GREY,
    fontWeight: '600',
  },
  pendingAmount: {
    fontSize: scale(34),
    fontWeight: 'bold',
    color: DANGER_RED,
    marginVertical: verticalScale(6),
  },
  pendingSubtitle: {
    fontSize: scale(12),
    color: TEXT_GREY,
  },

  // Stat boxes
  statsRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginHorizontal: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: scale(10),
    color: TEXT_GREY,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  statValue: {
    fontSize: scale(13),
    fontWeight: '700',
  },

  // Today's summary
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: verticalScale(10),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryRowLabel: {
    fontSize: scale(13),
    color: TEXT_GREY,
    flexShrink: 1,
    marginRight: 10,
  },
  summaryRowValue: {
    fontSize: scale(14),
    fontWeight: '700',
    color: TEXT_DARK,
  },

  // Buttons
  historyButton: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: verticalScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  historyButtonText: {
    color: '#fff',
    fontSize: scale(15),
    fontWeight: '700',
    marginRight: 8,
  },
});

export default PendingAmountScreen;
