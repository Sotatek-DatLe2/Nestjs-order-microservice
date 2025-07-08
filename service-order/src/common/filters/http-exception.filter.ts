import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const isDev = process.env.NODE_ENV === 'development';

    let message: string | string[] = 'Internal server error';

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (Array.isArray(errorResponse['message'])) {
      message = errorResponse['message'];
    } else if (typeof errorResponse['message'] === 'string') {
      message = errorResponse['message'];
    }

    this.logger.error(
      `HTTP ${status} Error on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorBody = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
      message,
      ...(isDev && { debug: errorResponse }),
    };

    response.status(status).json(errorBody);
  }
}
