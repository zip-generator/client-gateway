import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';

@Module({
  controllers: [DocumentGeneratorController],
})
export class DocumentGeneratorModule {}
