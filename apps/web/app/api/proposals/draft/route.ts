import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { proposalId, questionKey, questionText, context } = await req.json();

        if (!proposalId || !questionKey) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'AI API Key is missing' }, { status: 500 });
        }

        // Build a sophisticated prompt for Erasmus+ drafting
        const prompt = `
            You are an expert Erasmus+ Grant Consultant. 
            Draft a high-quality, professional, and convincing answer for the following proposal question.
            
            PROJECT CONTEXT:
            - Title: ${context.title}
            - Acronym: ${context.acronym}
            - Action Code: ${context.action_code}
            - Partners: ${context.partners?.join(', ') || 'N/A'}
            
            QUESTION:
            - Key: ${questionKey}
            - Text: ${questionText}
            
            REQUIREMENTS:
            1. Use professional, grant-writing style.
            2. Be specific, avoid generic fluff.
            3. Align with Erasmus+ priorities (Digital, Inclusion, Green, Participation).
            4. Keep it within a reasonable length (approx 200-400 words unless specified otherwise).
            5. Return ONLY the drafted text. No conversational preamble.
        `;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a professional Erasmus+ grant writing assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Groq API Error');
        }

        const draftedText = data.choices[0]?.message?.content?.trim();

        return NextResponse.json({ draft: draftedText });
    } catch (error: any) {
        console.error('AI Drafting Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
