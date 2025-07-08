import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Custom ')) {
      throw new UnauthorizedException('Custom token required');
    }

    const token = authHeader.replace('Custom ', '').trim();

    if (!this.validateToken(token)) {
      throw new UnauthorizedException('Invalid token');
    }

    req['user'] = { token };

    return true;
  }

  validateToken(token: string): boolean {
    return token === '123';
  }
}
