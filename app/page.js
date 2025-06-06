'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const [timer, setTimer] = useState(60); // countdown in seconds

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone }),
      });

      if (!res.ok) throw new Error('Failed to send OTP');

      setOtpSent(true);
      setTimer(60); // Reset timer when OTP is sent
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone }),
      });

      if (!res.ok) throw new Error('Failed to resend OTP');

      setTimer(60);
    } catch {
      setOtpError('Failed to resend OTP. Please try again.');
    }
  };

  const handleOtpVerify = async () => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone, otp }),
      });

      if (!res.ok) throw new Error('Invalid OTP');

      const data = await res.json();
      if (data.message) {
        localStorage.setItem('registrationPhone', phone);
        router.push('/student-details');
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-svh w-full">
      <div className="flex justify-center p-4 bg-white dark:bg-muted/50 dark:backdrop-blur-2xl">
        <img src="/aaft-uni-logo.png" alt="Referral Logo" className="h-16 w-42 object-cover z-10" />
      </div>

      <div className="relative bg-gradient-to-b from-[#EC2027] to-[#920006] rounded-b-[25px] md:rounded-b-[50px]">
        <div className="relative z-10 flex flex-col gap-4 items-center justify-center px-4 py-10">
          <h2 className="max-w-xl font-bold text-2xl md:text-4xl leading-10 md:leading-12 text-white text-center">
            AAFT University - Raipur
          </h2>
          <h2 className="max-w-xl font-semibold text-xl md:text-2xl leading-10 md:leading-12 text-white text-center">
            Student Registration Program
          </h2>

          <div className="w-full max-w-md mt-5 relative">
            <div className="w-full flex justify-center absolute top-0">
              <div className="rounded-lg bg-white shadow-lg w-full p-6 space-y-4">
                <h3 className="text-center text-gray-400 uppercase text-xs mb-4">
                  Just Register First
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white px-4 py-2 rounded mt-4 hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpSent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Enter OTP</h3>
            <input
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            {otpError && <p className="text-sm text-red-500 mb-2">{otpError}</p>}

            <div className="flex justify-between mb-4">
              {timer > 0 ? (
                <button
                  onClick={handleOtpVerify}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Resend OTP
                </button>
              )}
              <button
                onClick={() => setOtpSent(false)}
                className="text-gray-600 underline text-sm ml-4 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {timer > 0 && (
              <div className="text-center text-sm text-gray-500">
                Resend OTP in <strong>{timer}s</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
