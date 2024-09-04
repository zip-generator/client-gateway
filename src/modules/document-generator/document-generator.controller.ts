import {
  GENERATE_PDF,
  NATS_SERVICE,
  ZIP_COMPLETED,
  ZIP_STATUS,
} from '@app/config';
import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QueryKeyDto } from './dto/query.dto';
import { GeneratePdfDto } from './dto';

interface DocumentGenerationResponse {
  filename: string;
  data: { name: string };
  responseTo: string;
}
@Controller('document-generator')
export class DocumentGeneratorController {
  private readonly logger = new Logger(DocumentGeneratorController.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  async generateDocuments(@Query() queryDto: GeneratePdfDto) {
    // Send the request to the NATS service
    const response$ = await firstValueFrom(
      this.client.send<DocumentGenerationResponse>(GENERATE_PDF, queryDto),
    );

    return { message: 'Document generation request sent', data: response$ };
  }
  @Get('status/:jobId')
  async getDocumentGenerationStatus(
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    try {
      const response = await firstValueFrom(
        this.client.send(ZIP_STATUS, {
          jobId,
        }),
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Error getting document generation status',
      );
    }
  }
  @Get('download-zip')
  async downloadZip(@Query() queryDto: QueryKeyDto) {
    const response = await firstValueFrom(
      this.client.send(ZIP_COMPLETED, {
        key: queryDto.fileName,
      }),
    );

    return {
      downloadUrl: response,
      expiresIn: '300S (5 minutes)',
    };
  }
}
