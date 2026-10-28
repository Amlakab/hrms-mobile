import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../constants/theme';

export const ResourcesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'VIDEOS'>('DOCUMENTS');

  const documents = [
    {
      id: 1,
      title: 'Secure Website Management Standard',
      description:
        'This document outlines the standards for managing secure websites, ensuring compliance with national cybersecurity guidelines.',
      downloadLink: 'https://example.com/documents/Document1.pdf',
    },
    {
      id: 2,
      title: 'Cyber Security Risk Assessment Framework',
      description:
        'A comprehensive framework for assessing cybersecurity risks within organizations, providing a structured approach to risk management.',
      downloadLink: 'https://example.com/documents/Document2.pdf',
    },
    {
      id: 3,
      title: 'National Cyber Security Framework Development Methodology',
      description:
        "Methodology for developing a national cybersecurity framework, aimed at enhancing the country's cybersecurity posture.",
      downloadLink: 'https://example.com/documents/Document3.pdf',
    },
    {
      id: 4,
      title: 'Secure Software Development and Management Standard',
      description:
        'Standards for secure software development and management, ensuring that software systems are developed with security in mind.',
      downloadLink: 'https://example.com/documents/Document4.pdf',
    },
    {
      id: 5,
      title: 'VRC-R (VRC_RJY)++ Technical Protocol',
      description:
        'Technical documentation for the VRC-R system, detailing its architecture, components, and operational protocols.',
      downloadLink: 'https://example.com/documents/Document5.pdf',
    },
  ];

  const videos = [
    {
      id: 1,
      title: 'Real Estate Platform & Security Overview (Part 1)',
      description: "Overview of secure property trading and tenant verification protocols.",
      videoId: '8etZEkL9P0M',
      youtubeUrl: 'https://www.youtube.com/watch?v=8etZEkL9P0M',
    },
    {
      id: 2,
      title: 'Cybersecurity Initiatives & Title Deed Verification (Part 2)',
      description: 'Understanding cryptographic title deed security and digital escrow.',
      videoId: '9M1lA-TwO_k',
      youtubeUrl: 'https://www.youtube.com/watch?v=9M1lA-TwO_k',
    },
    {
      id: 3,
      title: 'National Cybersecurity & Housing Infrastructure (Part 3)',
      description: 'Exploring secure cloud workflows and tenancy compliance in Ethiopia.',
      videoId: 'XsaoGxyGPDg',
      youtubeUrl: 'https://www.youtube.com/watch?v=XsaoGxyGPDg',
    },
    {
      id: 4,
      title: 'Digital Tenancy Leases & Mobile Escrow (Part 4)',
      description: 'Step-by-step walkthrough of digital lease agreements and milestone disbursement.',
      videoId: 'hjDIwkn0wsA',
      youtubeUrl: 'https://www.youtube.com/watch?v=hjDIwkn0wsA',
    },
    {
      id: 5,
      title: 'Best Practices for Real Estate Stakeholders (Part 5)',
      description: 'Key insights for landlords, agents, buyers, and tenants.',
      videoId: 'kyZsgIqxYR0',
      youtubeUrl: 'https://www.youtube.com/watch?v=kyZsgIqxYR0',
    },
  ];

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Link', `Opening: ${url}`);
      }
    } catch {
      Alert.alert('Error', 'Could not launch media URL.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የመረጃ እና የቪዲዮ ማዕከል' : 'Knowledge & Resources'}
        subtitle={isAmharic ? 'መመሪያዎች፣ የደህንነት ሰነዶች እና ትምህርታዊ ቪዲዮዎች' : 'Official Standards, Security Whitepapers & Video Guides'}
        showBack={true}
      />

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('DOCUMENTS')}
          style={[
            styles.tabItem,
            { borderBottomColor: activeTab === 'DOCUMENTS' ? colors.primary : 'transparent' },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={activeTab === 'DOCUMENTS' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'DOCUMENTS' ? colors.primary : colors.textSecondary, fontWeight: activeTab === 'DOCUMENTS' ? '700' : '500' },
            ]}
          >
            {isAmharic ? 'የደህንነት ሰነዶች' : 'Standards & Documents'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('VIDEOS')}
          style={[
            styles.tabItem,
            { borderBottomColor: activeTab === 'VIDEOS' ? colors.primary : 'transparent' },
          ]}
        >
          <Ionicons
            name="play-circle-outline"
            size={18}
            color={activeTab === 'VIDEOS' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'VIDEOS' ? colors.primary : colors.textSecondary, fontWeight: activeTab === 'VIDEOS' ? '700' : '500' },
            ]}
          >
            {isAmharic ? 'የትምህርት ቪዲዮዎች' : 'Video Masterclasses'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* DOCUMENTS TAB */}
        {activeTab === 'DOCUMENTS' && (
          <View style={styles.listWrap}>
            {documents.map((doc) => (
              <View
                key={doc.id}
                style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: isDark ? '#111D32' : '#EFF6FF' }]}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{doc.title}</Text>
                    <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                      {doc.description}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenLink(doc.downloadLink)}
                  style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>
                    {isAmharic ? 'ሰነዱን ያውርዱ (PDF)' : 'Download Standard (PDF)'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'VIDEOS' && (
          <View style={styles.listWrap}>
            {videos.map((vid) => (
              <TouchableOpacity
                key={vid.id}
                onPress={() => handleOpenLink(vid.youtubeUrl)}
                style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                activeOpacity={0.85}
              >
                <View style={styles.videoPreviewWrap}>
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg` }}
                    style={styles.thumbnail}
                  />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={32} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.videoMeta}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{vid.title}</Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {vid.description}
                  </Text>

                  <View style={styles.watchRow}>
                    <Ionicons name="logo-youtube" size={18} color="#EF4444" />
                    <Text style={[styles.watchText, { color: colors.primary }]}>
                      {isAmharic ? 'በYouTube ይመልከቱ' : 'Watch Masterclass'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    gap: 8,
  },
  tabText: {
    fontSize: 13,
  },
  content: {
    padding: spacing.md,
  },
  listWrap: {
    gap: 12,
  },
  resourceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  videoPreviewWrap: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoMeta: {
    gap: 4,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  watchText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
