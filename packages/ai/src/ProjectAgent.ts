import { supabase } from '@euprojecthub/core';
import OpenAI from 'openai';

export class ProjectAgent {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }

    async analyzeProject(projectId: string) {
        console.log(`[AI Agent] Analyzing project: ${projectId}...`);

        // 1. Fetch Project Data
        const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
        const { data: activities } = await supabase.from('activities').select('*').eq('project_id', projectId);
        const { data: budget } = await supabase.from('budget_items').select('*').eq('project_id', projectId);
        const { data: partners } = await supabase.from('partners').select('*').eq('project_id', projectId);

        if (!project) throw new Error("Project not found");

        const context = `
            Proje Adı: ${project.name}
            Konu: ${project.description}
            Program: ${project.program}
            Toplam Bütçe: ${project.budget}
            
            Faaliyetler: ${JSON.stringify(activities)}
            Harcamalar: ${JSON.stringify(budget)}
            Partnerler: ${JSON.stringify(partners)}
        `;

        // 2. Perform AI Analysis
        const response = await this.client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Sen EUProjectHub için uzman bir Avrupa Birliği Proje Analiz Takip Ajanısın. Verilen proje verilerini analiz ederek projenin sağlık durumunu raporla. Riskleri belirle ve iyileştirme önerileri sun. Türkçe cevap ver. Raporu profesyonel bir tonda ve Markdown formatında hazırla."
                },
                {
                    role: "user",
                    content: `Şu proje verilerini analiz et ve kapsamlı bir durum raporu oluştur: ${context}`
                }
            ],
            temperature: 0.7,
        });

        const report = response.choices[0].message.content;
        console.log(`[AI Agent] Analysis complete for project: ${project.name}`);

        return {
            projectId,
            projectName: project.name,
            report,
            timestamp: new Date().toISOString()
        };
    }
}
