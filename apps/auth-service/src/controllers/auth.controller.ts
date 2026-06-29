import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  checkOptRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';
import { ValidationError } from '@packages/error-handler';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error('User already exists with this email!');
    }
    await checkOptRestriction(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'Activation mail sent successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError('All fields are required!'));
    }

    const isExistingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (isExistingUser) {
      throw new ValidationError('A user with this email already exists!');
    }
    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(200).json({
      message: 'User created successfully!',
    });
  } catch (error) {
    return next(error);
  }
};
