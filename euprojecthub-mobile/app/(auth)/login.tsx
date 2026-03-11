import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'password' | 'magic'>('password');

    const handleSignIn = async () => {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'password') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: 'euprojecthub://login'
                    }
                });
                if (error) throw error;
                Alert.alert('Başarılı', 'Giriş bağlantısı e-posta adresinize gönderildi.');
            }
        } catch (error: any) {
            Alert.alert('Giriş Hatası', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0f172a', '#1e2a4a', '#1e1b4b']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    <View style={styles.logoContainer}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>EU</Text>
                        </View>
                        <Text style={styles.brandName}>Project<Text style={{ color: '#818CF8' }}>Hub</Text></Text>
                        <Text style={styles.subtitle}>EU Grant Management Platform</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'password' && styles.activeTab]}
                                onPress={() => setMode('password')}
                            >
                                <Ionicons name="lock-closed" size={16} color={mode === 'password' ? '#fff' : '#64748b'} />
                                <Text style={[styles.tabText, mode === 'password' && styles.activeTabText]}>Şifre</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'magic' && styles.activeTab]}
                                onPress={() => setMode('magic')}
                            >
                                <Ionicons name="flash" size={16} color={mode === 'magic' ? '#fff' : '#64748b'} />
                                <Text style={[styles.tabText, mode === 'magic' && styles.activeTabText]}>Magic Link</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-POSTA</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e-posta@kurum.eu"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {mode === 'password' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>ŞİFRE</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="#475569"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#4F6EF7', '#818CF8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.signInButtonText}>
                                            {mode === 'password' ? 'Giriş Yap' : 'Giriş Bağlantısı Gönder'}
                                        </Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Davetiyeniz mi var? </Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Katılmak için tıklayın</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.internalText}>EU proje yönetimi için dahili platform</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#4F6EF7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4F6EF7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    logoText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
    },
    brandName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#4F6EF7',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        height: 56,
    },
    inputIcon: {
        marginLeft: 16,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        paddingHorizontal: 12,
    },
    signInButton: {
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4F6EF7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerText: {
        color: '#64748b',
        fontSize: 13,
    },
    footerLink: {
        color: '#818CF8',
        fontSize: 13,
        fontWeight: '700',
    },
    internalText: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    }
});
