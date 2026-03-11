export const ERASMUS_PROGRAMS = {
    KA220: {
        name: 'Cooperation Partnerships',
        description: 'Transnational cooperation between minimum 3 organisations',
        minPartners: 3,
        maxPartners: null,
        minDurationMonths: 12,
        maxDurationMonths: 36,
        budgetOptions: [120000, 250000, 400000],
        coordinatorMinYears: 2,
        thirdCountryCanCoordinate: false,
        excludedCountries: ['Belarus', 'Russia'],
        mainDeadline: '5 March',
        secondDeadline: '1 October',
        maxManagementBudgetPercent: 20,
        maxWorkPackages: 4,
        awardCriteria: {
            relevance: { max: 25, min: 13 },
            qualityDesign: { max: 30, min: 15 },
            partnershipQuality: { max: 20, min: 10 },
            impact: { max: 25, min: 13 }
        },
        requiredDocuments: [
            'Grant Application Form',
            'Organisation ID (OID)',
            'ECHE (for Higher Education Institutions)',
            'Mandate letters from partner organisations'
        ],
        priorities: [
            'Inclusion and Diversity',
            'Environment and fight against climate change',
            'Digital transformation',
            'Participation and democratic life',
            'Common values and civic engagement'
        ]
    },
    KA210: {
        name: 'Small-Scale Partnerships',
        description: 'Simpler partnerships for newcomers and small organisations',
        minPartners: 2,
        maxPartners: null,
        minDurationMonths: 6,
        maxDurationMonths: 24,
        budgetOptions: [30000, 60000],
        coordinatorMinYears: 1,
        thirdCountryCanCoordinate: false,
        excludedCountries: ['Belarus'],
        mainDeadline: '5 March',
        secondDeadline: '1 October',
        requiredDocuments: [
            'Grant Application Form',
            'Organisation ID (OID)'
        ]
    },
    KA131: {
        name: 'Higher Education Student and Staff Mobility',
        description: 'Mobility for higher education students and staff',
        minDurationMonths: null,
        maxDurationMonths: null,
        requiresECHE: true,
        requiredDocuments: [
            'ECHE (Erasmus Charter for Higher Education)',
            'Learning Agreement',
            'Transcript of Records'
        ]
    },
    KA151: {
        name: 'Youth Mobility',
        description: 'Mobility projects for young people and youth workers',
        minAge: 13,
        maxAge: 30,
        requiredDocuments: [
            'Youthpass',
            'Activity Report'
        ]
    }
} as const;

export const TRAVEL_COSTS_2026 = {
    green: {
        '10-99': 56,
        '100-499': 285,
        '500-1999': 417,
        '2000-2999': 535,
        '3000-3999': 785,
        '4000-7999': 1188,
        '8000+': 1735
    },
    standard: {
        '10-99': 28,
        '100-499': 211,
        '500-1999': 309,
        '2000-2999': 395,
        '3000-3999': 580,
        '4000-7999': 1188,
        '8000+': 1735
    }
} as const;

export const SUBSISTENCE_COSTS_2026 = {
    staff: {
        group1: { min: 107, max: 191 },
        group2: { min: 95, max: 169 },
        group3: { min: 84, max: 148 }
    },
    vetLearner: {
        group1: { min: 48, max: 127 },
        group2: { min: 41, max: 110 },
        group3: { min: 36, max: 93 }
    }
} as const;

export const COUNTRY_GROUPS = {
    group1: ['Denmark', 'Finland', 'Iceland', 'Ireland', 'Luxembourg', 'Sweden', 'United Kingdom', 'Liechtenstein', 'Norway'],
    group2: ['Austria', 'Belgium', 'Cyprus', 'France', 'Germany', 'Greece', 'Italy', 'Malta', 'Netherlands', 'Portugal', 'Spain'],
    group3: ['Bulgaria', 'Croatia', 'Czech Republic', 'Estonia', 'Hungary', 'Latvia', 'Lithuania', 'Macedonia', 'Poland', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Turkey']
} as const;
