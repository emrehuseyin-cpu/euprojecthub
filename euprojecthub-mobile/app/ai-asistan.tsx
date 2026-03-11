import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatWithAI } from '../lib/groq';
import { LinearGradient } from 'expo-linear-gradient';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function AIAssistantScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Merhaba! Ben EUProjectHub AI. Projelerin, faaliyetlerin veya bütçen hakkında bilgi alabilirsin. Sana nasıl yardımcı olabilirim?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const chatHistory = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
            const aiResponse = await chatWithAI(chatHistory as any);

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.chatContainer}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.userWrapper : styles.aiWrapper]}>
                            <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.content}</Text>
                            </View>
                        </View>
                    ))}
                    {loading && (
                        <View style={styles.aiWrapper}>
                            <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 12 }]}>
                                <ActivityIndicator size="small" color="#4F6EF7" />
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Bir soru sor..."
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
                            <LinearGradient colors={['#4F6EF7', '#818CF8']} style={styles.sendGradient}>
                                <Ionicons name="send" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatContainer: {
        padding: 20,
        paddingBottom: 20,
    },
    messageWrapper: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    userWrapper: {
        justifyContent: 'flex-end',
    },
    aiWrapper: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#4F6EF7',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#F1F5F9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#1e293b',
    },
    inputArea: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: '#1e293b',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
