import { ERASMUS_PROGRAMS, TRAVEL_COSTS_2026 } from './rules';

export function calculateDurationMonths(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
}

export function validateProject(project: any) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const programType = project.program_type as keyof typeof ERASMUS_PROGRAMS;
    const programRules = ERASMUS_PROGRAMS[programType];

    if (!programRules) {
        errors.push('Geçersiz veya desteklenmeyen program türü.');
        return { valid: false, errors, warnings };
    }

    // Partner Count
    if (project.partner_count < (programRules as any).minPartners) {
        errors.push(`Minimum ${(programRules as any).minPartners} ortak gereklidir. Mevcut: ${project.partner_count}`);
    }

    // Duration
    const durationMonths = calculateDurationMonths(project.start_date, project.end_date);
    if ((programRules as any).minDurationMonths && durationMonths < (programRules as any).minDurationMonths) {
        errors.push(`Minimum proje süresi ${(programRules as any).minDurationMonths} aydır. Mevcut: ${durationMonths} ay`);
    }
    if ((programRules as any).maxDurationMonths && durationMonths > (programRules as any).maxDurationMonths) {
        errors.push(`Maksimum proje süresi ${(programRules as any).maxDurationMonths} aydır. Mevcut: ${durationMonths} ay`);
    }

    // Budget (Lump Sum check for KA220/KA210)
    if ((programRules as any).budgetOptions) {
        if (!(programRules as any).budgetOptions.includes(Number(project.budget))) {
            warnings.push(`${project.program_type} için geçerli lump sum bütçe seçenekleri: €${(programRules as any).budgetOptions.join(', €')}`);
        }
    }

    // Coordinator setup
    if ((programRules as any).coordinatorMinYears) {
        warnings.push(`Koordinatör kuruluş başvuru tarihinden en az ${(programRules as any).coordinatorMinYears} yıl önce kurulmuş olmalıdır.`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

export function validateBudgetItem(item: any, programType: string) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (programType === 'KA220' || programType === 'KA210') {
        warnings.push('Bu program lump sum finansman kullanır. Münferit harcama kalemleri yerine iş paketleri bazlı bütçe yönetilir.');
    }

    return { valid: errors.length === 0, errors, warnings };
}

export function calculateTravelCost(distanceKm: number, isGreen: boolean = false): number {
    const costs = isGreen ? TRAVEL_COSTS_2026.green : TRAVEL_COSTS_2026.standard;

    if (distanceKm < 10) return 0;
    if (distanceKm <= 99) return (costs as any)['10-99'];
    if (distanceKm <= 499) return (costs as any)['100-499'];
    if (distanceKm <= 1999) return (costs as any)['500-1999'];
    if (distanceKm <= 2999) return (costs as any)['2000-2999'];
    if (distanceKm <= 3999) return (costs as any)['3000-3999'];
    if (distanceKm <= 7999) return (costs as any)['4000-7999'];
    return (costs as any)['8000+'];
}
