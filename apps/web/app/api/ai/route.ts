import { NextResponse } from 'next/server';

const apiKey = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { error: 'AI Asistan yakında aktif olacak (GROQ API Anahtarı eksik).' },
                { status: 503 }
            );
        }

        const body = await req.json();
        const { messages, mode } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 });
        }

        let systemPrompt = '';

        if (mode === 'project') {
            systemPrompt = "You are an expert in EU project implementation and monitoring.\nYou have deep knowledge of Erasmus+, ESC, Horizon Europe, \nCreative Europe project management.\n\nCRITICAL LANGUAGE RULE: Always respond in the same language \nthe user writes in. If they write in Turkish → respond in Turkish, \nEnglish → English, French → French, German → German, \nSpanish → Spanish, Italian → Italian, and so on for ALL languages.\n\nHelp with:\n- Activity planning and monitoring\n- Budget expenditure control and eligibility rules\n- Participant management and reporting\n- Webgate data entry\n- Interim and final report preparation\n- Partner coordination\n- EU audit preparation\n- Erasmus+ eligibility rules";
        } else {
            systemPrompt = "You are the multilingual support assistant for EUProjectHub platform.\n\nCRITICAL LANGUAGE RULE: Always respond in the same language \nthe user writes in. Auto-detect language and reply accordingly.\n\nHelp with platform features, modules, and EU project management.\nKeep answers short and clear.";
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map((m: any) => ({
                        role: m.role,
                        content: m.content
                    }))
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq API Hatası:', data);
            return NextResponse.json(
                { error: data.error?.message || 'AI yanıt oluştururken bir hata oluştu.' },
                { status: response.status }
            );
        }

        const reply = data.choices[0]?.message?.content || "Üzgünüm, yanıt oluşturulamadı.";

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('API Route Hatası:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
