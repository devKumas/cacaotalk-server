import express from 'express';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { User } from '../entities/User';

export default (httpServer: HttpServer, app: express.Application) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
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
