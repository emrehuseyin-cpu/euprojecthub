import { NextRequest, NextResponse } from 'next/server';

// Proxy for EU Funding & Tenders Portal API
// Avoids CORS on client side

export async function POST(req: NextRequest) {
  try {
    const { endpoint, apiKey, query, pageSize, pageNumber } = await req.json();
    
    // Safety check for API keys used by the EU portal
    const validKeys = ['SEDIA', 'SEDIA_PERSON', 'SEDIA_FAQ'];
    if (!validKeys.includes(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    let url: string;
    let fetchOpts: RequestInit;

    if (endpoint === 'document') {
      // GET for org lookup by PIC or document ID
      url = `https://api.tech.ec.europa.eu/search-api/prod/rest/document/${query}?apiKey=${apiKey}`;
      fetchOpts = { method: 'GET' };
    } else {
      // POST for search (default)
      const body = new URLSearchParams({
        query: JSON.stringify(query),
        pageSize: String(pageSize || 10),
        pageNumber: String(pageNumber || 1),
        language: 'en',
      });
      url = `https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=${apiKey}&text=*`;
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      };
    }

    const res = await fetch(url, fetchOpts);
    
    if (!res.ok) {
        return NextResponse.json({ error: `EU API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('EU Proxy error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
