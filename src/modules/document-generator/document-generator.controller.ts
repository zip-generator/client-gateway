import {
  GENERATE_PDF,
  NATS_SERVICE,
  ZIP_COMPLETED,
  ZIP_STATUS,
} from '@app/config';
import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { QueryKeyDto } from './dto/query.dto';
import { GeneratePdfDto } from './dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

interface DocumentGenerationResponse {
  filename: string;
  data: { name: string };
  responseTo: string;
}

interface GenerateDocumentResponse {
  message: string;
  data: DocumentGenerationResponse | Observable<unknown>;
}
@ApiTags('Document Generator')
@Controller('document-generator')
export class DocumentGeneratorController {
  private readonly logger = new Logger(DocumentGeneratorController.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @ApiOperation({ summary: 'Generate documents' })
  @ApiOkResponse({
    description: 'Document generation request sent',
    schema: {
      type: 'object',
      example: {
        message: 'Document generation request sent',
        data: {
          status: HttpStatus.ACCEPTED,
          message: 'Document generation request sent',
          jobId: '1',
        },
      },
    },
  })
  @Get()
  async generateDocuments(
    @Query() queryDto: GeneratePdfDto,
  ): Promise<GenerateDocumentResponse> {
    // Send the request to the NATS service
    const response$ = await firstValueFrom(
      this.client.send<DocumentGenerationResponse>(GENERATE_PDF, queryDto),
    ).catch(
      catchError((error) => {
        throw new InternalServerErrorException(
          error?.message ?? 'Error generating document',
        );
      }),
    );

    return { message: 'Document generation request sent', data: response$ };
  }

  @ApiOperation({ summary: 'Get the status of a document generation job' })
  @ApiOkResponse({
    description: 'Returns the status of the document generation job',
    schema: { type: 'object', example: { status: 'In progress', jobId: 1234 } },
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID to check the status of the document generation',
    type: Number,
  })
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
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Error getting document generation status',
      );
    }
  }

  @ApiOperation({ summary: 'Download the generated ZIP file' })
  @ApiOkResponse({
    description: 'Returns the URL to download the ZIP file',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: {
          type: 'string',
          description: 'URL to download the ZIP file',
        },
        expiresIn: {
          type: 'string',
          description: 'Time in seconds for the URL to expire',
        },
      },
    },
  })
  @ApiQuery({
    name: 'fileName',
    description: 'Name of the file to download',
    type: QueryKeyDto,
  })
  @Get('download-zip')
  async downloadZip(@Query() queryDto: QueryKeyDto) {
    const response = await firstValueFrom(
      this.client.send(ZIP_COMPLETED, {
        key: queryDto.fileName,
      }),
    );

    return {
      downloadUrl: response,
      expiresIn: '300S (5 minutes)',
    };
  }
}
