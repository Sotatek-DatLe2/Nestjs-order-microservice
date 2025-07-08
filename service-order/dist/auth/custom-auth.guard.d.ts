import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class CustomAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
    validateToken(token: string): boolean;
}
