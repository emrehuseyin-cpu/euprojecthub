import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReportCard = ({ item }: any) => (
    <View style={styles.card}>
        <View style={styles.cardInfo}>
            <View style={styles.typeLabel}>
                <Text style={styles.typeText}>{item.type}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.project}>{item.project}</Text>
        </View>
        <View style={styles.cardStatus}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'Gönderildi' ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
    </View>
);

export default function ReportsScreen() {
    const reports = [
        { id: '1', title: 'Ara Faaliyet Raporu', type: 'Erasmus+', project: 'Youth Exchange 2024', status: 'Beklemede', date: '12.03.2024' },
        { id: '2', title: 'Final Bütçe Raporu', type: 'ESC', project: 'Entrepreneurs Academy', status: 'Gönderildi', date: '01.03.2024' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.newReportBtn}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.newReportText}>Yeni Rapor</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ReportCard item={item} />}
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
    header: {
        padding: 20,
        alignItems: 'flex-end',
    },
    newReportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F6EF7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    newReportText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    typeLabel: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    project: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    cardStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '700',
    }
});
