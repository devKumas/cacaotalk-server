import { Server } from 'socket.io';
import { Express } from 'express';
import { Server as HttpServer } from 'http';
import User from '../models/user';

export default (httpServer: HttpServer, app: Express) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['websocket'],
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    socket.emit('conn', '소켓 연결이 필요합니다.');

    socket.on('disconnect', () => {
      removeSocket(socket.id);
    });
  });
};

export const addSocket = (userId: number, socketId: string) => {
  const checkSocket = socketDB.get(userId)?.filter((v) => v === socketId);

  if (checkSocket && checkSocket.length) {
    return null;
  }

  socketDB.set(userId, [...(socketDB.get(userId) || []), socketId]);
  connectSocket.set(socketId, userId);
  console.log(socketDB);

  return socketDB.get(userId);
};

export const removeSocket = (socketId: string) => {
  const userId = connectSocket.get(socketId);
  if (userId) {
    const userSocketList = socketDB.get(userId)?.filter((v) => socketId != v);
    socketDB.set(userId, userSocketList || []);
    connectSocket.delete(socketId);
  }
};

export const sendSocket = (userList: User[], message: object, io: Server) => {
  userList.map(({ id }) => {
    socketDB.get(id)?.map((socketId) => {
      io.to(socketId).emit('message', message);
    });
  });
};

export const socketDB = new Map<number, string[]>();
export const connectSocket = new Map<string, number>();
