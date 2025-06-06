import otpStore from './otp-store';

export function verifyOTP(mobile, inputOtp) {
  const entry = otpStore.get(mobile);

  if (!entry) {
    console.log('No OTP entry found for mobile:', mobile);
    return false;
  }

  const { otp, createdAt } = entry;

  const expiryTime = 5 * 60 * 1000; // 5 minutes
  if (Date.now() - createdAt > expiryTime) {
    otpStore.delete(mobile);
    console.log('OTP expired for mobile:', mobile);
    return false;
  }

  const isValid = inputOtp === otp;
  if (isValid) otpStore.delete(mobile);

  console.log(`Verifying OTP for ${mobile}: ${isValid}`);
  return isValid;
}
export function generateOTP(mobile) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(mobile, { otp, createdAt: Date.now() });
  console.log(`Generated OTP for ${mobile}:`, otp);
  return otp;
}
