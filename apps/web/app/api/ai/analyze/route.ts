import { NextRequest, NextResponse } from 'next/server';
import { ProjectAgent } from '@euprojecthub/ai';

export async function POST(req: NextRequest) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'AI API Key is missing' }, { status: 500 });
        }

        const agent = new ProjectAgent(GROQ_API_KEY);
        const result = await agent.analyzeProject(projectId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
