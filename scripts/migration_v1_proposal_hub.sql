-- ============================================
-- EUProjectHub — Proposal Hub Migration v1
-- ============================================

-- ============================================
-- ORGANISATIONS REGISTRY
-- ============================================

CREATE TABLE IF NOT EXISTS org_registry (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Legal identity
  oid text UNIQUE,                    -- EU Organisation ID (e.g. E10215346)
  pic text,                           -- Legacy PIC number
  legal_name text NOT NULL,
  legal_name_en text,
  acronym text,
  country text NOT NULL,
  city text,
  region text,
  address text,
  website text,
  email text,
  phone text,
  
  -- Legal status
  is_public_body boolean DEFAULT false,
  is_nonprofit boolean DEFAULT false,
  org_type text,                      -- school, HEI, VET provider, NGO, local authority, etc.
  established_date date,
  legal_rep_name text,
  legal_rep_title text,
  legal_rep_email text,
  
  -- Erasmus credentials
  eche_number text,
  eche_expiry date,
  accreditation_code text,
  accreditation_field text,           -- VET, SCH, ADU, YOU
  accreditation_expiry date,
  accreditation_type text,            -- individual, consortium_coordinator
  
  -- Profile
  fields_of_activity text[],          -- ['education','youth','vet','sport']
  num_learners integer,
  num_teaching_staff integer,
  num_non_teaching_staff integer,
  num_volunteers integer,
  years_erasmus_experience integer,
  brief_presentation text,            -- 200 words — reused in proposals
  main_activities_description text,   -- 500 words — reused in proposals
  fewer_opportunities_experience boolean DEFAULT false,
  fewer_opportunities_description text,
  
  -- Stats (auto-updated)
  proposals_as_coordinator integer DEFAULT 0,
  proposals_as_partner integer DEFAULT 0,
  grants_as_coordinator integer DEFAULT 0,
  grants_as_partner integer DEFAULT 0,
  
  -- Meta
  is_preferred_partner boolean DEFAULT false,
  is_associated_partner boolean DEFAULT false,
  internal_notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSALS
-- ============================================

CREATE TABLE IF NOT EXISTS proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  title text NOT NULL,
  title_en text,
  form_group text NOT NULL,           -- A,B,C,D,E,F,G,H,I,J
  action_code text NOT NULL,          -- KA122-VET, KA220-SCH, KA152-YOU etc.
  call_year integer DEFAULT 2026,
  round integer DEFAULT 1,
  national_agency text,
  language text DEFAULT 'EN',
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN (
    'draft','in_review','ready','submitted','under_evaluation',
    'approved','rejected','withdrawn'
  )),
  
  -- Key dates
  deadline date,
  submitted_at timestamptz,
  decision_date date,
  project_start_date date,
  project_end_date date,
  project_duration_months integer,
  
  -- Submission tracking
  form_id text,                       -- e.g. KA220-SCH-0393EA4E (from eForm)
  submission_id text,
  
  -- Budget
  lump_sum integer,                   -- for lump sum actions
  requested_budget numeric,
  
  -- If approved
  awarded_amount numeric,
  project_number text,                -- official EC project number
  converted_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  
  -- If rejected
  rejection_reason text,
  evaluator_total_score integer,
  evaluator_scores jsonb,             -- {relevance: 18, quality: 22, ...}
  
  -- Version tracking
  version integer DEFAULT 1,
  parent_proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
  
  -- Progress
  completion_pct integer DEFAULT 0,   -- 0-100
  
  -- Meta
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL SECTIONS (Q&A per question)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  
  section_key text NOT NULL,          -- e.g. 'context', 'project_summary', 'relevance'
  question_key text NOT NULL,         -- e.g. 'motivation', 'objectives', 'innovation'
  question_text text NOT NULL,        -- the actual question from the form
  answer text,                        -- the written answer
  answer_en text,                     -- English translation if required
  
  char_limit integer,                 -- max characters for this field (from form)
  is_required boolean DEFAULT true,
  is_complete boolean DEFAULT false,
  ai_generated boolean DEFAULT false, -- was this AI-drafted?
  last_ai_draft text,                 -- save last AI draft separately
  
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(proposal_id, section_key, question_key)
);

-- ============================================
-- PROPOSAL ORGANISATIONS (link table)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_orgs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  org_registry_id uuid REFERENCES org_registry(id) ON DELETE CASCADE,
  
  role text NOT NULL CHECK (role IN ('coordinator','partner','associated')),
  is_newcomer boolean DEFAULT false,
  org_type_in_proposal text,          -- may differ from registry
  
  -- Task allocation
  task_description text,              -- what does this org do in the project?
  wps_involved text[],                -- which work packages?
  
  -- For KA1 mobility flows
  is_sending boolean DEFAULT false,
  is_receiving boolean DEFAULT false,
  
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL WORK PACKAGES (KA220 / KA210)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_workpackages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  
  wp_number integer NOT NULL,         -- 1, 2, 3...
  title text NOT NULL,
  is_management boolean DEFAULT false, -- WP1 is always management
  grant_allocated numeric DEFAULT 0,
  
  -- Questions
  specific_objectives text,
  main_results text,
  qualitative_indicators text,
  quantitative_indicators text,
  partner_tasks text,
  cost_effectiveness text,
  
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL ACTIVITIES
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  wp_id uuid REFERENCES proposal_workpackages(id) ON DELETE SET NULL,
  
  activity_number integer NOT NULL,
  title text NOT NULL,
  activity_type text,                 -- job shadowing, youth exchange, training, etc.
  venue_country text,
  venue_city text,
  start_date date,
  end_date date,
  duration_days integer,
  
  leading_org_id uuid REFERENCES proposal_orgs(id) ON DELETE SET NULL,
  grant_allocated numeric DEFAULT 0,
  
  -- Questions
  content_description text,
  target_group text,
  contribution_to_objectives text,
  expected_results text,
  cost_justification text,
  
  -- For mobility activities
  num_participants integer,
  num_accompanying integer,
  
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL MOBILITY FLOWS (KA1 actions)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_mobility_flows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES proposal_activities(id) ON DELETE CASCADE,
  
  flow_number integer NOT NULL,
  sending_country text,
  receiving_country text,
  participant_type text,              -- staff, learner, youth, youth_worker, sport_staff
  num_participants integer DEFAULT 0,
  num_fewer_opportunities integer DEFAULT 0,
  duration_days integer,
  distance_km integer,
  green_travel boolean DEFAULT false,
  
  -- Budget (auto-calculated)
  org_support_eur numeric DEFAULT 0,
  travel_eur numeric DEFAULT 0,
  individual_support_eur numeric DEFAULT 0,
  inclusion_support_org_eur numeric DEFAULT 0,
  inclusion_support_participants_eur numeric DEFAULT 0,
  linguistic_support_eur numeric DEFAULT 0,
  prep_visit_eur numeric DEFAULT 0,
  total_eur numeric DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL TASKS (assign work to users)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  section_id uuid REFERENCES proposal_sections(id) ON DELETE SET NULL,
  
  title text NOT NULL,
  description text,
  form_group text,                    -- which form group this relates to
  section_key text,                   -- which section
  question_key text,                  -- which specific question
  
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  due_date date,
  
  status text DEFAULT 'todo' CHECK (status IN (
    'todo','in_progress','in_review','done'
  )),
  priority text DEFAULT 'medium' CHECK (priority IN (
    'low','medium','high','urgent'
  )),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL TASK COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_task_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES proposal_tasks(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL FEEDBACK (from funding body after rejection)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  
  feedback_source text,               -- 'NA', 'EACEA', 'evaluator'
  total_score integer,
  max_score integer DEFAULT 100,
  passed_threshold boolean,
  
  -- Scores per criterion
  score_relevance integer,
  score_quality integer,
  score_partnership integer,
  score_impact integer,
  score_other jsonb,
  
  -- Text feedback
  general_comments text,
  strengths text,
  weaknesses text,
  recommendations text,
  
  -- File upload
  feedback_file_url text,
  feedback_file_name text,
  
  uploaded_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now()
);

-- ============================================
-- PROPOSAL VERSIONS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb,                     -- full JSON snapshot of proposal at this version
  change_summary text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- QUESTION TEMPLATES (updatable per year)
-- ============================================

CREATE TABLE IF NOT EXISTS proposal_question_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_group text NOT NULL,           -- A,B,C,D,E,F,G,H,I,J
  action_codes text[],                -- which action codes use this template
  section_key text NOT NULL,
  question_key text NOT NULL,
  question_text text NOT NULL,
  question_hint text,                 -- helper text shown below the field
  char_limit integer,
  is_required boolean DEFAULT true,
  requires_en_translation boolean DEFAULT false,
  field_type text DEFAULT 'textarea', -- textarea, text, select, date, number, boolean
  options jsonb,                      -- for select fields
  sort_order integer DEFAULT 0,
  call_year integer DEFAULT 2026,
  
  UNIQUE(form_group, section_key, question_key, call_year)
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE org_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_workpackages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_mobility_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_question_templates ENABLE ROW LEVEL SECURITY;

-- Org registry: visible to all in same org
CREATE POLICY "Org members read org_registry" ON org_registry FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = org_registry.organization_id));
CREATE POLICY "Org members write org_registry" ON org_registry FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = org_registry.organization_id));

-- Proposals: visible to org members
CREATE POLICY "Org members read proposals" ON proposals FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = proposals.organization_id));
CREATE POLICY "Org members write proposals" ON proposals FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = proposals.organization_id));

-- Proposal sub-tables: inherit via proposal
CREATE POLICY "Org members read proposal_sections" ON proposal_sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_sections.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members write proposal_sections" ON proposal_sections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_sections.proposal_id AND pr.id = auth.uid()));

-- Same pattern for all proposal sub-tables
CREATE POLICY "Org members all proposal_orgs" ON proposal_orgs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_orgs.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_workpackages" ON proposal_workpackages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_workpackages.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_activities" ON proposal_activities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_activities.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_mobility_flows" ON proposal_mobility_flows FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_mobility_flows.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_tasks" ON proposal_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_tasks.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_task_comments" ON proposal_task_comments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_task_comments.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_feedback" ON proposal_feedback FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_feedback.proposal_id AND pr.id = auth.uid()));
CREATE POLICY "Org members all proposal_versions" ON proposal_versions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM proposals p JOIN profiles pr ON pr.organization_id = p.organization_id WHERE p.id = proposal_versions.proposal_id AND pr.id = auth.uid()));

-- Question templates: public read
CREATE POLICY "Public read question_templates" ON proposal_question_templates FOR SELECT USING (true);
CREATE POLICY "Super admin write question_templates" ON proposal_question_templates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- ============================================
-- SEED QUESTION TEMPLATES
-- ============================================

-- FORM GROUP A: KA122-VET/SCH/ADU
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, question_hint, char_limit, requires_en_translation, sort_order, call_year) VALUES
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'project_summary', 'background', 'Background: Why did you apply for this project?', 'Describe the context and motivation. What problems are you addressing?', 1000, true, 1, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'project_summary', 'objectives', 'Objectives: What do you want to achieve by implementing the project?', 'Be concrete and realistic. Link to your organisation needs.', 1000, true, 2, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'project_summary', 'results', 'Results: What results do you expect your project to have?', 'Describe tangible outputs and outcomes.', 1000, true, 3, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'background', 'main_activities', 'What are your organisation''s main activities? What learning programmes do you offer?', 'If working in multiple fields, specify which programmes belong to this field.', 2000, false, 10, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'background', 'field_activities', 'What are your organisation''s activities in the field of this application?', 'Focus specifically on the field stated in the Context section.', 1500, false, 11, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'background', 'learner_profiles', 'Describe the learners concerned by your organisation''s daily work. What are their profiles and age groups? Do you work with participants with fewer opportunities?', 'Be specific about age ranges and any special needs groups you serve.', 1500, false, 12, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'background', 'experience', 'How many years of experience does your organisation have in this field? What is the size of your organisation?', 'Include number of learners and staff working in this field only.', 500, false, 13, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'objectives', 'needs_challenges', 'What are the most important needs and challenges your organisation is currently facing? How can an Erasmus+ mobility project help improve your organisation for the benefit of all its learners?', 'Illustrate with concrete examples. Be specific about the gap you want to fill.', 3000, false, 20, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'follow_up', 'organisational_development', 'How will the activities implemented contribute to the development of your organisation?', 'Describe lasting changes beyond the individual participants.', 1500, false, 40, 2026),
('A', ARRAY['KA122-VET','KA122-SCH','KA122-ADU'], 'follow_up', 'results_sharing', 'How will you share the results of the project with the wider public and within the Erasmus community?', 'Mention platforms like EPALE, School Education Gateway, social media, events.', 1000, false, 41, 2026);

-- FORM GROUP B: KA120-VET/SCH/ADU/YOU
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, question_hint, char_limit, requires_en_translation, sort_order, call_year) VALUES
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'main_activities', 'What are your organisation''s main activities (in everyday work, outside of Erasmus+)?', 'Describe what your organisation does on a daily basis.', 2000, false, 10, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'qualification_role', 'What is your organisation''s role in the education/training system that qualifies you for Erasmus accreditation?', 'Refer to the eligibility criteria in the call.', 1500, false, 11, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'learner_profiles', 'What profiles and ages of learners are concerned by your work?', 'Be specific about age ranges, educational levels and any disadvantaged groups.', 1000, false, 12, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'experience', 'How many years of experience does your organisation have in this role?', null, 300, false, 13, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'structure', 'Describe the structure of your organisation. Are there different sections or departments? How is management and supervision set up? Who are the key persons in charge?', 'Include an organisation chart in annexes if possible.', 2000, false, 14, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'background', 'needs_challenges', 'What are the most important needs and challenges your organisation is currently facing? How can your organisation be improved to benefit its learners?', 'Illustrate with concrete examples. These needs should directly motivate your Erasmus Plan objectives.', 3000, false, 15, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_objectives', 'plan_duration', 'Please indicate the duration of your Erasmus Plan (2-5 years).', 'Choose a realistic timeframe for achieving your objectives.', null, false, 20, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_objectives', 'preparation_process', 'Who were the persons involved in defining your Erasmus Plan objectives? What kind of discussions or preparation took place?', 'Show that this is an organisation-wide commitment, not just one person''s initiative.', 1500, false, 30, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'management_structure', 'How will your organisation manage the Erasmus activities? Describe the roles and responsibilities.', 'Who is the Erasmus coordinator? How are decisions made?', 2000, false, 40, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'resources', 'What resources (staff, budget, facilities) will you dedicate to the Erasmus activities?', 'Be realistic about what your organisation can sustain.', 1000, false, 41, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'challenges', 'How will you handle potential challenges such as staff turnover or organisational changes?', 'Show resilience planning.', 1000, false, 42, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'sustainability', 'How will you ensure the long-term sustainability of Erasmus activities in your organisation?', 'How will Erasmus become embedded in regular operations?', 1000, false, 43, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'wider_involvement', 'How will you involve the wider organisation — staff, learners, management — in Erasmus activities?', 'Beyond just the participants: how does the whole organisation benefit?', 1000, false, 44, 2026),
('B', ARRAY['KA120-VET','KA120-SCH','KA120-ADU','KA120-YOU'], 'erasmus_plan_management', 'results_sharing', 'How will you share results and experiences within your organisation and with the outside world?', 'Describe internal and external dissemination plans.', 1000, false, 45, 2026);

-- FORM GROUP D: KA152-YOU Youth Exchanges
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, question_hint, char_limit, requires_en_translation, sort_order, call_year) VALUES
('D', ARRAY['KA152-YOU'], 'project_summary', 'objectives', 'What do you want to achieve by implementing the project? What are the objectives from a youth work perspective?', 'Focus on non-formal learning outcomes and EU Youth Goals.', 1500, true, 1, 2026),
('D', ARRAY['KA152-YOU'], 'project_summary', 'activities', 'What activities do you plan to implement? What is the number and profile of participants involved?', 'Describe activity types, countries, and participant ages/backgrounds.', 1500, true, 2, 2026),
('D', ARRAY['KA152-YOU'], 'project_summary', 'results', 'What results and impact do you expect your project to have?', 'Learning outcomes, changes in participants, impact on organisations.', 1000, true, 3, 2026),
('D', ARRAY['KA152-YOU'], 'project_rationale', 'needs_objectives', 'Why do you want to carry out this project? Describe the issues and needs you want to address and your project''s objectives.', 'What problem does this Youth Exchange solve? Who needs it and why?', 3000, false, 10, 2026),
('D', ARRAY['KA152-YOU'], 'project_rationale', 'erasmus_link', 'How does your project link to the objectives of the Erasmus programme and those of Youth Exchanges?', 'Reference specific Erasmus+ and Youth Exchange objectives.', 1500, false, 11, 2026),
('D', ARRAY['KA152-YOU'], 'project_rationale', 'participant_impact', 'How will your project benefit the young participants involved, during and after the project lifetime?', 'What will they learn? How will it change them?', 2000, false, 12, 2026),
('D', ARRAY['KA152-YOU'], 'project_rationale', 'org_impact', 'How will your project benefit the participating organisations during and after project lifetime?', 'What capacity does each organisation gain?', 1500, false, 13, 2026),
('D', ARRAY['KA152-YOU'], 'project_rationale', 'wider_impact', 'What would be the impact of your project beyond the participants and organisations (local/regional/national/European)?', 'Think about the wider community and policy level.', 1500, false, 14, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'preparation', 'How will you prepare participants before the activity (intercultural, linguistic, risk-prevention) and support them during and after?', 'Describe pre-departure training, on-site support, and post-activity reflection.', 2000, false, 20, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'safety', 'What measures will you put in place to ensure the safety and protection of participants?', 'Insurance, emergency contacts, safeguarding procedures, risk assessment.', 1500, false, 21, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'follow_up', 'What activities are foreseen after the end of the Youth Exchange? How will participants follow up?', 'Local action projects, sharing sessions, alumni networks.', 1000, false, 22, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'learning_outcomes', 'How will you support participants to be aware of what they have learned? Will your project use Youthpass or Europass?', 'Describe methods for reflection and documentation during daily programme.', 1500, false, 23, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'fewer_opportunities', 'Are participants involved facing challenges that hinder their participation? Describe.', 'Geographical, economic, social, cultural, health barriers.', 1000, false, 24, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'virtual_blended', 'Do you foresee virtual/blended activities or virtual components before/during/after the activity?', 'Online preparation, virtual collaboration, follow-up digital activities.', 800, false, 25, 2026),
('D', ARRAY['KA152-YOU'], 'project_design', 'green_practices', 'Will you include sustainable and environmental-friendly practices in your activities?', 'Green travel, sustainable venue, environmental theme in programme.', 800, false, 26, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'management', 'How will you manage the project and ensure it is in line with the Erasmus Youth Quality Standards?', 'Partnership agreements, communication plans, quality control.', 2000, false, 30, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'logistics', 'How will you organise the practical and logistical part (travel, accommodation, insurance, visa, mentoring, preparatory meetings)?', 'Be specific about who is responsible for what.', 1500, false, 31, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'partnerships', 'How and why did you choose your project partners? What experiences and competences will they bring? How will you communicate and coordinate?', 'Show complementarity and previous relationship if any.', 2000, false, 32, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'evaluation', 'How will you evaluate your project''s success? Which activities will assess whether objectives and results were reached?', 'Questionnaires, focus groups, Youthpass self-assessment, partner feedback.', 1500, false, 33, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'sustainability', 'What will you do to ensure effects continue after the project ends? Plans to make results useful to others?', 'Publications, toolkits, follow-up projects, community legacy.', 1500, false, 34, 2026),
('D', ARRAY['KA152-YOU'], 'project_management', 'dissemination', 'How will you make your project visible? How will you share results? With whom? How will participants be involved?', 'Social media, local press, events, Youthpass, School Education Gateway, EPALE.', 1500, false, 35, 2026);

-- FORM GROUP E: KA153-YOU Youth Worker Mobility
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, sort_order, call_year) VALUES
('E', ARRAY['KA153-YOU'], 'project_summary', 'objectives', 'What do you want to achieve? What are the objectives from a youth work perspective?', 1, 2026),
('E', ARRAY['KA153-YOU'], 'project_summary', 'activities', 'What activities do you plan? Number and profile of youth workers involved?', 2, 2026),
('E', ARRAY['KA153-YOU'], 'project_summary', 'results', 'What results and impact do you expect?', 3, 2026),
('E', ARRAY['KA153-YOU'], 'project_rationale', 'needs_objectives', 'Why do you want to carry out this project? What issues and needs in youth work do you address?', 10, 2026),
('E', ARRAY['KA153-YOU'], 'project_rationale', 'worker_impact', 'How will your project benefit the youth workers who participate, during and after the project lifetime?', 11, 2026),
('E', ARRAY['KA153-YOU'], 'project_rationale', 'org_impact', 'How will it benefit participating organisations?', 12, 2026),
('E', ARRAY['KA153-YOU'], 'project_rationale', 'sector_impact', 'Impact on youth work sector at local/regional/national/European level?', 13, 2026),
('E', ARRAY['KA153-YOU'], 'project_design', 'preparation', 'How will you prepare participants and support them during and after the activity?', 20, 2026),
('E', ARRAY['KA153-YOU'], 'project_design', 'professional_application', 'How will youth workers apply learning in their professional practice after the mobility?', 21, 2026),
('E', ARRAY['KA153-YOU'], 'project_design', 'org_integration', 'How will the organisations integrate the learning outcomes into their work?', 22, 2026),
('E', ARRAY['KA153-YOU'], 'project_management', 'management', 'How will you manage the project and ensure quality?', 30, 2026),
('E', ARRAY['KA153-YOU'], 'project_management', 'partnerships', 'How and why did you choose your partners? What competences do they bring?', 31, 2026),
('E', ARRAY['KA153-YOU'], 'project_management', 'evaluation', 'How will you evaluate success?', 32, 2026),
('E', ARRAY['KA153-YOU'], 'project_management', 'sustainability', 'How will effects continue after the project ends?', 33, 2026),
('E', ARRAY['KA153-YOU'], 'project_management', 'dissemination', 'How will you share results?', 34, 2026);

-- FORM GROUP F: KA154-YOU Youth Participation
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, sort_order, call_year) VALUES
('F', ARRAY['KA154-YOU'], 'project_summary', 'objectives', 'Objectives: What do you want to achieve?', 1, 2026),
('F', ARRAY['KA154-YOU'], 'project_summary', 'implementation', 'Implementation: What activities will you implement?', 2, 2026),
('F', ARRAY['KA154-YOU'], 'project_summary', 'results', 'Results: What results do you expect?', 3, 2026),
('F', ARRAY['KA154-YOU'], 'project_description', 'participation_aims', 'What does your project aim to achieve in terms of youth participation and active citizenship?', 10, 2026),
('F', ARRAY['KA154-YOU'], 'project_description', 'young_people_profile', 'Who are the young people involved? What are their profiles and how were they selected?', 11, 2026),
('F', ARRAY['KA154-YOU'], 'project_description', 'design_involvement', 'How were young people involved in designing and planning the project?', 12, 2026),
('F', ARRAY['KA154-YOU'], 'project_description', 'activities_planned', 'What specific participation activities are planned?', 13, 2026),
('F', ARRAY['KA154-YOU'], 'project_description', 'democratic_contribution', 'How will the project contribute to the democratic participation of young people?', 14, 2026),
('F', ARRAY['KA154-YOU'], 'impact', 'measurement', 'How will you measure if objectives were achieved?', 20, 2026),
('F', ARRAY['KA154-YOU'], 'impact', 'long_term', 'What is the expected long-term impact on participants and democratic life?', 21, 2026),
('F', ARRAY['KA154-YOU'], 'impact', 'results_sharing', 'How will results be shared?', 22, 2026);

-- FORM GROUP G: KA182-SPO Sport Mobility
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, sort_order, call_year) VALUES
('G', ARRAY['KA182-SPO'], 'project_summary', 'background', 'Background: Why did you apply for this project?', 1, 2026),
('G', ARRAY['KA182-SPO'], 'project_summary', 'objectives', 'Objectives: What do you want to achieve?', 2, 2026),
('G', ARRAY['KA182-SPO'], 'project_summary', 'results', 'Results: What results do you expect?', 3, 2026),
('G', ARRAY['KA182-SPO'], 'background', 'sport_activities', 'What are your organisation''s main activities in the sport field?', 10, 2026),
('G', ARRAY['KA182-SPO'], 'background', 'grassroots_role', 'What is your organisation''s role in grassroots sport?', 11, 2026),
('G', ARRAY['KA182-SPO'], 'background', 'beneficiaries', 'Who are the participants/beneficiaries of your sport activities?', 12, 2026),
('G', ARRAY['KA182-SPO'], 'objectives', 'needs_challenges', 'What needs and challenges does your sport organisation face? How can Erasmus+ help?', 20, 2026),
('G', ARRAY['KA182-SPO'], 'follow_up', 'org_development', 'How will these activities contribute to the development of your sport organisation?', 30, 2026),
('G', ARRAY['KA182-SPO'], 'follow_up', 'results_sharing', 'How will you share results within the sport community and wider public?', 31, 2026);

-- FORM GROUP I: KA210 Small-Scale Partnerships
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, char_limit, sort_order, call_year) VALUES
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'objectives_results', 'What are the concrete objectives you would like to achieve and outcomes/results you would like to realise? How are these linked to the priorities you selected?', 3000, 10, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'target_groups', 'Please outline the target groups of your project and describe their identified needs.', 1500, 11, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'motivation', 'Please describe the motivation for your project and explain why it should be funded.', 2000, 12, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'needs_addressed', 'How does the project address the needs and goals of participating organisations and target groups?', 1500, 13, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'transnational_benefits', 'What will be the benefits of cooperating with transnational partners to achieve project objectives?', 1500, 14, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_description', 'horizontal_priorities', 'How does the project address the horizontal priorities? (inclusion, sustainability, digital, civic engagement)', 1500, 15, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'cooperation', 'partnership_formation', 'How was the partnership formed? What strengths does each partner bring to the project?', 2000, 20, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'cooperation', 'management_communication', 'How will you ensure sound management and good cooperation and communication between partners?', 1500, 21, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'cooperation', 'erasmus_platforms', 'Please describe how you will use Erasmus+ platforms for preparation, implementation or follow-up of your project.', 1000, 22, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'cooperation', 'task_allocation', 'Please describe the tasks and responsibilities of each partner organisation in the project.', 2000, 23, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'impact', 'measurement', 'How will you know if the project has achieved its objectives? How will you measure it?', 1500, 30, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'impact', 'sustainability', 'How will participation contribute to organisations'' long-term development? Plans to continue after end?', 1500, 31, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'impact', 'results_use', 'Describe your plans for sharing and use of project results.', 1500, 32, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'impact', 'dissemination', 'How will you make results known (within partnership, local communities, wider public)? Who are the main target groups to share with?', 1500, 33, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'impact', 'other_beneficiaries', 'Are there other groups or organisations that will benefit from your project? How?', 1000, 34, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_summary', 'objectives', 'Objectives: What do you want to achieve by implementing the project?', 1000, 40, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_summary', 'implementation', 'Implementation: What activities are you going to implement?', 1000, 41, 2026),
('I', ARRAY['KA210-VET','KA210-SCH','KA210-ADU','KA210-YOU'], 'project_summary', 'results', 'Results: What results do you expect your project to have?', 1000, 42, 2026);

-- FORM GROUP J: KA220 Cooperation Partnerships
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, char_limit, sort_order, call_year) VALUES
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'project_summary', 'objectives', 'Objectives: What do you want to achieve by implementing the project?', 1500, 1, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'project_summary', 'implementation', 'Implementation: What activities are you going to implement?', 1500, 2, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'project_summary', 'results', 'Results: What project results and other outcomes do you expect your project to have?', 1500, 3, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'priorities_addressed', 'How does the project address the selected priorities?', 2000, 10, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'motivation', 'Please describe the motivation for your project and explain why it should be funded.', 3000, 11, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'objectives_results', 'What objectives and concrete results do you want to produce? How are these linked to selected priorities?', 3000, 12, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'innovation', 'What makes your proposal innovative?', 2000, 13, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'synergies', 'How does your proposal create synergies between different fields of education, training, youth and sport?', 2000, 14, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'european_added_value', 'How does the proposal bring European added value through results that would not be attained in a single country?', 2000, 15, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'followup_previous', 'Does this project represent a follow-up to a previous Erasmus+ project?', 1000, 16, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'other_instruments', 'Is this a follow-up to projects funded under other EU/national/regional instruments?', 1000, 17, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'synergy_other', 'Is the project in synergy with other initiatives or funding instruments?', 1000, 18, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'needs', 'What needs do you want to address by implementing your project?', 2000, 19, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'target_groups', 'What are the target groups? How do participating organisations engage with target groups in their activities?', 2000, 20, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'needs_identification', 'How did you identify the needs of your partnership and target groups?', 1500, 21, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'relevance', 'needs_addressed_how', 'How will this project address these needs?', 1500, 22, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'partnership', 'formation', 'How did you form your partnership? How does the mix of organisations complement each other?', 3000, 30, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'partnership', 'associated_partners', 'If applicable: list and describe associated partners and their added value to the project.', 1500, 31, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'partnership', 'task_allocation', 'What is the task allocation and how does it reflect the commitment and active contribution of all organisations?', 2000, 32, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'partnership', 'coordination', 'Describe the mechanism for coordination and communication between participating organisations.', 1500, 33, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'impact', 'assessment', 'How are you going to assess if the project objectives have been achieved?', 2000, 40, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'impact', 'sustainability', 'Explain how you will ensure the sustainability of the project.', 2000, 41, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'impact', 'dissemination', 'How do you plan to disseminate the results of the project?', 2000, 42, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'impact', 'impact_level', 'At which level will results generate impact?', 500, 43, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'impact', 'impact_explanation', 'Please explain in what way the expected results will generate impact at the chosen level(s).', 2000, 44, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'monitoring', 'How will the progress, quality and achievement of project activities be monitored?', 2000, 50, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'budget_control', 'How will you ensure proper budget control and time management in your project?', 1500, 51, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'risk_management', 'What are your plans for handling risks for project implementation?', 1500, 52, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'inclusion', 'How will you ensure that activities are designed in an accessible and inclusive way?', 1000, 53, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'digital_tools', 'How does the project incorporate digital tools and learning methods?', 1000, 54, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'green_practices', 'How does the project incorporate green practices in different project phases?', 1000, 55, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_management', 'civic_engagement', 'How does the project encourage participation and civic engagement?', 1000, 56, 2026);

-- Per-WP questions (stored as template, instantiated per WP when created)
INSERT INTO proposal_question_templates (form_group, action_codes, section_key, question_key, question_text, sort_order, call_year) VALUES
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_objectives', 'What are the specific objectives of this work package and how do they contribute to the general project objectives?', 10, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_results', 'What will be the main results of this work package?', 11, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_qualitative_indicators', 'What qualitative indicators will you use to measure the level of achievement of objectives and quality of results?', 12, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_quantitative_indicators', 'What quantitative indicators will you use to measure the level of achievement of objectives and quality of results?', 13, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_partner_tasks', 'Please describe the tasks and responsibilities of each partner organisation in this work package.', 14, 2026),
('J', ARRAY['KA220-VET','KA220-SCH','KA220-ADU','KA220-YOU','KA220-HED'], 'wp_template', 'wp_cost_effectiveness', 'How did you determine the amount allocated to this work package? How did you verify that it is cost-effective?', 15, 2026);
