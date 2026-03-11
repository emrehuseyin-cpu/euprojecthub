import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TabItem = ({ title, active, onPress }: any) => (
    <TouchableOpacity
        style={[styles.tabItem, active && styles.activeTabItem]}
        onPress={onPress}
    >
        <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
);

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Genel');

    const tabs = ['Genel', 'Faaliyetler', 'Katılımcılar', 'Bütçe'];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Info */}
            <View style={styles.header}>
                <LinearGradient colors={['#4F6EF7', '#818CF8']} style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={styles.programLabel}>
                            <Text style={styles.programText}>ERASMUS+</Text>
                        </View>
                        <Text style={styles.title}>Youth Exchange 2024: Digital Inclusion</Text>
                        <View style={styles.headerMeta}>
                            <View style={styles.metaBadge}>
                                <Ionicons name="location" size={12} color="#fff" />
                                <Text style={styles.metaText}>İstanbul, TR</Text>
                            </View>
                            <View style={styles.metaBadge}>
                                <Ionicons name="time" size={12} color="#fff" />
                                <Text style={styles.metaText}>6 Ay Kaldı</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {tabs.map(tab => (
                        <TabItem
                            key={tab}
                            title={tab}
                            active={activeTab === tab}
                            onPress={() => setActiveTab(tab)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'Genel' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Açıklama</Text>
                        <Text style={styles.description}>
                            Bu proje, gençlerin dijital becerilerini geliştirmeyi ve sosyal inklüzyonu artırmayı hedefleyen kapsamlı bir gençlik değişimi programıdır. Toplamda 8 farklı ülkeden 45 katılımcı yer alacaktır.
                        </Text>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Başlangıç</Text>
                                <Text style={styles.infoValue}>01.05.2024</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Bitiş</Text>
                                <Text style={styles.infoValue}>31.10.2024</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Katılımcı</Text>
                                <Text style={styles.infoValue}>45 Kişi</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Ülke Sayısı</Text>
                                <Text style={styles.infoValue}>8 Ülke</Text>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 'Bütçe' && (
                    <View style={styles.section}>
                        <View style={styles.budgetCard}>
                            <Text style={styles.budgetTitle}>Toplam Hibe</Text>
                            <Text style={styles.budgetValue}>€24,500.00</Text>

                            <View style={styles.budgetDivider} />

                            <View style={styles.budgetRow}>
                                <Text style={styles.budgetLabel}>Harcama Planı</Text>
                                <Text style={styles.budgetLabel}>%75 Kullanıldı</Text>
                            </View>
                            <View style={styles.budgetBarBg}>
                                <View style={[styles.budgetBarFill, { width: '75%' }]} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 180,
    },
    headerGradient: {
        flex: 1,
        padding: 24,
        justifyContent: 'flex-end',
    },
    headerContent: {
        gap: 8,
    },
    programLabel: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    programText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 28,
    },
    headerMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.9,
    },
    tabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tabsScroll: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    activeTabItem: {
        backgroundColor: '#4F6EF7',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoBox: {
        width: (width - 52) / 2,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
    },
    budgetCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    budgetTitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    budgetValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
    },
    budgetDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 20,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetLabel: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    budgetBarBg: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    budgetBarFill: {
        height: '100%',
        backgroundColor: '#4F6EF7',
        borderRadius: 5,
    }
});
