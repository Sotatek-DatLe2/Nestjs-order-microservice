// src/socket/dashboard.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class DashboardGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitOrderCreated(order: any) {
    this.logger.log(`Emitting orderCreated: ${order.id}`);
    this.server.emit('orderCreated', order);
  }

  emitOrderUpdated(order: any) {
    this.logger.log(`Emitting orderUpdated: ${order.id}`);
    this.server.emit('orderUpdated', order);
  }
}