import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Enable CORS so your Next.js app on port 3001 can connect to this socket
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PromotionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected for real-time updates: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // We will call this method from the PromotionsService
  broadcastPromotionEvent(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
