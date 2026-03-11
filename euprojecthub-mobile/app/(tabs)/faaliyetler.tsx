import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActivityCard = ({ item }: any) => (
    <View style={styles.card}>
        <View style={styles.cardIndicator} style={{ backgroundColor: item.color }} />
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <Text style={styles.projectText}>{item.project}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={styles.titleText}>{item.title}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{item.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{item.participants} Katılımcı</Text>
                </View>
            </View>
        </View>
    </View>
);

export default function ActivitiesScreen() {
    const [activeFilter, setActiveFilter] = useState('Tümü');
    const filters = ['Tümü', 'Planlandı', 'Devam', 'Tamamlandı'];

    const activities = [
        { id: '1', title: 'Partner Tanışma Toplantısı', project: 'Youth Exchange 2024', time: '10:00 - 11:30', location: 'Online / Zoom', participants: 12, color: '#4F6EF7' },
        { id: '2', title: 'Dijital Beceriler Çalıştayı', project: 'Digital Academy', time: '14:00 - 17:00', location: 'Madrid, İspanya', participants: 25, color: '#8B5CF6' },
        { id: '3', title: 'Bütçe Planlama Grubu', project: 'Green Partnership', time: '09:30 - 10:30', location: 'Toplantı Odası A', participants: 4, color: '#10B981' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Date Strip */}
            <View style={styles.dateStrip}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                    {[12, 13, 14, 15, 16, 17, 18].map((day, idx) => (
                        <TouchableOpacity key={idx} style={[styles.dateBox, day === 14 && styles.activeDateBox]}>
                            <Text style={[styles.dayName, day === 14 && styles.activeDayName]}>Pzt</Text>
                            <Text style={[styles.dayNumber, day === 14 && styles.activeDayNumber]}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterTag, activeFilter === filter && styles.activeFilterTag]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityCard item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FC',
    },
    dateStrip: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dateScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    dateBox: {
        width: 60,
        height: 70,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeDateBox: {
        backgroundColor: '#4F6EF7',
        borderColor: '#4F6EF7',
        shadowColor: '#4F6EF7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    dayName: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 4,
    },
    activeDayName: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    activeDayNumber: {
        color: '#fff',
    },
    filterContainer: {
        paddingVertical: 16,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeFilterTag: {
        backgroundColor: '#1e293b',
        borderColor: '#1e293b',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIndicator: {
        width: 6,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    projectText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4F6EF7',
        textTransform: 'uppercase',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
    },
    titleText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    }
});
