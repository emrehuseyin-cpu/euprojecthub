const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Credentials
const SUPABASE_URL = 'https://jafatlroukhhewlxnogg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmF0bHJvdWtoaGV3bHhub2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDczMTUsImV4cCI6MjA4ODU4MzMxNX0.2gZmDFrLYS3lM8gNqmUoU-ze5e3hfw2iiQ2eRbGoUh8';
// In a real application, NEVER hardcode API keys. 
// Use process.env.GROQ_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("HATA: GROQ_API_KEY ortam değişkeni bulunamadı.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ai = new OpenAI({ apiKey: GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

async function runAgenticWorkflow() {
    console.log("--- 🤖 Agentic Workflow Başlatılıyor: EUProjectHub Analiz Ajanı ---");

    try {
        // 1. Veri Toplama (Data Gathering)
        console.log("1. Veritabanından proje verileri çekiliyor...");
        const { data: project } = await supabase.from('projects').select('*').limit(1).single();
        if (!project) return console.error("Proje bulunamadı.");

        console.log(`> Analiz edilen proje: "${project.name}"`);

        const { data: activities } = await supabase.from('activities').select('*').eq('project_id', project.id);
        const { data: budget } = await supabase.from('budget_items').select('*').eq('project_id', project.id);

        // 2. Akıllı Analiz (AI Reasoning)
        console.log("2. Veriler AI Ajanına (Groq Llama-3) gönderiliyor...");
        const context = `
            Proje: ${project.name}
            Bütçe: ${project.budget}
            Faaliyet Sayısı: ${activities?.length || 0}
            Harcama Kalemi: ${budget?.length || 0}
            
            Detaylar: ${JSON.stringify({ activities, budget })}
        `;

        const response = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Sen EU için bir proje yönetim uzmanısın. Proje verilerini analiz et, sağlık durumunu puanla ve 3 tane aksiyon önerisi sun. Markdown formatında yaz."
                },
                { role: "user", content: `Bu projeyi analiz et: ${context}` }
            ]
        });

        // 3. Çıktı Üretme (Actionable Report)
        console.log("\n--- 📈 AJAN ANALİZ RAPORU ---");
        console.log(response.choices[0].message.content);
        console.log("\n--- 🏁 İş Akışı Tamamlandı ---");

    } catch (err) {
        console.error("Hata:", err.message);
    }
}

runAgenticWorkflow();
