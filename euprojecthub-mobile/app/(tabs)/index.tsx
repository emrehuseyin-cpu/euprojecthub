import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const StatCard = ({ title, value, icon, color, bgColor }: any) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

export default function DashboardScreen() {
    const router = useRouter();
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const recentProjects = [
        { id: '1', name: 'Youth Exchange 2024', country: 'Türkiye', status: 'Aktif' },
        { id: '2', name: 'Digital Skills Academy', country: 'İspanya', status: 'Planlandı' },
    ];

    const upcomingActivities = [
        { id: '1', name: 'Prepare Budget Report', time: '14:30', project: 'Youth Exchange' },
        { id: '2', name: 'Partner Meeting', time: '16:00', project: 'Skills Academy' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Merhaba, Emre 👋</Text>
                        <Text style={styles.dateText}>{today}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/bildirimler')} style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={24} color="#1e293b" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard title="Aktif Projeler" value="12" icon="folder" color="#4F6EF7" bgColor="#EEF2FF" />
                    <StatCard title="Toplam Bütçe" value="€45k" icon="wallet" color="#10B981" bgColor="#ECFDF5" />
                    <StatCard title="Ortaklar" value="24" icon="business" color="#8B5CF6" bgColor="#F5F3FF" />
                    <StatCard title="Faaliyetler" value="8" icon="calendar" color="#F59E0B" bgColor="#FFFBEB" />
                </View>

                {/* Recent Projects */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Son Projeler</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/projeler')}>
                            <Text style={styles.viewAll}>Tümü</Text>
                        </TouchableOpacity>
                    </View>
                    {recentProjects.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.projectCard} onPress={() => router.push(`/projeler/${item.id}`)}>
                            <View style={styles.projectInfo}>
                                <Text style={styles.projectName}>{item.name}</Text>
                                <Text style={styles.projectMeta}>{item.country} • {item.status}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Upcoming Activities */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Yaklaşan Faaliyetler</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/faaliyetler')}>
                            <Text style={styles.viewAll}>Tümü</Text>
                        </TouchableOpacity>
                    </View>
                    {upcomingActivities.map((item) => (
                        <View key={item.id} style={styles.activityCard}>
                            <View style={styles.activityTimeBox}>
                                <Text style={styles.activityTime}>{item.time}</Text>
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName}>{item.name}</Text>
                                <Text style={styles.activityProject}>{item.project}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/ai-asistan')}
            >
                <LinearGradient colors={['#4F6EF7', '#818CF8']} style={styles.fabGradient}>
                    <Ionicons name="sparkles" size={24} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FC',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
    },
    dateText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    notificationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fff',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    statTitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    viewAll: {
        fontSize: 14,
        color: '#4F6EF7',
        fontWeight: '700',
    },
    projectCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    projectMeta: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activityTimeBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 16,
    },
    activityTime: {
        fontSize: 13,
        fontWeight: '800',
        color: '#4F6EF7',
    },
    activityInfo: {
        flex: 1,
    },
    activityName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    activityProject: {
        fontSize: 12,
        color: '#94a3b8',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#4F6EF7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
