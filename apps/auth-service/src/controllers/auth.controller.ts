import { NextFunction, Request, Response } from 'express';
import {
  checkOptRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';

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
