import { SECRET_KEY } from '@/config/config';
import { comparePassword, hashPassword } from '@/libs/bcrypt';
import { createToken } from '@/libs/jwt';
import { transporter } from '@/libs/nodemiler';
import { TUser } from '@/models/user.model';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { addHours, addMinutes } from 'date-fns';
import { Request } from 'express';
import fs from 'fs';
import { verify } from 'jsonwebtoken';
import path from 'path';
import sharp from 'sharp';

class UserService {
  async signUp(req: Request) {
    const { email } = req.body;

    try {
      const result = await prisma.$transaction(async (prisma) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: email },
        });

        if (existingUser) throw new Error('email has been registered');

        const createUser = await prisma.user.create({
          data: {
            email,
            is_verified: false,
          },
        });

        const verifyToken = createToken({ id: createUser.id }, '20m');
        const tokenExp = addMinutes(new Date(), 20);

        await prisma.user.update({
          where: { id: createUser.id },
          data: {
            token: verifyToken,
            tokenExp: tokenExp,
          },
        });

        const verifyUrl = `${'http://localhost:3000'}/verify/${verifyToken}`;

        const templatePath = path.join(
          __dirname,
          '../templates/verification.html',
        );
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const userEmail = createUser.email;
        const html = htmlTemplate.replace('{{verification_link}}', verifyUrl);

        const sendEmail = await transporter.sendMail({
          to: userEmail,
          subject: 'Confirm Your Email Address For Invozy',
          html,
        });

        return createUser;
      });

      return result;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw new Error('Sign up failed');
    }
  }

  async finalizeSignUp(req: Request) {
    const { token, first_name, last_name, password } = req.body;
    const decodedToken = verify(token, SECRET_KEY) as { id: string };

    if (!decodedToken || !decodedToken.id) {
      throw new Error('Invalid token');
    }

    const userId = decodedToken.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.is_verified) {
      throw new Error('User is already verified');
    }

    const hashPass = await hashPassword(password);
    const userData = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name,
        last_name,
        password: hashPass,
        is_verified: true,
        token: null,
        tokenExp: null,
      },
    });

    return userData;
  }

  async login(req: Request) {
    const { email, password } = req.body;

    const data = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!data) throw new Error('Wrong e-mail!');
    if (!data.password) throw new Error('Wrong e-mail!');

    const checkUser = await comparePassword(data.password, password);
    if (!checkUser) throw new Error('Wrong password!');

    const userData: TUser = {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      is_verified: data.is_verified,
      reqEmailChange: data.reqEmailChange,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    delete userData.password;

    const accessToken = createToken(userData, '1hr');
    const refreshToken = createToken(
      {
        user: {
          id: userData.id,
        },
        type: 'refresh_token',
      },
      '1hr',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async validate(req: Request) {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: { Business: true },
    });

    if (!user) throw new Error('user not found');

    return createToken(
      {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_verified: user.is_verified,
          reqEmailChange: user.reqEmailChange,
        },
        business: { id: user.Business?.id, name: user.Business?.name },
        type: 'access_token',
      },
      '1hr',
    );
  }

  async forgotPassword(req: Request) {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        first_name: true,
        email: true,
      },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    const verifyToken = createToken({ id: user.id }, '20m');
    const tokenExp = addMinutes(new Date(), 20);
    const resetUrl = `${'http://localhost:3000'}/forgot-password/${verifyToken}`;

    const templatePath = path.join(
      __dirname,
      '../templates/resetPassword.html',
    );
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    const userEmail = user.email;
    const userName = user.first_name || '';

    const html = htmlTemplate
      .replace('{{reset_link}}', resetUrl)
      .replace('{{user_name}}', userName);

    const sendEmail = await transporter.sendMail({
      to: userEmail,
      subject: 'We’ve Received Your Invozy Password Reset Request',
      html,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { token: verifyToken, tokenExp: tokenExp },
    });

    return sendEmail;
  }

  async resetPassword(req: Request) {
    const { token, newPassword, confirmPassword } = req.body;
    const decodedToken = verify(token, SECRET_KEY) as { id: string };

    if (!decodedToken || !decodedToken.id) {
      throw new Error('Invalid token');
    }

    const userId = decodedToken.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (newPassword !== confirmPassword)
      throw new Error('confirmation password not match to new password');

    const hashPass = await hashPassword(newPassword);

    const updatePass = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPass,
        token: null,
        tokenExp: null,
      },
    });

    return updatePass;
  }

  async editProfile(req: Request) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    const { email, first_name, last_name, password, deleteImg } = req.body;
    const file = req.file;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedData: Prisma.UserUpdateInput = {};

      if (email && email !== user.email) {
        const checkEmail = await prisma.user.findFirst({
          where: { email: email },
        });

        if (checkEmail) throw new Error('email already used');

        const verifyToken = createToken({ id: userId }, '20m');
        const tokenExp = addMinutes(new Date(), 20);

        updatedData.email = email;
        updatedData.is_verified = false;
        updatedData.reqEmailChange = true;
        updatedData.token = verifyToken;
        updatedData.tokenExp = tokenExp;

        const verifyUrl = `${'http://localhost:3000'}/reverify/${verifyToken}`;

        const templatePath = path.join(
          __dirname,
          '../templates/changeEmail.html',
        );

        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const userName = user.first_name || '';

        const html = htmlTemplate
          .replace('{{verification_link}}', verifyUrl)
          .replace('{{user_name}}', userName);

        const sendEmail = await transporter.sendMail({
          to: email,
          subject: 'Please verify your new email address for Invozy',
          html,
        });
      }

      if (deleteImg) {
        updatedData.image = null;
      } else {
        if (file) {
          const buffer = await sharp(file.buffer).png().toBuffer();
          updatedData.image = buffer;
        }
      }

      if (first_name !== undefined) {
        updatedData.first_name = first_name;
      }

      if (last_name !== undefined) {
        updatedData.last_name = last_name;
      }

      if (password) {
        updatedData.password = await hashPassword(password);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      const updatedUserInfo = await prisma.user.findUnique({
        where: { id: userId },
      });

      const newToken = createToken(
        {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            is_verified: updatedUser.is_verified,
            reqEmailChange: updatedUser.reqEmailChange,
          },
          type: 'access_token',
        },
        '1h',
      );

      return { user: updatedUserInfo, token: newToken };
    } catch (error) {
      console.error('Error in editUserProfile:', error);
      throw error;
    }
  }

  async reverifyEmail(req: Request) {
    const token = req.params.token as string;

    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const decodedToken = verify(token, SECRET_KEY) as {
        id: string;
      };

      if (!decodedToken || !decodedToken.id) {
        throw new Error('Invalid token');
      }

      const id = decodedToken.id;

      const user = await prisma.user.findUnique({
        where: { id: id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.reqEmailChange) {
        throw new Error('User not request change email');
      }

      if (user.is_verified) {
        throw new Error('User already verified');
      }

      if (
        user.token !== token ||
        !user.tokenExp ||
        new Date() > new Date(user.tokenExp)
      ) {
        throw new Error('Token is invalid or has expired');
      }

      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
          is_verified: true,
          reqEmailChange: false,
          token: null,
          tokenExp: null,
        },
      });

      const newToken = createToken(
        {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            is_verified: updatedUser.is_verified,
            reqEmailChange: updatedUser.reqEmailChange,
          },
          type: 'access_token',
        },
        '1h',
      );

      return {
        message: 'Email verified successfully',
        token: newToken,
      };
    } catch (error) {
      console.error('Error in reverifyEmail:', error);
      throw new Error('Internal server error');
    }
  }

  async resendVerification(
    req: Request,
  ): Promise<{ email?: string; message: string }> {
    try {
      const { email } = req.body;

      if (!email) {
        return { message: 'Email is required' };
      }

      const select: Prisma.UserSelectScalar = {
        id: true,
        is_verified: true,
      };

      const data = await prisma.user.findUnique({
        select,
        where: { email: email },
      });

      if (!data) {
        return { message: 'User not found' };
      }

      if (data.is_verified) {
        return { message: 'You have previously verified your email' };
      }

      const verifyToken = createToken({ id: data.id }, '20m');
      const tokenExp = addMinutes(new Date(), 20);

      await prisma.user.update({
        where: { id: data.id },
        data: {
          token: verifyToken,
          tokenExp: tokenExp,
        },
      });

      const verifyUrl = `${'http://localhost:3000'}/verify/${verifyToken}`;
      const templatePath = path.join(
        __dirname,
        '../templates/verification.html',
      );
      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const html = htmlTemplate.replace('{{verification_link}}', verifyUrl);

      await transporter.sendMail({
        to: email,
        subject: 'Confirm Your Email Address For Invozy',
        html,
      });

      return { email, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error resend email', error);
      return { message: 'Internal server error' };
    }
  }

  async sendVerification(req: Request) {
    const { token } = req.params;

    if (!token) {
      console.error('Token is missing');
      throw new Error('Token is missing');
    }

    try {
      console.log('Received token:', token);

      const decodedToken = verify(token, process.env.SECRET_KEY as string) as {
        id: string;
      };

      console.log('Decoded token:', decodedToken);

      if (!decodedToken || !decodedToken.id) {
        console.error('Invalid token');
        return { is_verified: false, message: 'Invalid token', user: null };
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: decodedToken.id },
      });

      console.log('Existing user:', existingUser);

      if (!existingUser) {
        console.error('User not found');
        return { is_verified: false, message: 'User not found', user: null };
      }

      if (
        existingUser.tokenExp &&
        new Date() > new Date(existingUser.tokenExp)
      ) {
        console.error('Token has expired');
        return { is_verified: false, message: 'Token has expired', user: null };
      }

      if (existingUser.token !== token) {
        console.error('Invalid token');
        return { is_verified: false, message: 'Invalid token', user: null };
      }

      if (existingUser.is_verified) {
        console.error('User already verified');
        return {
          is_verified: true,
          message: 'User already verified',
          user: existingUser,
        };
      }

      console.log('Token verification successful');
      return {
        is_verified: false,
        message: 'Token is valid but user not yet verified',
        user: existingUser,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during verification:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      return {
        is_verified: false,
        message: 'Error during verification',
        user: null,
      };
    }
  }

  async verifyTokenUser(req: Request) {
    const { token } = req.params;
    const decodedToken = verify(token, SECRET_KEY) as { id: string };

    if (!decodedToken || !decodedToken.id) {
      throw new Error('Invalid token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        token: true,
        tokenExp: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (
      user.token !== token ||
      !user.tokenExp ||
      new Date() > new Date(user.tokenExp)
    ) {
      throw new Error('Token is invalid or has expired');
    }

    return user;
  }

  async resendReverify(req: Request) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return { message: 'Email is required' };
      }

      const data = await prisma.user.findUnique({
        where: { id: userId, reqEmailChange: true },
        select: { id: true, email: true, is_verified: true, first_name: true },
      });

      if (!data) {
        return { message: 'User not found' };
      }

      if (data.is_verified) {
        return { message: 'You have previously verified your email' };
      }

      const email = data.email;

      const verifyToken = createToken({ id: data.id }, '20m');
      const tokenExp = addMinutes(new Date(), 20);

      await prisma.user.update({
        where: { id: data.id },
        data: {
          token: verifyToken,
          tokenExp: tokenExp,
        },
      });

      const verifyUrl = `${'http://localhost:3000'}/reverify/${verifyToken}`;

      const templatePath = path.join(
        __dirname,
        '../templates/changeEmail.html',
      );

      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      const userName = data.first_name || '';

      const html = htmlTemplate
        .replace('{{verification_link}}', verifyUrl)
        .replace('{{user_name}}', userName);

      const sendEmail = await transporter.sendMail({
        to: email,
        subject: 'Please verify your new email address for Invozy',
        html,
      });

      return { email, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error resend email', error);
      return { message: 'Internal server error' };
    }
  }

  async render(req: Request) {
    const { userId } = req.params;
    const data = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return data?.image;
  }
}

export default new UserService();
