import { NATS_SERVICE } from '@app/config';
import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
        this.client.send<DocumentGenerationResponse>('documents:pdf', {
          from: '2024-01-01',
          to: '2024-01-31',
          documentType: '00',
          format: 'PDF',
        }),
      );

      return { message: 'Document generation request sent', response$ };
    } catch (error) {
      this.logger.error('Error generating document', error.mesage);
      throw new RpcException(error);
    }
  }
}
