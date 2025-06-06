import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    const updateResponse = await fetch(process.env.CRM_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: result || 'Update API failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'LSQ lead updated', result });
  } catch (error) {
    console.error('Update API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
