import 'reflect-metadata';
import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

import { createDatabaseConnection } from './database';
import { Container } from 'typedi';
import { useContainer, useExpressServer } from 'routing-controllers';
import { routingControllerOptions } from '../utils/RoutingConfig';
import { logger, stream } from '../utils/winston';
import { useSwagger } from '../utils/Swagger';
import { env } from '../env';
import socket from '../utils/socket';

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setDatabase();
    this.setMiddlewares();
    this.setImageUpload();
  }

  private async setDatabase(): Promise<void> {
    try {
      await createDatabaseConnection();
    } catch (error) {
      logger.error(error);
    }
  }

  private setMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/img', express.static(path.join(__dirname, '..', '..', 'uploads')));
    this.app.use(morgan('combined', { stream }));
  }

  private setImageUpload(): void {
    try {
      fs.readdirSync('uploads');
    } catch (error) {
      logger.error('uploads 폴더를 생성합니다');
      fs.mkdirSync('uploads');
    }
  }

  public async createExpressServer(port: number): Promise<void> {
    try {
      useContainer(Container);
      useExpressServer(this.app, routingControllerOptions);
      useSwagger(this.app);

      const createHttpServer = http.createServer(this.app).listen(port, () => {
        logger.info(`http Server is started on port ${port}`);
      });

      socket(createHttpServer, this.app);

      if (env.isProduction) {
        const option = {
          ca: fs.readFileSync('/etc/letsencrypt/live/kumas.dev/fullchain.pem'),
          key: fs
            .readFileSync(
              path.resolve(process.cwd(), '/etc/letsencrypt/live/kumas.dev/privkey.pem'),
              'utf8'
            )
            .toString(),
          cert: fs
            .readFileSync(
              path.resolve(process.cwd(), '/etc/letsencrypt/live/kumas.dev/cert.pem'),
              'utf8'
            )
            .toString(),
        };

        const createHttpsServer = https.createServer(option, this.app).listen(port + 1, () => {
          logger.info(`https Server is started on port ${port + 1}`);
        });

        socket(createHttpsServer, this.app);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
    }
  }
}
