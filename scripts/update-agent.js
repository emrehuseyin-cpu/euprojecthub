const fs = require('fs');
const path = require('path');

const mdPath = '/Users/emrehuseyinyigit/Downloads/erasmus_antigravity_prompt.md';
const content = fs.readFileSync(mdPath, 'utf8');

const agentPath = '/Users/emrehuseyinyigit/euprojecthub/packages/ai/src/ErasmusAgent.ts';
let agentContent = fs.readFileSync(agentPath, 'utf8');

// Extract the prompt from md file
const blockStartStr = 'ERASMUS+ 2026 COMPLETE PROGRAMME KNOWLEDGE';
const blockEndStr = '14. All time deadlines: 12:00 Brussels time (NA-managed) or 17:00 Brussels time (EACEA)';

const partsStart = content.indexOf(blockStartStr);
const partsEnd = content.indexOf(blockEndStr, partsStart) + blockEndStr.length;

if (partsStart !== -1 && partsEnd !== -1) {
    const knowledgeBlock = content.substring(partsStart, partsEnd);
    
    // Replace the system prompt in ErasmusAgent.ts
    const newSystemPrompt = `const systemPrompt = \`You are an expert Erasmus+ Programme Guide 2026 assistant 
for EUProjectHub platform.

\${knowledgeBlock}

LANGUAGE: Always respond in the user's language (Turkish if applicable).
ALWAYS cite the Programme Guide 2026 as your source.\`;`;

    // regex to replace systemPrompt definition
    agentContent = agentContent.replace(/const systemPrompt = `[\\s\\S]*?ALWAYS cite the Programme Guide 2026 as your source.`;/, newSystemPrompt.replace(/\${knowledgeBlock}/, knowledgeBlock));

    fs.writeFileSync(agentPath, agentContent);
    console.log('Updated ErasmusAgent.ts');
} else {
    console.log('Could not find block in md file');
}
