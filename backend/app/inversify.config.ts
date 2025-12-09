import { Container } from 'inversify'
import { Application } from './app'
import { DatabaseController } from './controllers/database.controller'
import { SocketController } from './controllers/socket.controller'
import { Server } from './server'
import { DatabaseService } from './services/database.service'
import { DJAIService } from './services/djai.service'
import { PartiesService } from './services/parties.service'
import Types from './types'

const container: Container = new Container()

container.bind(Types.Server).to(Server)
container.bind(Types.Application).to(Application)

/**
 * Controllers
 */
container.bind(Types.DatabaseController).to(DatabaseController)
container.bind(Types.SocketController).to(SocketController)

/**
 * Services
 */

// Connection to the database
container.bind(Types.DatabaseService).to(DatabaseService)
container.bind(Types.PartiesService).to(PartiesService)
container.bind(Types.DJAIService).to(DJAIService)



// Services related to departments

export { container }
