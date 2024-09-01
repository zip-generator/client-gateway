import { NATS_SERVICE } from '@app/config';
import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const responseChannel = 'document:generated';
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
        this.client.send<DocumentGenerationResponse>('document:generate', {
          fileName: 'test',
          data: { name: 'John Doe' },
          responseTo: responseChannel,
        }),
      );

      this.logger.debug('Document generation request sent', {
        response$,
      });

      return { message: 'Document generation request sent' };
    } catch (error) {
      this.logger.error('Error generating document', error);
      throw new RpcException(error);
    }
  }
}
