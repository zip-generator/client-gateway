import { Module } from '@nestjs/common';
import { DocumentGeneratorModule } from '@app/modules/document-generator/document-generator.module';
import { NatsModule } from '@app/modules/transports/nats.module';

@Module({
  imports: [DocumentGeneratorModule, NatsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
