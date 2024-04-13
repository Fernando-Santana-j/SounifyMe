const db = require('../Firebase/models');
const functions = require('../functions');


const roomSocket = require('./room-socket')

const statusSocket = require('./status-socket')


try {
    const socketManager = (io)=>{
        io.on('connection', async(socket) => {

            roomSocket.index(io,socket)
            
            // statusSocket.index(io,socket)

            socket.on('disconnect',async(reason)=>{
                if (socket.user) {
                    // statusSocket.desc(io,socket)
                    roomSocket.desc(io,socket)
                    
                }
            })
        });
    }
    
    
    module.exports = socketManager
    module.exports.status = 'OK'
} catch (error) {
    module.exports.status = 'ERROR'
    console.log(error);
}

