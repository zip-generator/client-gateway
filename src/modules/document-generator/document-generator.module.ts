import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [DocumentGeneratorController],
  imports: [NatsModule],
})
export class DocumentGeneratorModule {}
