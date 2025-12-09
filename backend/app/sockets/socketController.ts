import * as http from 'http'
export class SocketController{

    constructor(server: http.Server){
        const sio = require('socket.io')(server, {
            cors: {
              origin: '*',
            }
          });
          
        sio.on("connection", (socket: any) => {
            socket.emit("retour")
            socket.on("test", ()=>{
              socket.emit("retour")
            })
        });
    }
}