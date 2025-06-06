import { NextResponse } from 'next/server';

export async function POST(req) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

 const url = `${process.env.CRM_RETRIEVE_LEAD_BY_PHONE}${phone}`;
   console.log('retrieve', url)
  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Lead fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}
