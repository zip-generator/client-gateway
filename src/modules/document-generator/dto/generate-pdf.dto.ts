import { DOCUMENT_TYPES, ZIP_FILE_FORMAT } from '@app/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601 } from 'class-validator';

export class GeneratePdfDto {
  @ApiProperty({
    description: 'The date from which to start the report',
    example: '2021-01-01',
  })
  @IsISO8601()
  from?: string;

  @ApiProperty({
    description: 'The date to which to end the report',
    example: '2021-12-31',
  })
  @IsISO8601()
  to?: string;

  @ApiProperty({
    description: 'The type of document to generate',
    enum: DOCUMENT_TYPES,
    example: 'TODOS',
  })
  @IsEnum(DOCUMENT_TYPES)
  documentType: DOCUMENT_TYPES = DOCUMENT_TYPES.TODOS;

  @ApiProperty({
    description: 'The format of the zip file',
    enum: ZIP_FILE_FORMAT,
    example: 'JSON',
  })
  @IsEnum(ZIP_FILE_FORMAT)
  format: ZIP_FILE_FORMAT = ZIP_FILE_FORMAT.JSON;
}
