import io from 'socket.io-client';

// Socket events constants
export const socketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_BOOKING: 'new_booking',
  DRIVER_ASSIGNED: 'driver_assigned',
  STATUS_UPDATED: 'status_updated'
};

// Socket service for real-time communication
class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  // Connect to the socket server
  connect() {
    if (!this.socket) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5002';
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });
      
      // Setup connect event
      this.socket.on(socketEvents.CONNECT, () => {
        console.log('Socket connected');
        this.connected = true;
      });
      
      // Setup disconnect event
      this.socket.on(socketEvents.DISCONNECT, () => {
        console.log('Socket disconnected');
        this.connected = false;
      });
    }
    
    // If socket exists but is disconnected, try to reconnect
    if (this.socket && !this.connected) {
      this.socket.connect();
    }
    
    return this.socket;
  }
  
  // Disconnect from the socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }
  
  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.on(event, callback);
  }
  
  // Unsubscribe from an event
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
  
  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.emit(event, data);
  }
  
  // Check if socket is connected
  isConnected() {
    return this.connected;
  }
}

export const socketService = new SocketService(); 