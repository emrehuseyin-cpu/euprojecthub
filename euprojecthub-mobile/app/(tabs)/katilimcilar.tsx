import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ParticipantCard = ({ item }: any) => {
    const initials = item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
        <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.avatarText, { color: item.color }]}>{initials}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.role} • {item.country}</Text>
                <View style={styles.projectBadge}>
                    <Text style={styles.projectText}>{item.project}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.messageBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4F6EF7" />
            </TouchableOpacity>
        </View>
    );
};

export default function ParticipantsScreen() {
    const [search, setSearch] = useState('');

    const participants = [
        { id: '1', name: 'Emre Yiğit', role: 'Proje Koordinatörü', country: 'Türkiye', project: 'Youth Exchange 2024', color: '#4F6EF7' },
        { id: '2', name: 'Elena Rodriguez', role: 'Eğitmen', country: 'İspanya', project: 'Digital Academy', color: '#8B5CF6' },
        { id: '3', name: 'Hans Müller', role: 'Partner Temsilcisi', country: 'Almanya', project: 'Green Partnership', color: '#10B981' },
        { id: '4', name: 'Anna Novak', role: 'Gönüllü', country: 'Polonya', project: 'Youth Exchange 2024', color: '#F59E0B' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Katılımcı ara..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <FlatList
                data={participants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ParticipantCard item={item} />}
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
    searchContainer: {
        padding: 20,
    },
    searchBar: {
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    meta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        fontWeight: '600',
    },
    projectBadge: {
        marginTop: 8,
        backgroundColor: '#F8FAF6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    projectText: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '700',
    },
    messageBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
