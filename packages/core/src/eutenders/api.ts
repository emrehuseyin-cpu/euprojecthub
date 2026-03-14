// ─────────────────────────────────────────────────────────
// EU Funding & Tenders Portal — Public REST API
// No auth required. Programme code: 43353764 = Erasmus+
// ─────────────────────────────────────────────────────────

const BASE = 'https://api.tech.ec.europa.eu/search-api/prod/rest';

export interface EUCall {
  identifier: string;
  title: string;
  callIdentifier: string;
  status: string;         // 31094501=open, 31094502=forthcoming, 31094503=closed
  statusLabel: string;
  deadline: string | null;
  programmePeriod: string;
  frameworkProgramme: string;
  url: string;
  budgetTopicAction?: string;
  fundingScheme?: string[];
}

export interface EUOrganisation {
  pic: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  organisationType: string;
  validationStatus: string;
  noOfProjects: number;
  hasPartnerSearch: boolean;
  noOfPartnerSearch: number;
  erasmusCode?: string;
  vat?: string;
  registrationNum?: string;
  url: string;
}

export interface EUProject {
  reference: string;
  title: string;
  acronym?: string;
  startDate?: string;
  endDate?: string;
  totalCost?: number;
  ecMaxContribution?: number;
  programme: string;
  topics?: string[];
  coordinator?: string;
  coordinatorCountry?: string;
  url: string;
}

export interface PartnerSearch {
  name: string;
  country: string;
  topics: string[];
  description?: string;
  url: string;
}

// Status code → human label
const STATUS_LABELS: Record<string, string> = {
  '31094501': 'Open',
  '31094502': 'Forthcoming',
  '31094503': 'Closed',
};

// ─── Search helper ───────────────────────────────────────
async function search(apiKey: string, query: object, pageSize = 10, pageNumber = 1): Promise<any> {
    // In browser context, we'll use our proxy. In server/core context, we might call directly.
    // However, to keep it consistent, we'll implement a flexible fetcher.
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
        const res = await fetch('/api/eu-tenders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, query, pageSize, pageNumber })
        });
        if (!res.ok) throw new Error(`EU Proxy error: ${res.status}`);
        return res.json();
    }

    const body = new URLSearchParams({
        query: JSON.stringify(query),
        pageSize: String(pageSize),
        pageNumber: String(pageNumber),
        language: 'en',
    });

    const res = await fetch(`${BASE}/search?apiKey=${apiKey}&text=*`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!res.ok) throw new Error(`EU API error: ${res.status}`);
    return res.json();
}

// ─── 1. Get Erasmus+ open/forthcoming calls ──────────────
export async function getErasmusCalls(options: {
  status?: 'open' | 'forthcoming' | 'all';
  pageSize?: number;
  pageNumber?: number;
} = {}): Promise<{ total: number; calls: EUCall[] }> {
  const statusCodes = {
    open: ['31094501'],
    forthcoming: ['31094502'],
    all: ['31094501', '31094502'],
  }[options.status || 'all'];

  const data = await search('SEDIA', {
    bool: {
      must: [
        { terms: { type: ['1', '2', '8'] } },
        { terms: { status: statusCodes } },
        { terms: { frameworkProgramme: ['43353764'] } },
      ],
    },
  }, options.pageSize || 20, options.pageNumber || 1);

  const calls: EUCall[] = (data.results || []).map((r: any) => ({
    identifier: r.metadata?.identifier?.[0] || r.reference,
    title: r.metadata?.title?.[0] || r.summary,
    callIdentifier: r.metadata?.callIdentifier?.[0] || '',
    status: r.metadata?.status?.[0] || '',
    statusLabel: STATUS_LABELS[r.metadata?.status?.[0]] || 'Unknown',
    deadline: r.metadata?.deadlineDate?.[0] || null,
    programmePeriod: r.metadata?.programmePeriod?.[0] || '2021 - 2027',
    frameworkProgramme: r.metadata?.frameworkProgrammeName?.[0] || 'Erasmus+',
    url: r.url || '',
    fundingScheme: r.metadata?.fundingScheme || [],
  }));

  return { total: data.totalResults, calls };
}

// ─── 2. Get call details by identifier ──────────────────
export async function getCallDetails(identifier: string): Promise<any> {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
        const res = await fetch('/api/eu-tenders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: 'search', apiKey: 'SEDIA', query: { term: { identifier: identifier } } })
        });
        const data = await res.json();
        return data.results?.[0] || null;
    }

    const res = await fetch(
        `${BASE}/search?apiKey=SEDIA&text="${encodeURIComponent(identifier)}"`,
        { method: 'GET' }
    );
    if (!res.ok) throw new Error(`EU API error: ${res.status}`);
    const data = await res.json();
    return data.results?.[0] || null;
}

// ─── 3. Get organisation by PIC ──────────────────────────
export async function getOrganisationByPIC(pic: string): Promise<EUOrganisation | null> {
  try {
    const isBrowser = typeof window !== 'undefined';
    let data;

    if (isBrowser) {
        const res = await fetch('/api/eu-tenders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: 'document', apiKey: 'SEDIA_PERSON', query: pic })
        });
        if (!res.ok) return null;
        data = await res.json();
    } else {
        const res = await fetch(`${BASE}/document/${pic}?apiKey=SEDIA_PERSON`);
        if (!res.ok) return null;
        data = await res.json();
    }

    const m = data.metadata || {};

    return {
      pic,
      name: data.summary || m.name?.[0] || '',
      city: m.city?.[0] || '',
      country: m.country?.[0] || '',
      countryCode: m.country?.[0] || '',
      organisationType: m.organisationType?.[0] || '',
      validationStatus: m.validationStatus?.[0] || '',
      noOfProjects: parseInt(m.noOfProjects?.[0] || '0'),
      hasPartnerSearch: m.hasPartnerSearch?.[0] === 'true',
      noOfPartnerSearch: parseInt(m.noOfPartnerSearch?.[0] || '0'),
      erasmusCode: m.erasmusCode?.[0],
      vat: m.vat?.[0],
      registrationNum: m.registrationNum?.[0],
      url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${pic}`,
    };
  } catch {
    return null;
  }
}

// ─── 4. Get projects by organisation PIC ─────────────────
export async function getProjectsByOrg(pic: string, pageSize = 10): Promise<{
  total: number;
  projects: EUProject[];
}> {
  const data = await search('SEDIA', {
    bool: {
      must: [
        { terms: { type: ['project'] } },
        { term: { participantPicList: pic } },
      ],
    },
  }, pageSize);

  const projects: EUProject[] = (data.results || []).map((r: any) => ({
    reference: r.reference,
    title: r.metadata?.title?.[0] || r.summary,
    acronym: r.metadata?.acronym?.[0],
    startDate: r.metadata?.startDate?.[0],
    endDate: r.metadata?.endDate?.[0],
    totalCost: parseFloat(r.metadata?.totalCost?.[0] || '0'),
    ecMaxContribution: parseFloat(r.metadata?.ecMaxContribution?.[0] || '0'),
    programme: r.metadata?.frameworkProgrammeName?.[0] || '',
    topics: r.metadata?.topics || [],
    coordinator: r.metadata?.coordinator?.[0],
    coordinatorCountry: r.metadata?.coordinatorCountry?.[0],
    url: r.url || '',
  }));

  return { total: data.totalResults, projects };
}

// ─── 5. Partner search — find orgs looking for partners ──
export async function getPartnerSearches(options: {
  topicIdentifier?: string;
  country?: string;
  pageSize?: number;
} = {}): Promise<{ total: number; partners: PartnerSearch[] }> {
  const must: any[] = [
    { terms: { type: ['ORGANISATION', 'PERSON'] } },
  ];

  if (options.topicIdentifier) {
    must.push({ terms: { topics: [options.topicIdentifier] } });
  } else {
    // Default: partner searches for Erasmus+
    must.push({ terms: { frameworkProgramme: ['43353764'] } });
  }

  const data = await search('SEDIA', { bool: { must } }, options.pageSize || 20);

  const partners: PartnerSearch[] = (data.results || []).map((r: any) => ({
    name: r.summary,
    country: r.metadata?.country?.[0] || '',
    topics: r.metadata?.topics || [],
    description: r.metadata?.description?.[0],
    url: r.url || '',
  }));

  return { total: data.totalResults, partners };
}

// ─── 6. Get funded Erasmus+ projects (results) ───────────
export async function getErasmusProjects(options: {
  keyword?: string;
  country?: string;
  pageSize?: number;
  pageNumber?: number;
} = {}): Promise<{ total: number; projects: EUProject[] }> {
  const must: any[] = [
    { terms: { programmePeriod: ['2021 - 2027'] } },
    { terms: { frameworkProgramme: ['43353764'] } },
  ];

  const data = await search(
    'SEDIA',
    { bool: { must } },
    options.pageSize || 10,
    options.pageNumber || 1
  );

  const projects: EUProject[] = (data.results || []).map((r: any) => ({
    reference: r.reference,
    title: r.metadata?.title?.[0] || r.summary,
    acronym: r.metadata?.acronym?.[0],
    startDate: r.metadata?.startDate?.[0],
    endDate: r.metadata?.endDate?.[0],
    ecMaxContribution: parseFloat(r.metadata?.ecMaxContribution?.[0] || '0'),
    programme: r.metadata?.frameworkProgrammeName?.[0] || 'Erasmus+',
    topics: r.metadata?.topics?.slice(0, 3) || [],
    coordinator: r.metadata?.coordinator?.[0],
    coordinatorCountry: r.metadata?.coordinatorCountry?.[0],
    url: r.url || '',
  }));

  return { total: data.totalResults, projects };
}

// ─── 7. Get grant updates / corrigenda ───────────────────
export async function getErasmusUpdates(pageSize = 10): Promise<any[]> {
  const data = await search('SEDIA', {
    bool: {
      must: [
        { terms: { type: ['6'] } },
        { terms: { frameworkProgramme: ['43353764'] } },
      ],
    },
  }, pageSize);

  return (data.results || []).map((r: any) => ({
    title: r.metadata?.title?.[0] || r.summary,
    date: r.metadata?.es_SortDate?.[0],
    identifier: r.metadata?.callIdentifier?.[0],
    url: r.url,
  }));
}
