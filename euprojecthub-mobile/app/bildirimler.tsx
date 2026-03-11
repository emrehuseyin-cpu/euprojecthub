import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.item, !item.isRead && styles.unreadItem]}>
        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{item.time}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
);

export default function NotificationsScreen() {
    const notifications = [
        { id: '1', title: 'Yeni Proje Atandı', body: 'Digital Inclusion projesine moderatör olarak atandınız.', time: '2 saat önce', icon: 'folder', color: '#4F6EF7', isRead: false },
        { id: '2', title: 'Faaliyet Hatırlatıcı', body: 'Yarın saat 10:00\'da Partner Tanışma Toplantısı var.', time: '5 saat önce', icon: 'calendar', color: '#8B5CF6', isRead: true },
        { id: '3', title: 'Bütçe Onayı', body: 'Son harcama talebiniz yönetici tarafından onaylandı.', time: 'Dün', icon: 'cash', color: '#10B981', isRead: true },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        paddingVertical: 12,
    },
    item: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#F8F9FF',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    body: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
        marginBottom: 6,
    },
    time: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
    },
    unreadDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4F6EF7',
        marginLeft: 8,
    }
});
