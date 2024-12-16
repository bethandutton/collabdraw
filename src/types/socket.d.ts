import { Socket as ClientSocket } from 'socket.io-client';
import { Socket as ServerSocket } from 'socket.io';

interface User {
  name: string;
  avatar: string;
  id: string;
}

interface ServerToClientEvents {
  'cursor-move': (data: { x: number; y: number; user: User }) => void;
}

interface ClientToServerEvents {
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'cursor-move': (data: { x: number; y: number; user: User }) => void;
}

declare module 'socket.io-client' {
  export interface Socket extends ClientSocket<ServerToClientEvents, ClientToServerEvents> {}
}

declare module 'socket.io' {
  export interface Socket extends ServerSocket<ClientToServerEvents, ServerToClientEvents> {}
}
