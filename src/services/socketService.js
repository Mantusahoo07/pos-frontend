import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    this.socket.on('order-updated', (data) => {
      // Handle real-time order updates
      window.dispatchEvent(new CustomEvent('order-updated', { detail: data }));
    });

    this.socket.on('table-updated', (data) => {
      // Handle real-time table updates
      window.dispatchEvent(new CustomEvent('table-updated', { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
