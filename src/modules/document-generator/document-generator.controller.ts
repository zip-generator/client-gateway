import { NATS_SERVICE } from '@app/config';
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Controller('document-generator')
export class DocumentGeneratorController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  generateDocuments() {
    try {
      return this.client.send('generate-documents', {});
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
