import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProjectCard = ({ item, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardHeader}>
            <View style={styles.programBadge}>
                <Text style={styles.programText}>{item.program}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Aktif' ? '#DCFCE7' : '#FEF3C7' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Aktif' ? '#15803D' : '#B45309' }]}>{item.status}</Text>
            </View>
        </View>

        <Text style={styles.projectName}>{item.name}</Text>

        <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>%{item.progress}</Text>
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
                <Ionicons name="cash-outline" size={14} color="#64748b" />
                <Text style={styles.footerLabel}>€{item.budget}</Text>
            </View>
            <View style={styles.footerItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.footerLabel}>{item.date}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function ProjectsScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const projects = [
        { id: '1', name: 'Youth Exchange 2024: Digital Inclusion', program: 'Erasmus+', budget: '24,500', status: 'Aktif', progress: 65, date: 'May 2024' },
        { id: '2', name: 'Academy for Young Entrepreneurs', program: 'ESC', budget: '18,800', status: 'Planlandı', progress: 20, date: 'Aug 2024' },
        { id: '3', name: 'Green Environment Partnership', program: 'Horizon Europe', budget: '145,000', status: 'Aktif', progress: 45, date: 'Dec 2024' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Proje veya program ara..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color="#4F6EF7" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProjectCard item={item} onPress={() => router.push(`/projeler/${item.id}`)} />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab}>
                <LinearGradient colors={['#4F6EF7', '#818CF8']} style={styles.fabGradient}>
                    <Ionicons name="add" size={32} color="#fff" />
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
    searchContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1e293b',
    },
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    programBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    programText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    projectName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1e293b',
        lineHeight: 24,
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4F6EF7',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        width: 35,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowColor: '#4F6EF7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
