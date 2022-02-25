import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenError } from 'routing-controllers';

export const fileUploadOptions = {
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, 'uploads/');
    },
    filename: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    if (!['.png', '.jpg', '.gif', '.jpeg'].includes(ext))
      return cb(new ForbiddenError('Only image format is possible.'));
    cb(null, true);
  },
  limits: {
    fileSize: 0.1 * 1024 * 1024,
  },
};
