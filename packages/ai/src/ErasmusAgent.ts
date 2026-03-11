import OpenAI from 'openai';
import { validateProject, ERASMUS_PROGRAMS } from '@euprojecthub/core';

export class ErasmusAgent {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }

    async analyzeProposal(projectData: any) {
        const validation = validateProject(projectData);

        const systemPrompt = `You are an expert Erasmus+ Programme Guide 2026 assistant 
for EUProjectHub platform.

KEY KNOWLEDGE:
- KA220 Cooperation Partnerships: min 3 partners, 12-36 months, 
  lump sums €120K/€250K/€400K, max 20% for management
- KA210 Small-Scale: min 2 partners, 6-24 months, 
  lump sums €30K/€60K
- Main deadline: 5 March (12:00 Brussels time)
- Second deadline: 1 October (12:00 Brussels time)  
- Belarus excluded from all actions
- Travel costs: green travel preferred, range from €28 to €1735
- Award criteria KA220: Relevance(25), Quality(30), Partnership(20), Impact(25) = 100 points total

Validation Results:
${JSON.stringify(validation, null, 2)}

LANGUAGE: Always respond in the user's language (Turkish if applicable).
ALWAYS cite the Programme Guide 2026 as your source.`;

        const userPrompt = `Analyze this project proposal and provide expert feedback based on Erasmus+ 2026 rules:
${JSON.stringify(projectData, null, 2)}`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.2,
            });

            return {
                analysis: response.choices[0].message.content,
                validation: validation
            };
        } catch (error) {
            console.error('ErasmusAgent Error:', error);
            throw error;
        }
    }
}
