'use strict';

import multer, { FileFilterCallback } from 'multer';
import { type Request } from 'express';

const maxSize = 1048576;

const multerConfig: multer.Options = {
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.mimetype.split('/')[0] !== 'image') {
      return cb(new Error('This file is not an image'));
    }
    const fileSize = parseInt(req.headers['content-length'] || '');
    if (fileSize > maxSize) {
      return cb(new Error('Maximum file is 1mb'));
    }
    return cb(null, true);
  },
  limits: { fileSize: maxSize },
};

export const blobUploader = () => {
  return multer({
    ...multerConfig,
  });
};
