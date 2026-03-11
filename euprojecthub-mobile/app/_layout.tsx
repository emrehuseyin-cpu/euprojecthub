import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from './lib/auth';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

function RootLayoutNav() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!session && !inAuthGroup) {
            // Redirect to login if not logged in and not in auth group
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            // Redirect to home if logged in and in auth group
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="projeler/[id]" options={{ title: 'Proje Detay', headerBackTitle: 'Geri' }} />
            <Stack.Screen name="ai-asistan" options={{ title: 'AI Asistan', presentation: 'modal' }} />
            <Stack.Screen name="bildirimler" options={{ title: 'Bildirimler', presentation: 'modal' }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
