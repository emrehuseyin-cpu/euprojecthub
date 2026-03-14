const fs = require('fs');
const path = require('path');

const mdPath = '/Users/emrehuseyinyigit/Downloads/erasmus_antigravity_prompt.md';
const content = fs.readFileSync(mdPath, 'utf8');

const baseDir = '/Users/emrehuseyinyigit/euprojecthub';

const parts = content.split('## ');

for (const part of parts) {
    if (part.startsWith('1. packages/core/src/erasmus/actions.ts')) {
        const code = part.split('```typescript')[1].split('```')[0].trim();
        fs.writeFileSync(path.join(baseDir, 'packages/core/src/erasmus/actions.ts'), code);
    } 
    else if (part.startsWith('2. app/components/ErasmusDeadlineWidget.tsx')) {
        const code = part.split('```tsx')[1].split('```')[0].trim();
        fs.writeFileSync(path.join(baseDir, 'apps/web/app/components/ErasmusDeadlineWidget.tsx'), code);
    }
    else if (part.startsWith('3. app/components/ErasmusBudgetCalculator.tsx')) {
        const code = part.split('```tsx')[1].split('```')[0].trim();
        fs.writeFileSync(path.join(baseDir, 'apps/web/app/components/ErasmusBudgetCalculator.tsx'), code);
    }
    else if (part.startsWith('4. app/erasmus/page.tsx')) {
        const code = part.split('```tsx')[1].split('```')[0].trim();
        fs.mkdirSync(path.join(baseDir, 'apps/web/app/erasmus'), { recursive: true });
        fs.writeFileSync(path.join(baseDir, 'apps/web/app/erasmus/page.tsx'), code);
    }
}
console.log('Files extracted successfully.');
