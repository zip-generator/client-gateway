import { IsString } from 'class-validator';

export class QueryKeyDto {
  @IsString()
  fileName: string;
}
