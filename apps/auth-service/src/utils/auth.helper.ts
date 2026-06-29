import crypto from 'crypto';
import { sendEmail } from './sendMail';
import { NextFunction } from 'express';
import { ValidationError } from '@packages/error-handler';
import redis from 'packages/libs/redis';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller',
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email address`);
  }
};

export const checkOptRestriction = async (
  email: string,
  next: NextFunction,
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account is locked due to multiple failure attempts! Try again after 30 minutes',
      ),
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError('Too many OTP requests! Try again after 60 minutes'),
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        'Please wait 1 minute before requesting another OTP!',
      ),
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequest = parseInt((await redis.get(otpRequestKey)) || '0', 10);

  if (otpRequest >= 5) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    return next(
      new ValidationError('Too many OTP requests! Try again after 60 minutes'),
    );
  }

  await redis.set(otpRequestKey, otpRequest + 1, 'EX', 3600); // Increment the count and set expiration to 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  // Create Random 5 numbers OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  await sendEmail(email, 'Verify Your Email', template, {
    name,
    otp,
  });
  await redis.set(`otp:${email}`, otp, 'EX', 300); //Save otp to redis and expire after 300s
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); //Prevent sending too many OTPs
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction,
) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw next(new ValidationError('Invalid or expired OTP!'));
  }

  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  const failedAttempts = parseInt(
    (await redis.get(failedAttemptsKey)) || '0',
    10,
  );

  if (storedOtp !== otp) {
    // Check attempts to input otp, if wrong more than 2 times => Lock for 30 minutes
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.set(`otp:${email}`, failedAttemptsKey);
      throw next(
        new ValidationError(
          'Account is locked due to multiple failure attempts! Try again after 30 minutes',
        ),
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    throw next(
      new ValidationError(
        `Incorrect OTP. Remaining attempts: ${2 - failedAttempts}`,
      ),
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
