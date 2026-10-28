import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LeaseAgreementModal } from '../../components/LeaseAgreementModal';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../config/api';
import { spacing } from '../../constants/theme';

export const AdminWorkflowsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [activeTab, setActiveTab] = useState<'TOURS' | 'APPLICATIONS' | 'LEASES' | 'OFFERS' | 'REPAIRS' | 'REPORTS'>('TOURS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Modals
  const [selectedLease, setSelectedLease] = useState<any | null>(null);

  // Reschedule Appointment Modal
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [reschedulingApt, setReschedulingApt] = useState<any | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('10:00 AM - 11:30 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Counter Offer Modal
  const [counterModal, setCounterModal] = useState(false);
  const [counteringOffer, setCounteringOffer] = useState<any | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMsg, setCounterMsg] = useState('');

  // Maintenance Dispatch Modal
  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatchTicket, setDispatchTicket] = useState<any | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState('IN_PROGRESS');
  const [assignedTech, setAssignedTech] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [estCost, setEstCost] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Application Review Modal
  const [appModal, setAppModal] = useState(false);
  const [reviewApp, setReviewApp] = useState<any | null>(null);
  const [appNotes, setAppNotes] = useState('');

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const [aptRes, appRes, lseRes, offRes, repRes, rptRes] = await Promise.allSettled([
        api.get('/workflows/appointments'),
        api.get('/houses/applications'),
        api.get('/workflows/leases'),
        api.get('/workflows/offers'),
        api.get('/workflows/maintenance'),
        api.get('/reviews/reports'),
      ]);

      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data?.data || []);
      if (appRes.status === 'fulfilled') setApplications(appRes.value.data?.data?.applications || appRes.value.data?.data || []);
      if (lseRes.status === 'fulfilled') setLeases(lseRes.value.data?.data || []);
      if (offRes.status === 'fulfilled') setOffers(offRes.value.data?.data || []);
      if (repRes.status === 'fulfilled') setRepairs(repRes.value.data?.data || []);
      if (rptRes.status === 'fulfilled') setReports(rptRes.value.data?.data || []);
    } catch (err: any) {
      console.warn('Workflows fetch error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Appointment Actions
  const handleAppointmentStatus = async (id: string, status: string) => {
    try {
      try {
        await api.patch(`/workflows/appointments/${id}/status`, { status });
      } catch {
        await api.patch(`/workflows/appointments/${id}`, { status });
      }
      Alert.alert(isAmharic ? 'ተስተካክሏል' : 'Updated', `Appointment ${status.toLowerCase()} successfully.`);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update appointment.');
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingApt || !newDate) return;
    try {
      await api.patch(`/workflows/appointments/${reschedulingApt._id}/reschedule`, {
        date: newDate,
        timeSlot: newSlot,
        reason: rescheduleReason,
      });
      Alert.alert(isAmharic ? 'ቀጠሮ ተቀይሯል' : 'Rescheduled', 'Tour appointment rescheduled.');
      setRescheduleModal(false);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not reschedule appointment.');
    }
  };

  // Offer Actions
  const handleOfferStatus = async (id: string, action: 'accept' | 'reject') => {
    try {
      const offerStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
      try {
        await api.patch(`/workflows/offers/${id}/status`, { status: offerStatus });
      } catch {
        await api.patch(`/workflows/offers/${id}/${action}`);
      }
      Alert.alert(isAmharic ? 'ተስተካክሏል' : 'Success', `Purchase offer ${action}ed.`);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || `Failed to ${action} offer.`);
    }
  };

  const handleCounterSubmit = async () => {
    if (!counteringOffer || !counterAmount) return;
    try {
      await api.patch(`/workflows/offers/${counteringOffer._id}/counter`, {
        proposedAmount: Number(counterAmount),
        message: counterMsg,
      });
      Alert.alert(isAmharic ? 'ተልኳል' : 'Counter Sent', 'Counter-offer delivered to buyer.');
      setCounterModal(false);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit counter offer.');
    }
  };

  // Application Review
  const handleAppReviewSubmit = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewApp) return;
    try {
      try {
        await api.patch(`/houses/applications/${reviewApp._id}`, {
          status,
          adminNotes: appNotes,
        });
      } catch {
        await api.patch(`/houses/applications/${reviewApp._id}/review`, {
          status,
          adminNotes: appNotes,
        });
      }
      Alert.alert(isAmharic ? 'ተጠናቋል' : 'Review Saved', `Application marked as ${status}.`);
      setAppModal(false);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save review.');
    }
  };

  // Maintenance Dispatch
  const handleDispatchSubmit = async () => {
    if (!dispatchTicket) return;
    try {
      const dispatchPayload = {
        status: dispatchStatus,
        assignedTechnician: assignedTech,
        technicianContact: techPhone,
        estimatedCost: estCost ? Number(estCost) : undefined,
        resolutionNotes,
      };
      try {
        await api.patch(`/workflows/maintenance/${dispatchTicket._id}/status`, dispatchPayload);
      } catch {
        await api.patch(`/workflows/maintenance/${dispatchTicket._id}`, dispatchPayload);
      }
      Alert.alert(isAmharic ? 'ተልኳል' : 'Dispatched', 'Maintenance technician and status updated.');
      setDispatchModal(false);
      fetchWorkflows();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to dispatch ticket.');
    }
  };

  const tabs: Array<{ id: 'TOURS' | 'APPLICATIONS' | 'LEASES' | 'OFFERS' | 'REPAIRS' | 'REPORTS'; label: string; count: number; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'TOURS', label: isAmharic ? 'ጉብኝቶች' : 'Tours', count: appointments.length, icon: 'calendar-outline' },
    { id: 'APPLICATIONS', label: isAmharic ? 'ማመልከቻዎች' : 'Apps', count: applications.length, icon: 'key-outline' },
    { id: 'LEASES', label: isAmharic ? 'ውሎች' : 'Leases', count: leases.length, icon: 'document-text-outline' },
    { id: 'OFFERS', label: isAmharic ? 'ግዢዎች' : 'Offers', count: offers.length, icon: 'pricetag-outline' },
    { id: 'REPAIRS', label: isAmharic ? 'ጥገና' : 'Repairs', count: repairs.length, icon: 'construct-outline' },
    { id: 'REPORTS', label: isAmharic ? 'ሪፖርቶች' : 'Reports', count: reports.length, icon: 'shield-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የስራ ሂደቶች አስተዳደር' : 'Workflow Governance'}
        subtitle={isAmharic ? 'ጉብኝቶች፣ ውሎች፣ ማመልከቻዎች እና የጥገና ስራዎች' : 'Manage Appointments, Leases, Bids & Tickets'}
        showBack={true}
      />

      {/* Tabs */}
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? '#111D32' : '#F8FAFC',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons name={tab.icon} size={16} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.tabLabel, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[styles.tabCount, { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : isDark ? '#1E293B' : '#E2E8F0' }]}>
                    <Text style={[styles.tabCountText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>{tab.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkflows(); }} />}
        >
          {/* TOURS TAB */}
          {activeTab === 'TOURS' && (
            <View>
              {appointments.map((apt: any) => {
                const prop = typeof apt.houseId === 'object' ? apt.houseId : null;
                return (
                  <View key={apt._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {prop?.title || 'Tour Viewing'}
                      </Text>
                      <Badge label={apt.status} variant={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'CANCELLED' ? 'danger' : 'warning'} />
                    </View>

                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Client: {apt.clientName || apt.clientPhone || 'Verified Customer'}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Date: {apt.date} • Time: {apt.timeSlot} • Mode: {apt.type || 'In-Person'}
                    </Text>

                    <View style={styles.btnRow}>
                      {apt.status === 'PENDING' && (
                        <TouchableOpacity
                          onPress={() => handleAppointmentStatus(apt._id, 'CONFIRMED')}
                          style={[styles.actionBtn, { backgroundColor: colors.success }]}
                        >
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>{isAmharic ? 'አረጋግጥ' : 'Confirm'}</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => {
                          setReschedulingApt(apt);
                          setNewDate(apt.date || '');
                          setNewSlot(apt.timeSlot || '10:00 AM - 11:30 AM');
                          setRescheduleModal(true);
                        }}
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                      >
                        <Ionicons name="calendar" size={14} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>{isAmharic ? 'ቀይር' : 'Reschedule'}</Text>
                      </TouchableOpacity>

                      {apt.status !== 'CANCELLED' && (
                        <TouchableOpacity
                          onPress={() => handleAppointmentStatus(apt._id, 'CANCELLED')}
                          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>{isAmharic ? 'ሰርዝ' : 'Cancel'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
              {appointments.length === 0 && (
                <EmptyState icon="calendar-outline" title="No Tours" description="No scheduled tour appointments found." />
              )}
            </View>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'APPLICATIONS' && (
            <View>
              {applications.map((app: any) => {
                const prop = typeof app.houseId === 'object' ? app.houseId : null;
                return (
                  <View key={app._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {prop?.title || 'Rental Application'}
                      </Text>
                      <Badge label={app.status} variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'} />
                    </View>

                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Applicant: {app.applicantName || app.applicantEmail || 'Prospective Tenant'}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      Monthly Income: {app.monthlyIncome ? `ETB ${app.monthlyIncome.toLocaleString()}` : 'N/A'} • Move-in: {app.moveInDate || 'Flexible'}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        setReviewApp(app);
                        setAppNotes(app.adminNotes || '');
                        setAppModal(true);
                      }}
                      style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>{isAmharic ? 'ግምገማ እና ፍቃድ' : 'Review & Decide'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {applications.length === 0 && (
                <EmptyState icon="key-outline" title="No Applications" description="No rental applications in queue." />
              )}
            </View>
          )}

          {/* LEASES TAB */}
          {activeTab === 'LEASES' && (
            <View>
              {leases.map((lse: any) => {
                const prop = typeof lse.houseId === 'object' ? lse.houseId : null;
                return (
                  <TouchableOpacity
                    key={lse._id}
                    onPress={() => setSelectedLease(lse)}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {lse.leaseNumber || 'Lease Agreement'}
                      </Text>
                      <Badge label={lse.status} variant={lse.status === 'ACTIVE' ? 'success' : 'warning'} />
                    </View>

                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      Property: {prop?.title || 'Residential Property'}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.primary, fontWeight: '700' }]}>
                      Rent: ETB {lse.monthlyRent?.toLocaleString()} / month
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      Term: {lse.startDate} → {lse.endDate}
                    </Text>

                    <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                      <Text style={[styles.openText, { color: colors.primary }]}>
                        {isAmharic ? 'ውል ዝርዝር እና የክፍያ ሰሌዳ ክፈት' : 'Inspect Lease & Signature'}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              {leases.length === 0 && (
                <EmptyState icon="document-text-outline" title="No Leases" description="No lease agreements recorded." />
              )}
            </View>
          )}

          {/* OFFERS TAB */}
          {activeTab === 'OFFERS' && (
            <View>
              {offers.map((off: any) => {
                const prop = typeof off.houseId === 'object' ? off.houseId : null;
                return (
                  <View key={off._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {prop?.title || 'Purchase Bid'}
                      </Text>
                      <Badge label={off.status} variant={off.status === 'ACCEPTED' ? 'success' : off.status === 'REJECTED' ? 'danger' : 'warning'} />
                    </View>

                    <Text style={[styles.metaText, { color: colors.primary, fontWeight: '800', fontSize: 16 }]}>
                      Offer: ETB {(off.proposedAmount || off.proposedPrice || 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Buyer: {off.buyerName || off.buyerPhone || 'Authorized Bidder'} • Mode: {off.financingMode || 'Cash'}
                    </Text>

                    <View style={styles.btnRow}>
                      {off.status === 'PENDING' && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleOfferStatus(off._id, 'accept')}
                            style={[styles.actionBtn, { backgroundColor: colors.success }]}
                          >
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>{isAmharic ? 'ተቀበል' : 'Accept'}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setCounteringOffer(off);
                              setCounterAmount(String(off.proposedAmount || off.proposedPrice || ''));
                              setCounterModal(true);
                            }}
                            style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                          >
                            <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>{isAmharic ? 'ተቃራኒ ዋጋ' : 'Counter'}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleOfferStatus(off._id, 'reject')}
                            style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                          >
                            <Ionicons name="close" size={14} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>{isAmharic ? 'አትቀበል' : 'Reject'}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
              {offers.length === 0 && (
                <EmptyState icon="pricetag-outline" title="No Offers" description="No purchase bids currently pending." />
              )}
            </View>
          )}

          {/* REPAIRS TAB */}
          {activeTab === 'REPAIRS' && (
            <View>
              {repairs.map((rep: any) => (
                <View key={rep._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {rep.title || rep.category || 'Repair Ticket'}
                    </Text>
                    <Badge label={rep.status} variant={rep.status === 'RESOLVED' || rep.status === 'COMPLETED' ? 'success' : rep.status === 'IN_PROGRESS' ? 'warning' : 'info'} />
                  </View>

                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Priority: {rep.priority} • Category: {rep.category}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {rep.description}
                  </Text>
                  {rep.assignedTechnician ? (
                    <Text style={[styles.metaText, { color: colors.primary, marginTop: 4 }]}>
                      Assigned: {rep.assignedTechnician} ({rep.technicianContact || 'No phone'})
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    onPress={() => {
                      setDispatchTicket(rep);
                      setDispatchStatus(rep.status || 'IN_PROGRESS');
                      setAssignedTech(rep.assignedTechnician || '');
                      setTechPhone(rep.technicianContact || '');
                      setEstCost(rep.estimatedCost ? String(rep.estimatedCost) : '');
                      setResolutionNotes(rep.resolutionNotes || '');
                      setDispatchModal(true);
                    }}
                    style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="construct-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>{isAmharic ? 'ቴክኒሻን መድብ / አዘምን' : 'Dispatch / Update'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {repairs.length === 0 && (
                <EmptyState icon="construct-outline" title="No Repair Requests" description="All properties in optimal condition." />
              )}
            </View>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'REPORTS' && (
            <View>
              {reports.map((rpt: any) => (
                <View key={rpt._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, { color: colors.danger }]} numberOfLines={1}>
                      {rpt.reason || 'Listing Flagged'}
                    </Text>
                    <Badge label={rpt.status || 'PENDING'} variant="danger" />
                  </View>

                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Reporter: {rpt.reporterName || rpt.reporterPhone || 'User'}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {rpt.description || 'No description provided.'}
                  </Text>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await api.patch(`/reviews/reports/${rpt._id}/dismiss`);
                          Alert.alert('Dismissed', 'Report marked as investigated.');
                          fetchWorkflows();
                        } catch (err: any) {
                          Alert.alert('Error', err.response?.data?.message || 'Could not dismiss report.');
                        }
                      }}
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border }]}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.text }]}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {reports.length === 0 && (
                <EmptyState icon="shield-checkmark-outline" title="No Violations" description="No listings reported for violations." />
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* RESCHEDULE MODAL */}
      <Modal visible={rescheduleModal} transparent animationType="slide" onRequestClose={() => setRescheduleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isAmharic ? 'ቀጠሮ ቀይር' : 'Reschedule Tour'}</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="2026-11-01"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Time Slot:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={newSlot}
              onChangeText={setNewSlot}
              placeholder="10:00 AM - 11:30 AM"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reason for Rescheduling:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              placeholder="Host unavailable at requested hour..."
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRescheduleModal(false)} style={[styles.halfBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRescheduleSubmit} style={[styles.halfBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* COUNTER OFFER MODAL */}
      <Modal visible={counterModal} transparent animationType="slide" onRequestClose={() => setCounterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isAmharic ? 'ተቃራኒ ዋጋ አቅርብ' : 'Submit Counter-Offer'}</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Counter Amount (ETB):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={counterAmount}
              onChangeText={setCounterAmount}
              keyboardType="numeric"
              placeholder="5500000"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seller Note to Buyer:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={counterMsg}
              onChangeText={setCounterMsg}
              placeholder="Owner can accept at this price with 30% down payment..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setCounterModal(false)} style={[styles.halfBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCounterSubmit} style={[styles.halfBtn, { backgroundColor: colors.warning }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Deliver Counter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* APPLICATION REVIEW MODAL */}
      <Modal visible={appModal} transparent animationType="slide" onRequestClose={() => setAppModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isAmharic ? 'የኪራይ ማመልከቻ ግምገማ' : 'Review Rental Application'}</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Manager Notes / Decision Rationale:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border, height: 80 }]}
              value={appNotes}
              onChangeText={setAppNotes}
              placeholder="Proof of income verified, background check clear..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => handleAppReviewSubmit('REJECTED')} style={[styles.halfBtn, { backgroundColor: colors.danger }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAppReviewSubmit('APPROVED')} style={[styles.halfBtn, { backgroundColor: colors.success }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MAINTENANCE DISPATCH MODAL */}
      <Modal visible={dispatchModal} transparent animationType="slide" onRequestClose={() => setDispatchModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isAmharic ? 'የጥገና ቴክኒሻን መድብ' : 'Dispatch Maintenance Tech'}</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Technician Full Name:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={assignedTech}
              onChangeText={setAssignedTech}
              placeholder="Abebe Worku (Plumber)"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Technician Phone:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={techPhone}
              onChangeText={setTechPhone}
              keyboardType="phone-pad"
              placeholder="0911002233"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Estimated Cost (ETB):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={estCost}
              onChangeText={setEstCost}
              keyboardType="numeric"
              placeholder="3500"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDispatchModal(false)} style={[styles.halfBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDispatchSubmit} style={[styles.halfBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Dispatch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LEASE MODAL */}
      {selectedLease && (
        <LeaseAgreementModal
          visible={!!selectedLease}
          onClose={() => setSelectedLease(null)}
          lease={selectedLease}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsScroll: {
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
  tabCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  openText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  halfBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
