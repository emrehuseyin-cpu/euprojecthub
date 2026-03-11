// Credentials - Use environment variables in production
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jafatlroukhhewlxnogg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function chatWithAI(messages: { role: 'user' | 'assistant' | 'system', content: string }[], mode: 'followup' | 'support' = 'followup') {
    const systemPrompt = mode === 'followup'
        ? "You are the EUProjectHub AI Assistant. Help users track their projects, manage activities, and understand their büdget."
        : "You are the EUProjectHub Support Assistant. Help users with platform technical issues and general questions.";

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Groq AI Error:', error);
        throw error;
    }
}
