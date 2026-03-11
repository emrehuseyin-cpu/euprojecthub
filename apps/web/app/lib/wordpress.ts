export interface WPPost {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    link: string;
}

export interface WPLoginResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
}

const WP_API_URL = 'https://dev.moderngelisim.org.tr/wp-json/wp/v2';
const WP_AUTH_URL = 'https://dev.moderngelisim.org.tr/wp-json/jwt-auth/v1/token';

export async function loginWithWP(username: string, password: string): Promise<WPLoginResponse> {
    const response = await fetch(WP_AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password
        }),
    });

    if (!response.ok) {
        throw new Error(`Giriş başarısız. Lütfen bilgilerinizi kontrol edin.`);
    }

    return await response.json();
}

export async function getRecentPosts(limit: number = 3): Promise<WPPost[]> {
    try {
        const response = await fetch(`${WP_API_URL}/posts?per_page=${limit}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`WordPress API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch WordPress posts:', error);
        throw error;
    }
}
