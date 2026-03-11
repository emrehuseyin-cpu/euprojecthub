"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAgent = void 0;
const core_1 = require("@euprojecthub/core");
const openai_1 = __importDefault(require("openai"));
class ProjectAgent {
    client;
    constructor(apiKey) {
        this.client = new openai_1.default({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }
    async analyzeProject(projectId) {
        console.log(`[AI Agent] Analyzing project: ${projectId}...`);
        // 1. Fetch Project Data
        const { data: project } = await core_1.supabase.from('projects').select('*').eq('id', projectId).single();
        const { data: activities } = await core_1.supabase.from('activities').select('*').eq('project_id', projectId);
        const { data: budget } = await core_1.supabase.from('budget_items').select('*').eq('project_id', projectId);
        const { data: partners } = await core_1.supabase.from('partners').select('*').eq('project_id', projectId);
        if (!project)
            throw new Error("Project not found");
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
exports.ProjectAgent = ProjectAgent;
