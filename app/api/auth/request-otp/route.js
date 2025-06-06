import { NextResponse } from 'next/server';
import { generateOTP } from '../../../lib/otp';

export async function POST(req) {
  const { mobile } = await req.json();

  if (!mobile || !/^\d{10,15}$/.test(mobile)) {
    return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
  }

  const otp = generateOTP(mobile);

  const message = `Use OTP ${otp} to complete the mobile number verification on AAFT Website. Please do not share with anyone.`;

  const url = `https://web.insignsms.com/api/sendsms?username=aaftotp&password=Aaft@Online$321&senderid=AAFTNF&message=${encodeURIComponent(message)}&numbers=${mobile}&dndrefund=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    const result = await response.text(); // Use `.text()` unless the API returns JSON

    return NextResponse.json({
      message: 'OTP sent successfully',
      // otp, // Optional: return for development or testing only. Remove in production.
      smsApiResponse: result,
    });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}