import { SECRET_KEY } from '@/config/config';
import { comparePassword, hashPassword } from '@/libs/bcrypt';
import { createToken } from '@/libs/jwt';
import { transporter } from '@/libs/nodemiler';
import { TUser } from '@/models/user.model';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import fs from 'fs';
import { verify } from 'jsonwebtoken';
import path from 'path';
import sharp from 'sharp';

class BusinessService {
  async render(req: Request) {
    const { businessId } = req.params;
    const data = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });
    return data?.logo;
  }

  async create(req: Request) {
    const userId = req.user.id;
    const { name, email, phone, address, bank, bank_account } = req.body;
    const file = req.file;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('user not found');

    if (!file) throw new Error('file is required');

    const buffer = await sharp(file.buffer).png().toBuffer();

    const business = await prisma.business.create({
      data: {
        user_id: userId,
        name: name,
        email: email,
        phone: phone,
        address: address,
        logo: buffer,
        bank: bank,
        bank_account: bank_account,
      },
    });

    return business;
  }

  async business(req: Request) {
    const userId = req.user.id;

    const business = await prisma.business.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        name: true,
        address: true,
        bank: true,
        bank_account: true,
        phone: true,
        email: true,
      },
    });

    return business;
  }

  async update(req: Request) {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { name, phone, email, address, bank, bank_account } = req.body;
    const file = req.file;

    const business = await prisma.business.findUnique({
      where: {
        user_id: userId,
        id: businessId,
      },
    });

    if (!business) throw new Error('thi user business not found');

    const updatedData: Prisma.BusinessUpdateInput = {};

    if (name !== undefined) {
      updatedData.name = name;
    }

    if (address !== undefined) {
      updatedData.address = address;
    }

    if (phone !== undefined) {
      updatedData.phone = phone;
    }

    if (email !== undefined) {
      updatedData.email = email;
    }

    if (bank !== undefined) {
      updatedData.bank = bank;
    }

    if (bank_account !== undefined) {
      updatedData.bank_account = bank_account;
    }

    if (file) {
      const buffer = await sharp(file.buffer).png().toBuffer();
      updatedData.logo = buffer;
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId, user_id: userId },
      data: updatedData,
    });

    return updatedBusiness;
  }
}

export default new BusinessService();
