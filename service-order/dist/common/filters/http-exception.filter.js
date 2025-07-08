"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isHttpException = exception instanceof common_1.HttpException;
        const status = isHttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = isHttpException
            ? exception.getResponse()
            : { message: 'Internal server error' };
        const isDev = process.env.NODE_ENV === 'development';
        let message = 'Internal server error';
        if (typeof errorResponse === 'string') {
            message = errorResponse;
        }
        else if (Array.isArray(errorResponse['message'])) {
            message = errorResponse['message'];
        }
        else if (typeof errorResponse['message'] === 'string') {
            message = errorResponse['message'];
        }
        this.logger.error(`❌ HTTP ${status} Error on ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : undefined);
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map