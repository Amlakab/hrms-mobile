import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LeaseAgreementModal, LeaseAgreement } from '../../components/LeaseAgreementModal';
import { MaintenanceModal } from '../../components/MaintenanceModal';
import { PurchaseMilestonePaymentModal } from '../../components/PurchaseMilestonePaymentModal';
import { PurchaseReceiptModal } from '../../components/PurchaseReceiptModal';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';

export const CustomerPortalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'APPOINTMENTS' | 'APPLICATIONS' | 'LEASES' | 'OFFERS' | 'MAINTENANCE' | 'PAYMENTS'
  >('LEASES');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [leases, setLeases] = useState<LeaseAgreement[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Modals
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [payingOffer, setPayingOffer] = useState<any | null>(null);
  const [payingMilestone, setPayingMilestone] = useState<any | null>(null);
  const [receiptOffer, setReceiptOffer] = useState<any | null>(null);
  const [receiptMilestone, setReceiptMilestone] = useState<any | null>(null);

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true);
      const [appRes, leaseRes, offerRes, maintRes, appListRes, txRes] = await Promise.allSettled([
        api.get('/workflows/appointments'),
        api.get('/workflows/leases'),
        api.get('/workflows/offers'),
        api.get('/workflows/maintenance'),
        api.get('/houses/applications'),
        api.get('/transactions'),
      ]);

      if (appRes.status === 'fulfilled') setAppointments(appRes.value.data?.data || []);
      if (leaseRes.status === 'fulfilled') setLeases(leaseRes.value.data?.data || []);
      if (offerRes.status === 'fulfilled') setOffers(offerRes.value.data?.data || []);
      if (maintRes.status === 'fulfilled') setMaintenanceTickets(maintRes.value.data?.data || []);
      if (appListRes.status === 'fulfilled') setApplications(appListRes.value.data?.data?.applications || []);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data?.data || []);

      // If no lease from backend yet, provide active demonstration lease
      if (leaseRes.status !== 'fulfilled' || !leaseRes.value.data?.data?.length) {
        setLeases([
          {
            _id: 'lease_01',
            leaseNumber: 'HRMS-LSE-2026-08',
            houseId: { _id: 'h1', title: 'Luxury 3-Bedroom Villa in Bole' },
            tenantId: user?._id || 'me',
            landlordId: 'landlord_01',
            monthlyRent: 45000,
            securityDeposit: 45000,
            startDate: '2026-02-01',
            endDate: '2027-01-31',
            status: 'ACTIVE',
            isSignedByTenant: true,
            tenantSignedAt: '2026-02-01',
          },
        ]);
      }
    } catch (err: any) {
      console.warn('Portal data fallback', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const tabs: Array<{
    key: 'APPOINTMENTS' | 'APPLICATIONS' | 'LEASES' | 'OFFERS' | 'MAINTENANCE' | 'PAYMENTS';
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    count: number;
  }> = [
    { key: 'LEASES', label: isAmharic ? 'የኪራይ ውሎች' : 'Leases', icon: 'document-text-outline', count: leases.length },
    { key: 'APPLICATIONS', label: isAmharic ? 'ማመልከቻዎች' : 'Apps', icon: 'key-outline', count: applications.length },
    { key: 'OFFERS', label: isAmharic ? 'የግዢ ጥያቄዎች' : 'Offers', icon: 'pricetag-outline', count: offers.length },
    { key: 'APPOINTMENTS', label: isAmharic ? 'ጉብኝቶች' : 'Tours', icon: 'calendar-outline', count: appointments.length },
    { key: 'MAINTENANCE', label: isAmharic ? 'ጥገና' : 'Repairs', icon: 'construct-outline', count: maintenanceTickets.length },
    { key: 'PAYMENTS', label: isAmharic ? 'ክፍያዎች' : 'Payments', icon: 'receipt-outline', count: transactions.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የደንበኛ ፖርታል' : 'Customer Portal'}
        subtitle={isAmharic ? 'ውሎች፣ ክፍያዎች፣ ጉብኝቶች እና ጥገና' : 'Manage Leases, Offers, Tours & Payments'}
        showBack={true}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
      />

      {/* Quick Action Shortcuts Banner */}
      <View style={[styles.shortcutRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Orders')}
          style={[styles.shortcutBtn, { backgroundColor: isDark ? '#162035' : '#F1F5F9', borderColor: colors.border }]}
        >
          <Ionicons name="cart-outline" size={16} color={colors.primary} />
          <Text style={[styles.shortcutText, { color: colors.text }]}>
            {isAmharic ? 'የእኔ ትዕዛዞች' : 'My Orders'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CustomerPayments')}
          style={[styles.shortcutBtn, { backgroundColor: isDark ? '#162035' : '#F1F5F9', borderColor: colors.border }]}
        >
          <Ionicons name="cash-outline" size={16} color={colors.success} />
          <Text style={[styles.shortcutText, { color: colors.text }]}>
            {isAmharic ? 'የክፍያ ታሪክ' : 'My Payments'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMaintenanceModalOpen(true)}
          style={[styles.shortcutBtn, { backgroundColor: isDark ? '#162035' : '#F1F5F9', borderColor: colors.border }]}
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.warning} />
          <Text style={[styles.shortcutText, { color: colors.text }]}>
            {isAmharic ? 'አዲስ ጥገና' : 'New Repair'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isActive ? colors.primary : isDark ? '#111D32' : '#F8FAFC',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? '#FFFFFF' : colors.text,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.25)'
                          : isDark
                          ? '#1E293B'
                          : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Body */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPortalData(); }} />
          }
        >
          {/* LEASES TAB */}
          {activeTab === 'LEASES' && (
            <View>
              {leases.map((lease) => {
                const hTitle = typeof lease.houseId === 'object' && lease.houseId?.title
                  ? lease.houseId.title
                  : 'Property Tenancy';
                return (
                  <TouchableOpacity
                    key={lease._id}
                    onPress={() => setSelectedLease(lease)}
                    activeOpacity={0.85}
                    style={[
                      styles.portalCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons name="document-text" size={20} color={colors.primary} />
                        <Text style={[styles.leaseNum, { color: colors.text }]}>
                          {lease.leaseNumber || 'Lease Contract'}
                        </Text>
                      </View>
                      <Badge label={lease.status} variant={lease.status === 'ACTIVE' ? 'success' : 'warning'} />
                    </View>

                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {hTitle}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={[styles.rentPrice, { color: colors.primary }]}>
                        ETB {(lease.monthlyRent || 0).toLocaleString()} <Text style={styles.rentPeriod}>/mo</Text>
                      </Text>
                      <Text style={[styles.termDates, { color: colors.textMuted }]}>
                        {lease.startDate} → {lease.endDate}
                      </Text>
                    </View>

                    <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                        {isAmharic ? 'ሙሉ ውሉን ይመልከቱ እና ኪራይ ይክፈሉ' : 'View Full Lease & Pay Rent'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })}

              {leases.length === 0 && (
                <EmptyState
                  icon="document-text-outline"
                  title={isAmharic ? 'ምንም ንቁ ውል የለም' : 'No Active Leases'}
                  description={isAmharic ? 'እስካሁን የተፈረመ ንቁ የኪራይ ውል የለም።' : 'You do not have any active tenancy contracts.'}
                />
              )}
            </View>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'APPLICATIONS' && (
            <View>
              {applications.map((app: any) => {
                const hTitle = typeof app.houseId === 'object' ? app.houseId?.title : 'Rental Application';
                return (
                  <View
                    key={app._id}
                    style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{hTitle}</Text>
                      <Badge label={app.status} variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'} size="sm" />
                    </View>
                    <Text style={[styles.appDate, { color: colors.textMuted }]}>
                      Submitted: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                    </Text>
                    {app.adminNotes ? (
                      <View style={[styles.notesBox, { backgroundColor: isDark ? '#162035' : '#F1F5F9' }]}>
                        <Text style={[styles.notesLabel, { color: colors.primary }]}>Manager Notes:</Text>
                        <Text style={[styles.notesText, { color: colors.textSecondary }]}>{app.adminNotes}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
              {applications.length === 0 && (
                <EmptyState
                  icon="key-outline"
                  title={isAmharic ? 'ምንም ማመልከቻ የለም' : 'No Rental Applications'}
                  description={isAmharic ? 'እስካሁን ያቀረቡት የኪራይ ማመልከቻ የለም።' : 'You have not submitted any lease applications.'}
                />
              )}
            </View>
          )}

          {/* OFFERS TAB WITH MILESTONES & RECEIPTS */}
          {activeTab === 'OFFERS' && (
            <View>
              {offers.map((off: any) => {
                const hTitle = typeof off.houseId === 'object' ? off.houseId?.title : 'Purchase Offer';
                const milestones = off.milestones || [];
                return (
                  <View
                    key={off._id}
                    style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{hTitle}</Text>
                      <Badge label={off.status} variant={off.status === 'ACCEPTED' ? 'success' : off.status === 'REJECTED' ? 'danger' : 'warning'} size="sm" />
                    </View>

                    <Text style={[styles.rentPrice, { color: colors.primary }]}>
                      Offered: ETB {(off.proposedAmount || off.proposedPrice || 0).toLocaleString()}
                    </Text>
                    {off.downPayment && (
                      <Text style={[styles.metaMuted, { color: colors.textMuted }]}>
                        Down Payment: ETB {off.downPayment.toLocaleString()}
                      </Text>
                    )}

                    {/* Milestones list */}
                    {milestones.length > 0 && (
                      <View style={styles.milestonesWrap}>
                        <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                          {isAmharic ? 'የክፍያ ደረጃዎች (Milestones)' : 'Payment Milestones'}
                        </Text>
                        {milestones.map((ms: any, mIdx: number) => {
                          const isPaid = ms.status === 'PAID';
                          return (
                            <View
                              key={ms._id || mIdx}
                              style={[styles.milestoneRowCard, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.msTitle, { color: colors.text }]}>{ms.title}</Text>
                                <Text style={[styles.msAmount, { color: isPaid ? colors.success : colors.textSecondary }]}>
                                  ETB {ms.amount?.toLocaleString()} ({ms.percentage}%) • {ms.status}
                                </Text>
                              </View>

                              {isPaid ? (
                                <TouchableOpacity
                                  onPress={() => {
                                    setReceiptOffer(off);
                                    setReceiptMilestone(ms);
                                  }}
                                  style={[styles.smallBtn, { backgroundColor: colors.success }]}
                                >
                                  <Ionicons name="receipt-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                                  <Text style={styles.smallBtnText}>{isAmharic ? 'ደረሰኝ' : 'Receipt'}</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => {
                                    setPayingOffer(off);
                                    setPayingMilestone(ms);
                                  }}
                                  style={[styles.smallBtn, { backgroundColor: colors.primary }]}
                                >
                                  <Ionicons name="card-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                                  <Text style={styles.smallBtnText}>{isAmharic ? 'ክፈል' : 'Pay'}</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}

              {offers.length === 0 && (
                <EmptyState
                  icon="pricetag-outline"
                  title={isAmharic ? 'ምንም የግዢ ጥያቄ የለም' : 'No Purchase Offers'}
                  description={isAmharic ? 'እስካሁን ያቀረቡት የንብረት ግዢ ጥያቄ የለም።' : 'You have not submitted any property purchase offers.'}
                />
              )}
            </View>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'APPOINTMENTS' && (
            <View>
              {appointments.map((apt: any) => {
                const hTitle = typeof apt.houseId === 'object' ? apt.houseId?.title : 'Viewing Tour';
                return (
                  <View
                    key={apt._id}
                    style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{hTitle}</Text>
                      <Badge label={apt.status} variant={apt.status === 'CONFIRMED' ? 'success' : 'info'} size="sm" />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaLeft}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                        <Text style={[styles.metaDate, { color: colors.text }]}>{apt.date}</Text>
                      </View>
                      <View style={styles.metaLeft}>
                        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.metaTime, { color: colors.textMuted }]}>{apt.timeSlot}</Text>
                      </View>
                    </View>

                    <Text style={[styles.tourType, { color: colors.textSecondary }]}>
                      Type: {apt.type || 'In-Person Tour'}
                    </Text>
                  </View>
                );
              })}

              {appointments.length === 0 && (
                <EmptyState
                  icon="calendar-outline"
                  title={isAmharic ? 'ምንም ጉብኝት የለም' : 'No Scheduled Tours'}
                  description={isAmharic ? 'እስካሁን የተያዘ የቤት ጉብኝት ቀጠሮ የለም።' : 'You have not scheduled any property viewing tours.'}
                />
              )}
            </View>
          )}

          {/* MAINTENANCE TAB */}
          {activeTab === 'MAINTENANCE' && (
            <View>
              <TouchableOpacity
                onPress={() => setMaintenanceModalOpen(true)}
                style={[styles.actionBanner, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionBannerText}>
                  {isAmharic ? 'አዲስ የጥገና ጥያቄ አቅርብ' : 'Submit New Repair Request'}
                </Text>
              </TouchableOpacity>

              {maintenanceTickets.map((tkt: any) => {
                return (
                  <View
                    key={tkt._id}
                    style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {tkt.title || tkt.category || 'Repair Ticket'}
                      </Text>
                      <Badge label={tkt.status} variant={tkt.status === 'COMPLETED' ? 'success' : tkt.status === 'IN_PROGRESS' ? 'warning' : 'info'} size="sm" />
                    </View>

                    <Text style={[styles.metaMuted, { color: colors.textMuted }]}>
                      Category: {tkt.category} • Priority: {tkt.priority}
                    </Text>
                    <Text style={[styles.appMsg, { color: colors.textSecondary }]}>
                      {tkt.description}
                    </Text>
                    {tkt.resolutionNotes && (
                      <View style={[styles.notesBox, { backgroundColor: isDark ? '#162035' : '#F1F5F9' }]}>
                        <Text style={[styles.notesLabel, { color: colors.success }]}>Resolution:</Text>
                        <Text style={[styles.notesText, { color: colors.textSecondary }]}>{tkt.resolutionNotes}</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {maintenanceTickets.length === 0 && (
                <EmptyState
                  icon="construct-outline"
                  title={isAmharic ? 'ምንም የጥገና ጥያቄ የለም' : 'No Repair Tickets'}
                  description={isAmharic ? 'ምንም ክፍት ወይም የተመዘገበ የጥገና ጥያቄ የለም።' : 'No active or past maintenance repair requests.'}
                />
              )}
            </View>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'PAYMENTS' && (
            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate('CustomerPayments')}
                style={[styles.actionBanner, { backgroundColor: colors.success }]}
              >
                <Ionicons name="open-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionBannerText}>
                  {isAmharic ? 'ሙሉ የክፍያ ዝርዝር ይመልከቱ' : 'Open Comprehensive Payment Ledger'}
                </Text>
              </TouchableOpacity>

              {transactions.slice(0, 10).map((tx: any) => (
                <View
                  key={tx._id}
                  style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{tx.reference || 'Payment'}</Text>
                    <Badge label={tx.status} variant={tx.status === 'completed' || tx.status === 'approved' ? 'success' : 'warning'} size="sm" />
                  </View>
                  <Text style={[styles.rentPrice, { color: colors.success }]}>
                    ETB {(tx.amount || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.metaMuted, { color: colors.textMuted }]}>
                    {tx.type} • {tx.method} • {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              ))}

              {transactions.length === 0 && (
                <EmptyState
                  icon="receipt-outline"
                  title={isAmharic ? 'ምንም ክፍያ የለም' : 'No Payment Transactions'}
                  description={isAmharic ? 'እስካሁን የተፈጸመ ክፍያ የለም።' : 'No transaction records found.'}
                />
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODALS */}
      {selectedLease && (
        <LeaseAgreementModal
          visible={!!selectedLease}
          onClose={() => setSelectedLease(null)}
          lease={selectedLease}
          onSuccess={() => {
            fetchPortalData();
            Alert.alert(isAmharic ? 'ተፈርሟል' : 'Signed', isAmharic ? 'ውሉ በተሳካ ሁኔታ ተፈርሟል።' : 'Lease agreement digitally signed.');
          }}
        />
      )}

      {maintenanceModalOpen && (
        <MaintenanceModal
          visible={maintenanceModalOpen}
          onClose={() => setMaintenanceModalOpen(false)}
          houseId={leases[0]?.houseId?._id || 'general'}
          onSuccess={() => {
            fetchPortalData();
            Alert.alert(isAmharic ? 'ተልኳል' : 'Submitted', isAmharic ? 'የጥገና ጥያቄዎ ለአስተዳዳሪው ደርሷል።' : 'Maintenance request submitted.');
          }}
        />
      )}

      {payingOffer && payingMilestone && (
        <PurchaseMilestonePaymentModal
          visible={!!payingOffer && !!payingMilestone}
          onClose={() => { setPayingOffer(null); setPayingMilestone(null); }}
          offer={payingOffer}
          milestone={payingMilestone}
          onSuccess={() => {
            fetchPortalData();
          }}
        />
      )}

      {receiptOffer && receiptMilestone && (
        <PurchaseReceiptModal
          visible={!!receiptOffer && !!receiptMilestone}
          onClose={() => { setReceiptOffer(null); setReceiptMilestone(null); }}
          offer={receiptOffer}
          milestone={receiptMilestone}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shortcutRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    gap: 12,
  },
  portalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaseNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaTime: {
    fontSize: 13,
  },
  rentPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  rentPeriod: {
    fontSize: 12,
    fontWeight: '400',
  },
  termDates: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  appDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  appMsg: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  metaMuted: {
    fontSize: 12,
    marginTop: 2,
  },
  notesBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
  },
  milestonesWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  milestoneRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  msTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  msAmount: {
    fontSize: 11,
    marginTop: 2,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tourType: {
    fontSize: 12,
    marginTop: 4,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  actionBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
