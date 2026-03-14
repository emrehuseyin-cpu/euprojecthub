'use client';
import { useState, useCallback } from 'react';
import { Search, X, ExternalLink, Building2, Check } from 'lucide-react';

interface OrgResult {
  name: string;
  pic: string;
  city: string;
  countryCode: string;
  country: string;
  noOfProjects: number;
  validationStatus: string;
}

const COUNTRY_CODES: Record<string, string> = {
  '20001026': 'Türkiye', '20002629': 'Germany', '20002703': 'France',
  '20002856': 'Spain', '20002951': 'Italy', '20003260': 'Poland',
  '20001230': 'Belgium', '20001623': 'Netherlands', '20002781': 'Portugal',
  '20002390': 'Greece', '20001239': 'Bulgaria', '20002614': 'Czechia',
  '20001571': 'Denmark', '20001887': 'Ireland', '20001966': 'Latvia',
  '20002039': 'Lithuania', '20002175': 'Norway', '20001118': 'North Macedonia',
  '20002467': 'Slovenia', '20002455': 'Slovakia', '20002521': 'Sweden',
  '20001490': 'Croatia', '20001727': 'Finland', '20002285': 'Austria',
  '20001665': 'Estonia', '20002131': 'Malta', '20002073': 'Luxembourg',
};

const VALIDATION_LABELS: Record<string, { label: string; color: string }> = {
  '31042521': { label: 'Validated', color: 'text-green-600 bg-green-50' },
  '31042522': { label: 'Pending', color: 'text-amber-600 bg-amber-50' },
  '31042523': { label: 'Not validated', color: 'text-gray-500 bg-gray-50' },
};

export default function OrgSearchModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (org: OrgResult) => void;
}) {
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [results, setResults] = useState<OrgResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      let body = 'pageSize=20&pageNumber=1&language=en';
      if (countryFilter) {
        body += '&query=' + encodeURIComponent(JSON.stringify({
          bool: { must: [{ term: { country: countryFilter } }] }
        }));
      }

      const res = await fetch(
        `https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA_PERSON&text=${encodeURIComponent(query)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        }
      );

      const data = await res.json();
      setTotal(data.totalResults || 0);
      setResults(
        (data.results || []).map((r: any) => ({
          name: r.summary || '',
          pic: r.metadata?.pic?.[0] || '',
          city: r.metadata?.city?.[0] || '',
          countryCode: r.metadata?.country?.[0] || '',
          country: COUNTRY_CODES[r.metadata?.country?.[0]] || r.metadata?.country?.[0] || '',
          noOfProjects: parseInt(r.metadata?.noOfProjects?.[0] || '0'),
          validationStatus: r.metadata?.validationStatus?.[0] || '',
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, countryFilter]);

  async function handleSelect(org: OrgResult) {
    setSelected(org.pic);

    // Fetch extra details from document endpoint
    let extra: any = {};
    try {
      const res = await fetch(
        `https://api.tech.ec.europa.eu/search-api/prod/rest/document/${org.pic}?apiKey=SEDIA_PERSON`
      );
      const d = await res.json();
      const m = d.metadata || {};
      extra = {
        vat: m.vat?.[0],
        registrationNum: m.registrationNum?.[0],
        erasmusCode: m.erasmusCode?.[0],
        legalEntityStatus: m.legalEntityStatus?.[0],
      };
    } catch { /* use what we have */ }

    onSelect({ ...org, ...extra });
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 shadow-2xl"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Search EC Organisation Database</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search area */}
        <div className="px-6 py-4 border-b space-y-3 bg-gray-50/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="Name, OID (E12345678) or PIC (123456789)..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All countries</option>
            {Object.entries(COUNTRY_CODES)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
          </select>

          {searched && !loading && (
            <p className="text-xs text-gray-400">
              {total.toLocaleString()} organisations found
              {countryFilter && ` in ${COUNTRY_CODES[countryFilter]}`}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No organisations found. Try a different search term.
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Search by organisation name, OID or PIC number
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {results.map(org => {
                const validation = VALIDATION_LABELS[org.validationStatus];
                const isSelected = selected === org.pic;
                return (
                  <li key={org.pic}
                    className="px-6 py-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => handleSelect(org)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm leading-snug truncate">
                            {org.name}
                          </p>
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {org.city}{org.country ? `, ${org.country}` : ''}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            PIC {org.pic}
                          </span>
                          {org.noOfProjects > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                              {org.noOfProjects} funded projects
                            </span>
                          )}
                          {validation && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${validation.color}`}>
                              {validation.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a 
                          href={`https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${org.pic}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View on EU Portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={e => { e.stopPropagation(); handleSelect(org); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Data from EU Funding & Tenders Portal
          </p>
          <a 
            href="https://webgate.ec.europa.eu/erasmus-esc/index/organisations/search-for-an-organisation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline font-medium"
          >
            Search Erasmus+ Database ↗
          </a>
        </div>
      </div>
    </div>
  );
}
