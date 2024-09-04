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
  Logger,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QueryKeyDto } from './dto/query.dto';

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
  async generateDocuments() {
    // Send the request to the NATS service
    const response$ = await firstValueFrom(
      this.client.send<DocumentGenerationResponse>(GENERATE_PDF, {
        from: '2024-01-01',
        to: '2024-01-31',
        documentType: '00',
        format: 'PDF',
      }),
    );

    return { message: 'Document generation request sent', data: response$ };
  }
  @Get('status/:jobId')
  async getDocumentGenerationStatus(
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    this.logger.warn('Get document generation status request received', {
      jobId,
    });
    const response = await firstValueFrom(
      this.client.send(ZIP_STATUS, {
        jobId,
      }),
    );
    return response;
  }
  @Get('download-zip')
  async downloadZip(@Query() queryDto: QueryKeyDto) {
    const response = await firstValueFrom(
      this.client.send(ZIP_COMPLETED, {
        key: queryDto.fileName,
      }),
    );
    this.logger.debug('Download zip request sent', {
      response,
    });
    return {
      downloadUrl: response,
      expiresIn: '300S (5 minutes)',
    };
  }
}
