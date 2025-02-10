import { Controller, Get, Query, Headers, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileUploadedCheckerService } from 'src/services/file-uploader-checker.service';

@Controller('file-upload')
export class FileUploadedCheckerController {
  constructor(private readonly fileUploadedCheckerService: FileUploadedCheckerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkFileUploads(
    @Headers('Authorization') authHeader: string,
    @Query('eventId') eventId: string
  ) {
    if (!authHeader) {
      throw new HttpException('Authorization header is required', HttpStatus.UNAUTHORIZED);
    }

    if (!eventId) {
      throw new HttpException('eventId is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.fileUploadedCheckerService.checkIfFilesUploaded(eventId);
    return {
      eventId,
      hasJudges: result.hasJudges,
      hasPosters: result.hasPosters,
    };
  }
}
