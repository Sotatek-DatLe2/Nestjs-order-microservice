"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAuthGuard = void 0;
const common_1 = require("@nestjs/common");
let CustomAuthGuard = class CustomAuthGuard {
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Custom ')) {
            throw new common_1.UnauthorizedException('Custom token required');
        }
        const token = authHeader.replace('Custom ', '').trim();
        if (!this.validateToken(token)) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        req['user'] = { token };
        return true;
    }
    validateToken(token) {
        return token === '123';
    }
};
exports.CustomAuthGuard = CustomAuthGuard;
exports.CustomAuthGuard = CustomAuthGuard = __decorate([
    (0, common_1.Injectable)()
], CustomAuthGuard);
//# sourceMappingURL=custom-auth.guard.js.map