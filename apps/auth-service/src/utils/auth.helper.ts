import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import redis from 'packages/libs/redis';
import { sendEmail } from './sendMail';
import { NextFunction } from 'express';

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
  await redis.set(`otp: ${email}`, otp, 'EX', 300); //Save otp to redis and expire after 300s
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); //Prevent sending too many OTPs
};
