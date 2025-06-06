import { NextResponse } from 'next/server';
import { verifyOTP } from '../../../lib/otp';
import { findOrCreateUser } from '../../../lib/db';

export async function POST(req) {
  const { mobile, otp } = await req.json();

  if (!mobile || !otp) {
    return NextResponse.json({ error: 'Mobile and OTP required' }, { status: 400 });
  }

  const isValid = verifyOTP(mobile, otp);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  }

  const user = findOrCreateUser(mobile);

  // Generate token or session – mocked here
  const token = `mock-token-${mobile}`;

  return NextResponse.json({ message: 'OTP verified', user, token });
}