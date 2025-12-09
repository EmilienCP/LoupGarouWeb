import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import { inject, injectable } from 'inversify'
import { DatabaseController } from './controllers/database.controller'
import Types from './types'
import { SocketController } from './controllers/socket.controller'

@injectable()
export class Application {
    private readonly internalError: number = 500;
    public app: express.Application;

    public constructor (@inject(Types.DatabaseController) private databaseController: DatabaseController,
    @inject(Types.SocketController) private socketController: SocketController) {
      this.socketController.partiesService = this.databaseController.partiesService
      this.app = express()
      this.config()
      this.bindRoutes()
    }

    private config (): void {
      // middlewares configuration
      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({ extended: true }))
      this.app.use(cors())
    }

    public bindRoutes (): void {
      this.app.use('/', this.databaseController.router)
      this.errorHandeling()
    }

    private errorHandeling (): void {
      this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        const err: Error = new Error('Not Found')
        next(err)
      })

      // development error handler
      // will print stacktrace
      if (this.app.get('env') === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
          res.status(err.status || this.internalError)
          res.send({
            message: err.message,
            error: err
          })
        })
      }

      // production error handler
      // no stacktraces leaked
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status || this.internalError)
        res.send({
          message: err.message,
          error: {}
        })
      })
    }
}
