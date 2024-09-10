import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryKeyDto {
  @ApiProperty({
    description: 'The key to query the document',
    example: 'key',
  })
  @IsString()
  fileName: string;
}
