import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any;

  constructor() {   }

  setupSocketConnection() {
    // this.socket = io(environment.SOCKET_ENDPOINT);
  }

  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
}
}
