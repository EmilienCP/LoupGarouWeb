import { injectable } from 'inversify'
import * as mysql from 'mysql'
import * as config from 'config'
import * as util from 'util'

@injectable()
export class DatabaseService {
  static get Connection (): mysql.Connection { return DatabaseService.connection }

    private static connection : mysql.Connection = mysql.createConnection({
      host: config.get('app.ip'),
      user: 'root',
      port: config.get('app.port'),
      password: 'somePassword',
      database: 'polychemins',
      charset: 'utf8'
    });

    public static query (sql: string, args: any[]): Promise<any> {
      return util.promisify(this.connection.query)
        .call(this.connection, sql, args)
    }

    public static async withTransaction (callback: any): Promise<void> {
      try {
        await this.beginTransaction()
        await callback()
        await this.commit()
      }
      catch (err) {
        await this.rollback()
        throw err
      }
      finally {
        // await this.close();
      }
    }

    private static beginTransaction (): Promise<void> {
      return util.promisify(this.connection.beginTransaction)
        .call(this.connection)
    }

    private static commit (): Promise<void> {
      return util.promisify(this.connection.commit)
        .call(this.connection)
    }

    private static rollback (): Promise<void> {
      return util.promisify(this.connection.rollback)
        .call(this.connection)
    }
}
