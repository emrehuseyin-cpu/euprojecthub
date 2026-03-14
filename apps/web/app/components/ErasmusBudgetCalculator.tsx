'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  getAllActions, getCountryGroups, getTravelCosts, getAwardCriteria,
  validateProject, calculateLumpSumBudget, calculateUnitCostBudget,
  ErasmusAction, CountryGroup, TravelCostBand, AwardCriterion, BudgetResult,
} from '@euprojecthub/core/src/erasmus/actions';

export default function ErasmusBudgetCalculator({ preSelectedCode }: { preSelectedCode?: string }) {
  const [actions, setActions]         = useState<ErasmusAction[]>([]);
  const [countries, setCountries]     = useState<CountryGroup[]>([]);
  const [travelBands, setTravelBands] = useState<TravelCostBand[]>([]);
  const [loading, setLoading]         = useState(true);

  const [selectedCode, setSelectedCode]       = useState('');
  const [selectedAction, setSelectedAction]   = useState<ErasmusAction | null>(null);
  const [criteria, setCriteria]               = useState<AwardCriterion[]>([]);
  const [result, setResult]                   = useState<BudgetResult | null>(null);
  const [validation, setValidation]           = useState<any>(null);
  const [activeTab, setActiveTab]             = useState<'info' | 'budget' | 'criteria' | 'activities'>('info');

  useEffect(() => {
    if (preSelectedCode && actions.length > 0) {
      setSelectedCode(preSelectedCode);
    }
  }, [preSelectedCode, actions]);

  // Budget form state
  const [lumpSum, setLumpSum]               = useState(0);
  const [participants, setParticipants]     = useState(10);
  const [ptType, setPtType]                 = useState<any>('vet_learner_short');
  const [durationDays, setDurationDays]     = useState(14);
  const [durationMonths, setDurationMonths] = useState(24);
  const [distanceKm, setDistanceKm]         = useState(1000);
  const [greenPct, setGreenPct]             = useState(50);
  const [receivingCountry, setReceivingCountry] = useState('');
  const [fewerOpp, setFewerOpp]             = useState(0);
  const [prepVisits, setPrepVisits]         = useState(0);
  const [lingParticipants, setLingParticipants] = useState(0);

  // Validation form state
  const [vPartners, setVPartners]   = useState(3);
  const [vCountries, setVCountries] = useState(3);
  const [vBudget, setVBudget]       = useState(120000);
  const [vEche, setVEche]           = useState(false);
  const [vAccred, setVAccred]       = useState(false);

  useEffect(() => {
    Promise.all([
      getAllActions(supabase),
      getCountryGroups(supabase),
      getTravelCosts(supabase),
    ]).then(([a, c, t]) => {
      setActions(a);
      setCountries(c);
      setTravelBands(t);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCode) { setSelectedAction(null); return; }
    const action = actions.find(a => a.code === selectedCode) || null;
    setSelectedAction(action);
    setResult(null);
    setValidation(null);
    setCriteria([]);
    if (action) {
      getAwardCriteria(supabase, action.code).then(setCriteria);
      if (action.budget_options?.length) setLumpSum(action.budget_options[0]);
      if (action.min_duration_months) setDurationMonths(action.min_duration_months);
    }
  }, [selectedCode]);

  const grouped = actions.reduce<Record<string, ErasmusAction[]>>((acc, a) => {
    if (!acc[a.key_action]) acc[a.key_action] = [];
    acc[a.key_action].push(a);
    return acc;
  }, {});

  const KA_LABELS: Record<string, string> = {
    KA1: 'Learning Mobility of Individuals',
    KA2: 'Cooperation among Organisations',
    KA3: 'Support to Policy Development',
    JM:  'Jean Monnet Actions',
  };

  function handleCalculate() {
    if (!selectedAction) return;
    if (selectedAction.budget_type === 'lump_sum') {
      setResult(calculateLumpSumBudget({
        action: selectedAction,
        selected_lump_sum: lumpSum,
        duration_months: durationMonths,
      }));
    } else if (selectedAction.budget_type === 'unit_cost') {
      const cg = countries.find(c => c.country.toLowerCase() === receivingCountry.toLowerCase());
      if (!cg) { alert('Please select a valid receiving country from the list.'); return; }
      setResult(calculateUnitCostBudget({
        action: selectedAction,
        participants,
        participant_type: ptType,
        avg_duration_days: durationDays,
        avg_distance_km: distanceKm,
        green_travel_pct: greenPct / 100,
        receiving_country: cg,
        participants_fewer_opportunities: fewerOpp,
        preparatory_visits: prepVisits,
        linguistic_support_participants: lingParticipants,
        travel_bands: travelBands,
      }));
    }
  }

  async function handleValidate() {
    if (!selectedAction) return;
    const v = await validateProject(supabase, {
      action_code: selectedAction.code,
      num_partners: vPartners,
      num_countries: vCountries,
      duration_months: durationMonths,
      requested_budget: selectedAction.budget_type === 'lump_sum' ? lumpSum : result?.total_eu_grant || 0,
      has_eche: vEche,
      has_accreditation: vAccred,
    });
    setValidation(v);
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Selector */}
      <div className="bg-white border rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Erasmus+ Action
        </label>
        <select
          value={selectedCode}
          onChange={e => setSelectedCode(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">— Choose a programme action —</option>
          {Object.entries(grouped).map(([ka, acts]) => (
            <optgroup key={ka} label={`${ka} — ${KA_LABELS[ka] || ka}`}>
              {acts.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.name_en}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {selectedAction && (
        <>
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">{selectedAction.key_action}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {selectedAction.managing_body === 'EACEA' ? '🏛️ EACEA Brussels' : '🏠 National Agency'}
                  </span>
                  {selectedAction.requires_eche && (
                    <span className="text-xs bg-yellow-400/30 border border-yellow-300/50 px-2 py-1 rounded">ECHE Required</span>
                  )}
                  {selectedAction.requires_accreditation && (
                    <span className="text-xs bg-yellow-400/30 border border-yellow-300/50 px-2 py-1 rounded">Accreditation Required</span>
                  )}
                </div>
                <h2 className="text-xl font-bold">{selectedAction.name_en}</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedAction.code}</p>
              </div>
              {selectedAction.deadline_round1 && (
                <div className="text-right shrink-0 ml-4">
                  <div className="text-xs text-blue-200 mb-1">Round 1 Deadline</div>
                  <div className="text-lg font-bold">{selectedAction.deadline_round1} 2026</div>
                  {selectedAction.deadline_round2 && (
                    <div className="text-xs text-blue-200">Round 2: {selectedAction.deadline_round2}</div>
                  )}
                  <div className="text-xs text-blue-200 mt-0.5">{selectedAction.deadline_time}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              {selectedAction.min_partners && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Min Partners</div>
                  <div className="font-bold text-lg">{selectedAction.min_partners}</div>
                </div>
              )}
              {selectedAction.min_countries && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Min Countries</div>
                  <div className="font-bold text-lg">{selectedAction.min_countries}</div>
                </div>
              )}
              {selectedAction.min_duration_months && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Duration</div>
                  <div className="font-bold text-lg">{selectedAction.min_duration_months}–{selectedAction.max_duration_months}m</div>
                </div>
              )}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs text-blue-200">EU Funding Rate</div>
                <div className="font-bold text-lg">{selectedAction.funding_rate_pct}%</div>
              </div>
              {selectedAction.max_budget_eur && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Max EU Grant</div>
                  <div className="font-bold text-lg">€{(selectedAction.max_budget_eur/1000).toFixed(0)}K</div>
                </div>
              )}
              {selectedAction.budget_options && (
                <div className="bg-white/10 rounded-lg p-3 col-span-2 md:col-span-1">
                  <div className="text-xs text-blue-200">Lump Sums</div>
                  <div className="font-bold text-sm">{selectedAction.budget_options.map(o => '€' + (o/1000) + 'K').join(' / ')}</div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="flex border-b">
              {(['info', 'budget', 'criteria', 'activities'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'info' ? 'Overview' : tab === 'criteria' ? 'Award Criteria' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* TAB: INFO */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAction.description}</p>

                  {selectedAction.key_features?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Rules & Features</h3>
                      <ul className="space-y-1.5">
                        {selectedAction.key_features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAction.project_phases?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Project Phases</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedAction.project_phases.map((p, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 border px-3 py-1.5 rounded-full text-gray-700">{p}</span>
                            {i < selectedAction.project_phases.length - 1 && (
                              <span className="text-gray-300">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAction.call_id && (
                    <div className="bg-gray-50 border rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500">Call ID: </span>
                      <span className="text-xs font-mono text-gray-700">{selectedAction.call_id}</span>
                    </div>
                  )}

                  {selectedAction.excluded_countries?.includes('Belarus') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      🚫 Mobility activities to/from <strong>Belarus</strong> are not eligible under this action.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: BUDGET */}
              {activeTab === 'budget' && (
                <div className="space-y-6">
                  {/* Lump sum inputs */}
                  {selectedAction.budget_type === 'lump_sum' && (
                    <div className="space-y-4">
                      {selectedAction.budget_options && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Select Lump Sum</label>
                          <div className="flex gap-3 flex-wrap">
                            {selectedAction.budget_options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setLumpSum(opt)}
                                className={`px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                  lumpSum === opt
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                €{opt.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Duration (months)</label>
                          <input type="number" value={durationMonths}
                            onChange={e => setDurationMonths(+e.target.value)}
                            min={selectedAction.min_duration_months || 1}
                            max={selectedAction.max_duration_months || 999}
                            className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Unit cost inputs */}
                  {selectedAction.budget_type === 'unit_cost' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Number of Participants</label>
                        <input type="number" value={participants} min={1}
                          onChange={e => setParticipants(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Participant Type</label>
                        <select value={ptType} onChange={e => setPtType(e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500">
                          <option value="staff">Staff (teaching/training)</option>
                          <option value="vet_learner_short">VET Learner — Short-term (&lt;90d)</option>
                          <option value="vet_learner_long">VET Learner — ErasmusPro (90-365d)</option>
                          <option value="school_pupil_short">School Pupil — Short-term</option>
                          <option value="school_pupil_long">School Pupil — Long-term (30-365d)</option>
                          <option value="adult_learner_short">Adult Learner — Short-term</option>
                          <option value="adult_learner_long">Adult Learner — Long-term</option>
                          <option value="youth">Youth Exchange Participant</option>
                          <option value="youth_worker">Youth Worker (PDA)</option>
                          <option value="sport_staff">Sport Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Average Stay Duration (days)</label>
                        <input type="number" value={durationDays} min={1}
                          onChange={e => setDurationDays(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">From 15th day: 70% rate applies</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Average Travel Distance (km, one-way)</label>
                        <input type="number" value={distanceKm} min={10}
                          onChange={e => setDistanceKm(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">Below 500km → green travel mandatory</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Green Travel Percentage</label>
                        <div className="flex items-center gap-3">
                          <input type="range" value={greenPct} min={0} max={100}
                            onChange={e => setGreenPct(+e.target.value)}
                            className="flex-1" />
                          <span className="text-sm font-medium w-12 text-right">{greenPct}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Receiving Country</label>
                        <select value={receivingCountry}
                          onChange={e => setReceivingCountry(e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500">
                          <option value="">— Select country —</option>
                          {[1, 2, 3].map(g => (
                            <optgroup key={g} label={`Group ${g} — ${['Higher','Medium','Lower'][g-1]} living costs`}>
                              {countries.filter(c => c.group_number === g).map(c => (
                                <option key={c.country} value={c.country}>{c.country}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Participants with Fewer Opportunities</label>
                        <input type="number" value={fewerOpp} min={0}
                          onChange={e => setFewerOpp(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">€125/participant inclusion support</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Preparatory Visit Participants</label>
                        <input type="number" value={prepVisits} min={0} max={3}
                          onChange={e => setPrepVisits(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">€680/person, max 3 per visit</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Linguistic Support Participants</label>
                        <input type="number" value={lingParticipants} min={0}
                          onChange={e => setLingParticipants(+e.target.value)}
                          className="border rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">€150/participant (if OLS unavailable)</p>
                      </div>
                    </div>
                  )}

                  {/* Budget not calculable */}
                  {selectedAction.budget_type === 'budget_based' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                      <p className="font-medium">Budget-based grant</p>
                      <p className="mt-1">This action uses a detailed budget table linked to work packages and partner shares. The grant is fixed by EACEA after evaluation of your estimated budget. Fill in the application form's budget calculator on the EU Funding & Tenders Portal.</p>
                      {selectedAction.max_budget_eur && (
                        <p className="mt-2 font-medium">Maximum EU grant: €{selectedAction.max_budget_eur.toLocaleString()}</p>
                      )}
                    </div>
                  )}

                  {/* Calculate button */}
                  {selectedAction.budget_type !== 'budget_based' && (
                    <button
                      onClick={handleCalculate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
                    >
                      Calculate Budget Estimate
                    </button>
                  )}

                  {/* Result */}
                  {result && (
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-50 border-b p-4">
                        <h3 className="font-semibold text-gray-900">Budget Estimate</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Indicative — final amounts set by National Agency or EACEA</p>
                      </div>
                      <div className="p-4 space-y-3">
                        {result.organisational_support != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Organisational Support</span>
                            <span className="font-medium">€{Math.round(result.organisational_support).toLocaleString()}</span>
                          </div>
                        )}
                        {result.travel_costs != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Travel Costs</span>
                            <span className="font-medium">€{Math.round(result.travel_costs).toLocaleString()}</span>
                          </div>
                        )}
                        {result.individual_support != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Individual Support (subsistence)</span>
                            <span className="font-medium">€{Math.round(result.individual_support).toLocaleString()}</span>
                          </div>
                        )}
                        {result.inclusion_support != null && result.inclusion_support > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Inclusion Support (org)</span>
                            <span className="font-medium">€{Math.round(result.inclusion_support).toLocaleString()}</span>
                          </div>
                        )}
                        {result.preparatory_visits != null && result.preparatory_visits > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Preparatory Visits</span>
                            <span className="font-medium">€{Math.round(result.preparatory_visits).toLocaleString()}</span>
                          </div>
                        )}
                        {result.linguistic_support != null && result.linguistic_support > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Linguistic Support</span>
                            <span className="font-medium">€{Math.round(result.linguistic_support).toLocaleString()}</span>
                          </div>
                        )}

                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Estimated EU Grant</span>
                            <span className="text-2xl font-bold text-blue-700">
                              €{Math.round(result.total_eu_grant).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Funding rate: {result.funding_rate_pct}%</span>
                            <span>Co-financing required: ~€{Math.round(result.co_financing_required).toLocaleString()}</span>
                          </div>
                        </div>

                        {result.notes?.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs font-medium text-gray-500 cursor-pointer">Calculation notes</summary>
                            <ul className="mt-2 space-y-1">
                              {result.notes.map((n, i) => (
                                <li key={i} className="text-xs text-gray-500 flex gap-2">
                                  <span className="shrink-0">ℹ️</span>{n}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation section */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Eligibility Check</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Number of Partners</label>
                        <input type="number" value={vPartners} min={1}
                          onChange={e => setVPartners(+e.target.value)}
                          className="border rounded-lg p-2 w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Number of Countries</label>
                        <input type="number" value={vCountries} min={1}
                          onChange={e => setVCountries(+e.target.value)}
                          className="border rounded-lg p-2 w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Requested Budget (€)</label>
                        <input type="number" value={vBudget}
                          onChange={e => setVBudget(+e.target.value)}
                          className="border rounded-lg p-2 w-full text-sm" />
                      </div>
                      {selectedAction.requires_eche && (
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={vEche} onChange={e => setVEche(e.target.checked)} />
                          We have a valid ECHE
                        </label>
                      )}
                      {selectedAction.requires_accreditation && (
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={vAccred} onChange={e => setVAccred(e.target.checked)} />
                          We have Erasmus Accreditation
                        </label>
                      )}
                    </div>
                    <button
                      onClick={handleValidate}
                      className="w-full border-2 border-blue-500 text-blue-600 font-medium py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                    >
                      Check Eligibility
                    </button>
                    {validation && (
                      <div className="mt-3 space-y-2">
                        {validation.valid && validation.errors.length === 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                            ✅ No eligibility issues detected. Review warnings below.
                          </div>
                        )}
                        {validation.errors.map((e: string, i: number) => (
                          <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            ❌ {e}
                          </div>
                        ))}
                        {validation.warnings.map((w: string, i: number) => (
                          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                            ⚠️ {w}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CRITERIA */}
              {activeTab === 'criteria' && (
                <div className="space-y-4">
                  {criteria.length === 0 ? (
                    <p className="text-sm text-gray-500">Award criteria not available for this action. Refer to the Programme Guide.</p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {criteria.map(c => (
                          <div key={c.id} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-800">{c.criterion_name}</span>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Min: <strong>{c.min_score}</strong></span>
                                <span>Max: <strong className="text-blue-700">{c.max_score}</strong></span>
                              </div>
                            </div>
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                                style={{ width: `${c.max_score}%` }}
                              />
                              <div
                                className="absolute top-0 h-full border-r-2 border-red-400"
                                style={{ left: `${c.min_score}%` }}
                                title={`Minimum: ${c.min_score}`}
                              />
                            </div>
                            {c.description && (
                              <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      {selectedAction.min_total_score && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                          <span className="font-medium text-blue-800">Minimum total score to pass: </span>
                          <span className="font-bold text-blue-700">{selectedAction.min_total_score}/{selectedAction.max_total_score} points</span>
                          <span className="text-blue-600"> AND minimum 50% per criterion</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB: ACTIVITIES */}
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  {selectedAction.eligible_activities?.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedAction.eligible_activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 border rounded-lg">
                          <span className="text-blue-500 font-bold shrink-0 text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                          <span className="text-sm text-gray-700">{a}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Refer to the Programme Guide for eligible activities.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}