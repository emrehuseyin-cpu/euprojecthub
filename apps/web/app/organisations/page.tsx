'use client';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { Search, Plus, ExternalLink, Building2, X, Check, Globe } from 'lucide-react';

const COUNTRIES: Record<string, string> = {
  '20001026':'Türkiye','20002629':'Germany','20002703':'France','20002856':'Spain','20002951':'Italy','20003260':'Poland','20001230':'Belgium','20001623':'Netherlands','20002781':'Portugal','20002390':'Greece',
};

function OrgSearchModal({ open, onClose, onSelect }: any) {
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function doSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      let bodyStr = 'pageSize=20&pageNumber=1&language=en';
      if (countryFilter) {
        bodyStr += '&query=' + encodeURIComponent(JSON.stringify({ bool: { must: [{ term: { country: countryFilter } }] } }));
      }
      const res = await fetch(`https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA_PERSON&text=${encodeURIComponent(query)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyStr
      });
      const data = await res.json();
      setResults((data.results || []).map((r: any) => ({
        name: r.summary || '',
        pic: r.metadata?.pic?.[0] || '',
        city: r.metadata?.city?.[0] || '',
        country: COUNTRIES[r.metadata?.country?.[0]] || r.metadata?.country?.[0] || '',
        noOfProjects: r.metadata?.noOfProjects?.[0] || '0',
      })));
    } catch { setResults([]); } finally { setLoading(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[80vh]">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-sm">EC Organisation Search</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-4 border-b space-y-2">
          <div className="flex gap-2">
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="Name, OID or PIC..." className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button onClick={doSearch} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">Search</button>
          </div>
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none">
            <option value="">All countries</option>
            {Object.entries(COUNTRIES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-8 text-center text-sm text-gray-500">Searching EC database...</div> : results.map((org) => (
            <div key={org.pic} className="px-5 py-3 border-b hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => { onSelect(org); onClose(); }}>
              <div>
                <p className="text-sm font-medium text-gray-900">{org.name}</p>
                <p className="text-xs text-gray-500">{org.city}, {org.country} · PIC {org.pic}</p>
              </div>
              <Check className="w-4 h-4 text-indigo-600 opacity-0 hover:opacity-100" />
            </div>
          ))}
          {!loading && searched && results.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No results found.</div>}
        </div>
      </div>
    </div>
  );
}

export default function OrganisationsPage() {
  const supabase = createSupabaseBrowserClient();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editOrg, setEditOrg] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('org_registry').select('*').order('created_at', { ascending: false });
    setOrgs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    if (editOrg) await supabase.from('org_registry').update(form).eq('id', editOrg.id);
    else await supabase.from('org_registry').insert(form);
    setSaving(false);
    setShowPanel(false);
    load();
  }

  const filtered = orgs.filter(o => (o.legal_name || '').toLowerCase().includes(search.toLowerCase()) || (o.oid || '').toLowerCase().includes(search.toLowerCase()) || (o.pic || '').includes(search));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisation Registry</h1>
          <p className="text-sm text-gray-500">Official partner database for proposals and projects</p>
        </div>
        <button onClick={() => { setEditOrg(null); setForm({}); setShowPanel(true); }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Organisation
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registry..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-600">
          <Globe className="w-4 h-4" /> EC Search
        </button>
      </div>

      {loading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading registry...</div> : (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-600">Organisation</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Location</th>
                <th className="px-4 py-3 font-semibold text-gray-600">IDs</th>
                <th className="px-4 py-3 font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(org => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{org.legal_name}</td>
                  <td className="px-4 py-4 text-gray-500">{org.city}, {org.country}</td>
                  <td className="px-4 py-4 space-y-1">
                    {org.oid && <p className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">{org.oid}</p>}
                    {org.pic && <p className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">PIC {org.pic}</p>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => { setEditOrg(org); setForm(org); setShowPanel(true); }} className="text-indigo-600 hover:underline font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrgSearchModal open={showModal} onClose={() => setShowModal(false)} onSelect={(ec: any) => { setForm({ ...form, legal_name: ec.name, city: ec.city, country: ec.country, pic: ec.pic }); setShowPanel(true); }} />

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={(e) => e.target === e.currentTarget && setShowPanel(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{editOrg ? 'Edit Organisation' : 'Add Organisation'}</h2>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Legal Name</label>
                <input type="text" value={form.legal_name || ''} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">OID</label>
                  <input type="text" value={form.oid || ''} onChange={(e) => setForm({ ...form, oid: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">PIC</label>
                  <input type="text" value={form.pic || ''} onChange={(e) => setForm({ ...form, pic: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City</label>
                  <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
                  <input type="text" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <div className="pt-6 border-t flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2 border rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
