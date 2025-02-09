import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../services/upload_service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Ensure upload directory exists
  private ensureUploadDir() {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  @Post('judges/:eventId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_, __, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_, file, cb) => {
          const fileExt = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${fileExt}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
          return cb(
            new BadRequestException('Only Excel files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadJudges(
    @UploadedFile() file: Express.Multer.File,
    @Param('eventId') eventId: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      return await this.uploadService.processJudgesData(file.path, eventId);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error processing judges data',
      );
    }
  }

  @Post('posters/:eventId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_, __, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_, file, cb) => {
          const fileExt = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${fileExt}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
          return cb(
            new BadRequestException('Only Excel files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPosters(
    @UploadedFile() file: Express.Multer.File,
    @Param('eventId') eventId: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      return await this.uploadService.processPostersData(file.path, eventId);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error processing posters data',
      );
    }
  }
}
