// lib/otp-store.js
const otpStore = global.otpStore || new Map();

if (!global.otpStore) {
  console.log('OTP store initialized');
  global.otpStore = otpStore;
}

export default otpStore;
