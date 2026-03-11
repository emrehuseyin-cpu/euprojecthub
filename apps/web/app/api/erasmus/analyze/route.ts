import { NextResponse } from 'next/server';
import { ErasmusAgent } from '@euprojecthub/ai';

export async function POST(req: Request) {
    try {
        const { projectData } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
        }

        const agent = new ErasmusAgent(process.env.GROQ_API_KEY);
        const result = await agent.analyzeProposal(projectData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Erasmus AI API] Error:', error);
        return NextResponse.json({ error: 'AI analizi sırasında bir hata oluştu.' }, { status: 500 });
    }
}
