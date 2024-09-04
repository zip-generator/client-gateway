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
import { ClientProxy, RpcException } from '@nestjs/microservices';
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
    try {
      // Send the request to the NATS service
      const response$ = await firstValueFrom(
        this.client.send<DocumentGenerationResponse>(GENERATE_PDF, {
          from: '2024-01-01',
          to: '2024-01-31',
          documentType: '00',
          format: 'PDF',
        }),
      );
      this.logger.debug('Document generation request sent', {
        response$,
      });

      return { message: 'Document generation request sent', response$ };
    } catch (error) {
      this.logger.error('Error generating document', error.mesage);
      throw new RpcException(error);
    }
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
      const data = await firstValueFrom(
        this.client.send(ZIP_COMPLETED, response),
      );
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }
  @Get('download-zip')
  async downloadZip(@Query() queryDto: QueryKeyDto) {
    try {
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
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
