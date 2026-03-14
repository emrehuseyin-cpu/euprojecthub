// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ErasmusAction {
  id: string;
  code: string;
  name_en: string;
  key_action: 'KA1' | 'KA2' | 'KA3' | 'JM';
  managing_body: 'NA' | 'EACEA' | 'BOTH';
  field: string[];
  min_partners: number | null;
  max_partners: number | null;
  min_countries: number;
  requires_eche: boolean;
  requires_accreditation: boolean;
  coordinator_must_be_eu: boolean;
  min_experience_years: number | null;
  eligible_org_types: string[] | null;
  excluded_countries: string[];
  open_to_third_countries: boolean;
  min_duration_months: number | null;
  max_duration_months: number | null;
  budget_type: 'lump_sum' | 'unit_cost' | 'budget_based' | 'mixed';
  budget_options: number[] | null;
  min_budget_eur: number | null;
  max_budget_eur: number | null;
  funding_rate_pct: number;
  max_management_pct: number;
  max_subcontracting_pct: number;
  deadline_round1: string | null;
  deadline_round2: string | null;
  deadline_time: string;
  project_start_round1: string | null;
  project_start_round2: string | null;
  min_total_score: number | null;
  max_total_score: number;
  call_id: string | null;
  description: string;
  key_features: string[];
  eligible_activities: string[];
  project_phases: string[];
  year: number;
}

export interface TravelCostBand {
  min_km: number;
  max_km: number;
  green_eur: number;
  non_green_eur: number;
  note: string;
}

export interface CountryGroup {
  country: string;
  group_number: 1 | 2 | 3;
  group_label: string;
  staff_min_eur_day: number;
  staff_max_eur_day: number;
  vet_learner_min_eur_day: number;
  vet_learner_max_eur_day: number;
  school_pupil_min_eur_day: number;
  school_pupil_max_eur_day: number;
  adult_learner_min_eur_day: number;
  adult_learner_max_eur_day: number;
}

export interface YouthDailyRate {
  country: string;
  youth_exchange_eur_day: number;
  youth_worker_eur_day: number;
}

export interface AwardCriterion {
  id: string;
  action_code: string;
  criterion_name: string;
  max_score: number;
  min_score: number;
  description: string;
  sort_order: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BudgetResult {
  action_code: string;
  budget_type: string;
  selected_lump_sum?: number;
  organisational_support?: number;
  travel_costs?: number;
  individual_support?: number;
  inclusion_support?: number;
  preparatory_visits?: number;
  linguistic_support?: number;
  course_fees?: number;
  exceptional_costs?: number;
  total_eu_grant: number;
  max_eu_grant: number;
  funding_rate_pct: number;
  co_financing_required: number;
  notes: string[];
}

// ─────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────

export async function getAllActions(supabase: any): Promise<ErasmusAction[]> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('*')
    .eq('year', 2026)
    .order('key_action')
    .order('code');
  if (error) throw error;
  return data || [];
}

export async function getActionByCode(supabase: any, code: string): Promise<ErasmusAction | null> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('*')
    .eq('code', code)
    .single();
  if (error) return null;
  return data;
}

export async function getActionsByKeyAction(supabase: any, ka: 'KA1' | 'KA2' | 'KA3' | 'JM'): Promise<ErasmusAction[]> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('*')
    .eq('key_action', ka)
    .order('code');
  if (error) throw error;
  return data || [];
}

export async function getActionsByManagingBody(supabase: any, body: 'NA' | 'EACEA'): Promise<ErasmusAction[]> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('*')
    .eq('managing_body', body)
    .order('key_action')
    .order('code');
  if (error) throw error;
  return data || [];
}

export async function getActionsByField(supabase: any, field: string): Promise<ErasmusAction[]> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('*')
    .contains('field', [field])
    .order('key_action')
    .order('code');
  if (error) throw error;
  return data || [];
}

export async function getTravelCosts(supabase: any): Promise<TravelCostBand[]> {
  const { data, error } = await supabase
    .from('erasmus_travel_costs')
    .select('*')
    .order('min_km');
  if (error) throw error;
  return data || [];
}

export async function getCountryGroups(supabase: any): Promise<CountryGroup[]> {
  const { data, error } = await supabase
    .from('erasmus_country_groups')
    .select('*')
    .order('group_number')
    .order('country');
  if (error) throw error;
  return data || [];
}

export async function getCountryByName(supabase: any, country: string): Promise<CountryGroup | null> {
  const { data, error } = await supabase
    .from('erasmus_country_groups')
    .select('*')
    .ilike('country', country)
    .single();
  if (error) return null;
  return data;
}

export async function getYouthDailyRates(supabase: any): Promise<YouthDailyRate[]> {
  const { data, error } = await supabase
    .from('erasmus_youth_daily_rates')
    .select('*')
    .order('country');
  if (error) throw error;
  return data || [];
}

export async function getAwardCriteria(supabase: any, actionCode: string): Promise<AwardCriterion[]> {
  const { data, error } = await supabase
    .from('erasmus_award_criteria')
    .select('*')
    .eq('action_code', actionCode)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function getUpcomingDeadlines(supabase: any): Promise<Array<{
  code: string;
  name_en: string;
  deadline: string;
  managing_body: string;
  days_until: number;
  round: number;
}>> {
  const { data, error } = await supabase
    .from('erasmus_actions')
    .select('code, name_en, deadline_round1, deadline_round2, managing_body')
    .eq('year', 2026);
  if (error) throw error;

  const monthMap: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3,
    May: 4, June: 5, July: 6, August: 7,
    September: 8, October: 9, November: 10, December: 11,
  };

  const results: any[] = [];
  const today = new Date();

  for (const action of data || []) {
    for (const [roundKey, round] of [['deadline_round1', 1], ['deadline_round2', 2]] as const) {
      const raw = action[roundKey];
      if (!raw) continue;
      const parts = raw.split(' ');
      if (parts.length < 2) continue;
      const day = parseInt(parts[0]);
      const month = monthMap[parts[1]];
      if (isNaN(day) || month === undefined) continue;
      const deadline = new Date(2026, month, day);
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0) {
        results.push({
          code: action.code,
          name_en: action.name_en,
          deadline: raw + ' 2026',
          managing_body: action.managing_body,
          days_until: daysUntil,
          round: Number(round),
        });
      }
    }
  }

  return results.sort((a, b) => a.days_until - b.days_until);
}

// ─────────────────────────────────────────────
// TRAVEL COST CALCULATOR
// ─────────────────────────────────────────────

export function calculateTravelGrant(
  distanceKm: number,
  isGreen: boolean,
  bands: TravelCostBand[]
): number {
  const band = bands.find(b => distanceKm >= b.min_km && distanceKm <= b.max_km);
  if (!band) return 0;
  return isGreen ? band.green_eur : band.non_green_eur;
}

// ─────────────────────────────────────────────
// BUDGET CALCULATOR
// ─────────────────────────────────────────────

export function calculateLumpSumBudget(params: {
  action: ErasmusAction;
  selected_lump_sum: number;
  duration_months: number;
}): BudgetResult {
  const { action, selected_lump_sum, duration_months } = params;
  const notes: string[] = [];

  if (action.budget_options && !action.budget_options.includes(selected_lump_sum)) {
    notes.push(`⚠️ Selected amount not in allowed options: ${action.budget_options.map(o => '€' + o.toLocaleString()).join(' / ')}`);
  }

  const mgmt_cap = Math.round(selected_lump_sum * (action.max_management_pct / 100));
  notes.push(`Max project management work package: ${action.max_management_pct}% = €${mgmt_cap.toLocaleString()}`);
  notes.push(`Max subcontracting: ${action.max_subcontracting_pct}% = €${Math.round(selected_lump_sum * action.max_subcontracting_pct / 100).toLocaleString()}`);
  notes.push('Co-financing required: total project cost must exceed the EU grant amount');
  notes.push('Full payment requires completion of all work packages to stated quality');
  notes.push('Results must be published on the Erasmus+ Project Results Platform');

  if (action.min_total_score) {
    notes.push(`Minimum score to pass evaluation: ${action.min_total_score}/100 points`);
  }

  return {
    action_code: action.code,
    budget_type: 'lump_sum',
    selected_lump_sum,
    total_eu_grant: selected_lump_sum,
    max_eu_grant: action.max_budget_eur || selected_lump_sum,
    funding_rate_pct: action.funding_rate_pct,
    co_financing_required: Math.round(selected_lump_sum * 0.2),
    notes,
  };
}

export type ParticipantType =
  | 'vet_learner_short'
  | 'vet_learner_long'
  | 'school_pupil_short'
  | 'school_pupil_long'
  | 'adult_learner_short'
  | 'adult_learner_long'
  | 'staff'
  | 'youth'
  | 'youth_worker'
  | 'sport_staff';

const ORG_SUPPORT_RATES: Record<ParticipantType, number> = {
  vet_learner_short: 350,
  vet_learner_long: 500,  // ErasmusPro 90-365 days
  school_pupil_short: 350,
  school_pupil_long: 500,
  adult_learner_short: 350,
  adult_learner_long: 500,
  staff: 350,
  youth: 125,
  youth_worker: 125,
  sport_staff: 350,
};

export function calculateUnitCostBudget(params: {
  action: ErasmusAction;
  participants: number;
  participant_type: ParticipantType;
  avg_duration_days: number;
  avg_distance_km: number;
  green_travel_pct: number;  // 0 to 1
  receiving_country: CountryGroup;
  participants_fewer_opportunities?: number;
  preparatory_visits?: number;
  linguistic_support_participants?: number;
  course_fees_days?: number;
  travel_bands: TravelCostBand[];
}): BudgetResult {
  const {
    action, participants, participant_type, avg_duration_days,
    avg_distance_km, green_travel_pct, receiving_country,
    participants_fewer_opportunities = 0,
    preparatory_visits = 0,
    linguistic_support_participants = 0,
    course_fees_days = 0,
    travel_bands,
  } = params;

  const notes: string[] = [];

  // Org support
  const org_rate = ORG_SUPPORT_RATES[participant_type] || 350;
  const organisational_support = participants * org_rate;
  notes.push(`Organisational support: ${participants} × €${org_rate} = €${organisational_support.toLocaleString()}`);

  // Travel
  const green_count = Math.round(participants * green_travel_pct);
  const non_green_count = participants - green_count;
  const green_grant = calculateTravelGrant(avg_distance_km, true, travel_bands);
  const non_green_grant = calculateTravelGrant(avg_distance_km, false, travel_bands);
  const travel_costs = (green_count * green_grant) + (non_green_count * non_green_grant);
  notes.push(`Travel: ${green_count} green (€${green_grant}) + ${non_green_count} non-green (€${non_green_grant}) at ${avg_distance_km}km`);

  // Individual support — use midpoint of range
  let daily_rate_base = 0;
  if (participant_type === 'staff' || participant_type === 'sport_staff' || participant_type === 'youth_worker') {
    daily_rate_base = Math.round((receiving_country.staff_min_eur_day + receiving_country.staff_max_eur_day) / 2);
  } else if (participant_type.includes('vet')) {
    daily_rate_base = Math.round((receiving_country.vet_learner_min_eur_day + receiving_country.vet_learner_max_eur_day) / 2);
  } else if (participant_type.includes('school')) {
    daily_rate_base = Math.round((receiving_country.school_pupil_min_eur_day + receiving_country.school_pupil_max_eur_day) / 2);
  } else if (participant_type.includes('adult')) {
    daily_rate_base = Math.round((receiving_country.adult_learner_min_eur_day + receiving_country.adult_learner_max_eur_day) / 2);
  } else {
    // youth — look up separately, use approximate
    daily_rate_base = 65;
  }

  // First 14 days: full rate; after 14 days: 70%
  const days_full = Math.min(avg_duration_days, 14);
  const days_reduced = Math.max(0, avg_duration_days - 14);
  const daily_cost = (days_full * daily_rate_base) + (days_reduced * Math.round(daily_rate_base * 0.7));
  const individual_support = participants * daily_cost;
  notes.push(`Individual support: ${participants} × €${daily_rate_base}/day for ${days_full} days + ${days_reduced} days at 70%`);
  notes.push(`Receiving country group: ${receiving_country.group_number} (${receiving_country.group_label})`);

  // Inclusion support
  const inclusion_support = participants_fewer_opportunities * 125;
  if (participants_fewer_opportunities > 0) {
    notes.push(`Inclusion support (org): ${participants_fewer_opportunities} × €125 = €${inclusion_support.toLocaleString()}`);
    notes.push('Additional inclusion support for participants (real costs) — submit separately');
  }

  // Preparatory visits
  const prep_visit_costs = preparatory_visits * 680;
  if (preparatory_visits > 0) {
    notes.push(`Preparatory visits: ${preparatory_visits} × €680 = €${prep_visit_costs.toLocaleString()} (max 3 persons per visit)`);
  }

  // Linguistic support
  const ling_support = linguistic_support_participants * 150;
  if (linguistic_support_participants > 0) {
    notes.push(`Linguistic support: ${linguistic_support_participants} × €150`);
  }

  // Course fees (staff courses & training only)
  const c_fees = course_fees_days * 80;
  if (course_fees_days > 0) {
    notes.push(`Course fees: ${course_fees_days} days × €80 (note: max 50% of total grant for courses)`);
  }

  const total =
    organisational_support +
    travel_costs +
    individual_support +
    inclusion_support +
    prep_visit_costs +
    ling_support +
    c_fees;

  return {
    action_code: action.code,
    budget_type: 'unit_cost',
    organisational_support,
    travel_costs,
    individual_support,
    inclusion_support,
    preparatory_visits: prep_visit_costs,
    linguistic_support: ling_support,
    course_fees: c_fees,
    total_eu_grant: total,
    max_eu_grant: action.max_budget_eur || total,
    funding_rate_pct: action.funding_rate_pct,
    co_financing_required: Math.round(total * 0.2),
    notes,
  };
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

export async function validateProject(
  supabase: any,
  params: {
    action_code: string;
    num_partners: number;
    num_countries: number;
    duration_months: number;
    requested_budget: number;
    has_eche?: boolean;
    has_accreditation?: boolean;
    has_third_country_partner?: boolean;
    includes_belarus?: boolean;
  }
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const action = await getActionByCode(supabase, params.action_code);
  if (!action) return { valid: false, errors: ['Action code not found in database'], warnings: [] };

  if (action.min_partners && params.num_partners < action.min_partners)
    errors.push(`Minimum ${action.min_partners} partner organisations required (you have ${params.num_partners}).`);
  if (action.max_partners && params.num_partners > action.max_partners)
    errors.push(`Maximum ${action.max_partners} partners allowed (you have ${params.num_partners}).`);
  if (action.min_countries && params.num_countries < action.min_countries)
    errors.push(`Partners must come from at least ${action.min_countries} different eligible countries.`);
  if (action.min_duration_months && params.duration_months < action.min_duration_months)
    errors.push(`Minimum project duration is ${action.min_duration_months} months.`);
  if (action.max_duration_months && params.duration_months > action.max_duration_months)
    errors.push(`Maximum project duration is ${action.max_duration_months} months.`);
  if (action.min_budget_eur && params.requested_budget < action.min_budget_eur)
    errors.push(`Minimum grant for this action is €${action.min_budget_eur.toLocaleString()}.`);
  if (action.max_budget_eur && params.requested_budget > action.max_budget_eur)
    errors.push(`Maximum EU grant is €${action.max_budget_eur.toLocaleString()}.`);
  if (action.budget_type === 'lump_sum' && action.budget_options?.length) {
    if (!action.budget_options.includes(params.requested_budget))
      errors.push(`Budget must be one of the predefined lump sums: ${action.budget_options.map(o => '€' + o.toLocaleString()).join(' / ')}.`);
  }
  if (action.requires_eche && !params.has_eche)
    errors.push('All EU/associated HEIs must hold a valid Erasmus Charter for Higher Education (ECHE).');
  if (action.requires_accreditation && !params.has_accreditation)
    errors.push('A valid Erasmus Accreditation is required before applying for this action.');
  if (params.includes_belarus)
    errors.push('Mobility activities to/from Belarus are NOT eligible under any Erasmus+ action.');
  if (!action.open_to_third_countries && params.has_third_country_partner)
    warnings.push('Third country partners: check eligibility carefully — this action has restrictions for non-EU/associated countries.');
  if (action.coordinator_must_be_eu)
    warnings.push('The project coordinator must be established in an EU Member State or third country associated to the Programme.');
  if (action.managing_body === 'EACEA')
    warnings.push('This is a central call managed by EACEA in Brussels — apply via the EU Funding & Tenders Portal, not via your National Agency.');
  if (action.deadline_round1)
    warnings.push(`Submission deadline: ${action.deadline_round1} 2026 at ${action.deadline_time}.`);

  return { valid: errors.length === 0, errors, warnings };
}