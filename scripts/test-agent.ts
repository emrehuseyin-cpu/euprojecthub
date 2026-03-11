import { ProjectAgent } from '../packages/ai/src/ProjectAgent';
import { supabase } from '../packages/core/src/index';

// Groq API Key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

async function runDemo() {
    console.log("--- 🤖 Agentic Workflow Demo: EUProjectHub Health Agent ---");

    try {
        const agent = new ProjectAgent(GROQ_API_KEY);

        // 1. Get a random active project to analyze
        console.log("1. Finding a project to analyze...");
        const { data: projects, error } = await supabase.from('projects').select('id, name').limit(1);

        if (error || !projects || projects.length === 0) {
            console.error("No projects found in database to analyze.");
            return;
        }

        const projectId = projects[0].id;
        console.log(`2. Project selected: "${projects[0].name}" (ID: ${projectId})`);

        // 3. Run Agentic Analysis
        console.log("3. Running AI Project Health Analysis (Groq Llama-3)...");
        const result = await agent.analyzeProject(projectId);

        console.log("\n--- 📊 AI DURUM RAPORU (Agentic Output) ---");
        console.log(result.report);
        console.log("\n-------------------------------------------");
        console.log(`Bitiş Zamanı: ${result.timestamp}`);

    } catch (err: any) {
        console.error("Agent execution failed:", err.message);
    }
}

runDemo();
