"use client";

import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Loader2, X, Plus, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';

interface OrgResult {
  name: string;
  pic: string;
  city: string;
  country: string;
  noOfProjects: number;
  validationStatus: string;
  url: string;
}

interface OrgLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (org: OrgResult & { vat?: string; registrationNum?: string; erasmusCode?: string }) => void;
}

const COUNTRIES: Record<string, string> = {
  '20001026': 'Türkiye',
  '20002629': 'Germany',
  '20002703': 'France', 
  '20002856': 'Spain',
  '20002951': 'Italy',
  '20003260': 'Poland',
  '20001230': 'Belgium',
  '20001623': 'Netherlands',
  '20002781': 'Portugal',
  '20002390': 'Greece',
  '20001239': 'Bulgaria',
  '20002501': 'Romania',
  '20001490': 'Croatia',
  '20002614': 'Czechia',
  '20001571': 'Denmark',
  '20001665': 'Estonia',
  '20001727': 'Finland',
  '20001781': 'Hungary',
  '20001887': 'Ireland',
  '20001966': 'Latvia',
  '20002039': 'Lithuania',
  '20002073': 'Luxembourg',
  '20002131': 'Malta',
  '20002285': 'Austria',
  '20002455': 'Slovakia',
  '20002467': 'Slovenia',
  '20002521': 'Sweden',
  '20001118': 'North Macedonia',
  '20002175': 'Norway',
  '20002196': 'Iceland',
  '20001883': 'Serbia',
  '20002417': 'Albania',
};

export function OrgLookupModal({ isOpen, onClose, onSelect }: OrgLookupModalProps) {
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | 'tr'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrgResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const searchOrgs = async (searchQuery: string, p: number, isLoadMore = false) => {
    if (!searchQuery.trim()) return;
    
    if (isLoadMore) setFetchingMore(true);
    else setLoading(true);

    try {
      const countryCode = countryFilter === 'tr' ? '20001026' : undefined;
      
      const res = await fetch(
        `https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA_PERSON&text=${encodeURIComponent(searchQuery)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: countryCode
            ? `pageSize=20&pageNumber=${p}&language=en&query=${encodeURIComponent(JSON.stringify({
                bool: { must: [{ term: { country: countryCode } }] }
              }))}`
            : `pageSize=20&pageNumber=${p}&language=en`,
        }
      );

      const data = await res.json();
      const mappedResults = (data.results || []).map((r: any) => {
        const countryCode = r.metadata?.country?.[0] || '';
        return {
          name: r.summary,
          pic: r.metadata?.pic?.[0] || '',
          city: r.metadata?.city?.[0] || '',
          country: COUNTRIES[countryCode] || countryCode,
          noOfProjects: parseInt(r.metadata?.noOfProjects?.[0] || '0'),
          validationStatus: r.metadata?.validationStatus?.[0] || '',
          url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${r.metadata?.pic?.[0]}`,
        };
      });

      if (isLoadMore) {
        setResults(prev => [...prev, ...mappedResults]);
      } else {
        setResults(mappedResults);
        setTotal(data.totalResults);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    searchOrgs(query, 1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchOrgs(query, nextPage, true);
  };

  const handleSelect = async (org: OrgResult) => {
    setLoading(true);
    try {
      // Fetch extra document details if PIC exists
      let extraData = {};
      if (org.pic) {
        const docRes = await fetch(`https://api.tech.ec.europa.eu/search-api/prod/rest/document/${org.pic}?apiKey=SEDIA_PERSON`);
        const docData = await docRes.json();
        
        if (docData && docData.metadata) {
          extraData = {
            vat: docData.metadata.vat?.[0] || '',
            registrationNum: docData.metadata.registrationNum?.[0] || '',
            erasmusCode: docData.metadata.erasmusCode?.[0] || '',
          };
        }
      }
      
      onSelect({ ...org, ...extraData });
      onClose();
    } catch (err) {
      console.error('Failed to fetch extra details:', err);
      // Still select the basic org data if extra fails
      onSelect(org);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">Search Organisation Database</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Search by name, OID (E12345678) or PIC (9 digits)</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Section */}
        <div className="p-8 bg-gray-50/50 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder="Name, OID or PIC..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex gap-2">
            <button 
              onClick={() => setCountryFilter('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${countryFilter === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              All countries
            </button>
            <button 
              onClick={() => setCountryFilter('tr')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${countryFilter === 'tr' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-200'}`}
            >
              Türkiye only
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-white">
          {loading && !results.length ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
              <Loader2 size={40} className="animate-spin text-orange-500" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Accessing EC Database...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{total} organisations found</span>
              </div>
              
              <div className="grid gap-4">
                {results.map((res, i) => (
                  <div 
                    key={`${res.pic}-${i}`}
                    className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 border-4 border-white">
                        {res.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{res.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-gray-400">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {res.city}, {res.country}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="flex items-center gap-1"><Globe size={10} /> PIC: {res.pic}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-blue-500">{res.noOfProjects} funded projects</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <a 
                        href={res.url}
                        target="_blank"
                        className="flex-1 md:flex-none p-4 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                        <span className="md:hidden text-xs font-black">Portal</span>
                      </a>
                      <button 
                        onClick={() => handleSelect(res)}
                        className="flex-[2] md:flex-none px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Select <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {results.length < total && (
                <div className="pt-8 flex justify-center">
                  <button 
                    onClick={loadMore}
                    disabled={fetchingMore}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {fetchingMore ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Load more results
                  </button>
                </div>
              )}
            </>
          ) : query && !loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search size={32} className="text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">No organisations found matching "{query}"</p>
              <button 
                onClick={() => { setQuery(''); setResults([]); }}
                className="text-xs text-orange-500 font-black hover:underline uppercase tracking-widest"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 text-gray-300">
               <div className="w-20 h-20 bg-gray-50/50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-gray-100">
                <Globe size={32} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">Search to access live data from the EC Portal</p>
            </div>
          )}
        </div>
        
        {/* Footer Hint */}
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" /> Official EU SEDIA Registry Data
          </p>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FGEBF0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FED7AA; }
      `}</style>
    </div>
  );
}
