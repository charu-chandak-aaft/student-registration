// import { NextResponse } from 'next/server';
// import { db } from '../../../lib/db';

// export async function GET() {
//   const [rows] = await db.execute('SELECT * FROM student_registration');
//   return NextResponse.json(rows);
// }
export async function GET(request) {
  return Response.json({ message: 'Hello from API' });
}

export async function POST(request) {
  const body = await request.json();
  return Response.json({ message: 'Received', data: body });
}