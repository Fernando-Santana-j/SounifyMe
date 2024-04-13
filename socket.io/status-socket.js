const db = require('../Firebase/models');
const functions = require('../functions');

module.exports.desc = async (io, socket)=>{
    socket.status = 'offline'
    setTimeout(()=>{
        io.sockets.sockets.forEach(element => {
            console.log(element.id, socket.id);
            if (element.id == socket.id) {

                console.log(1);
            }
        });
        
    },5000)
    if (socket.hasOwnProperty('user')) {
        console.log(socket.connected);
    
    }
}

module.exports.index = async (io, socket)=>{

    socket.status = 'online'

    socket.on('saveData',async(data)=>{
        if (data.uid.length > 0 && !socket.hasOwnProperty('user')) {
            socket.user = {uid:data.uid}
            socket.status = 'online'
            db.update('users',data.uid,{
                userState:'online'
            })
        }else if (socket.hasOwnProperty('status')) {
            if (socket.status == 'offline') {
                socket.status = 'online'
                db.update('users',socket.user.uid,{
                    userState:'online'
                })
            }
        }
    })

    socket.on('reqStatus', async()=>{

        io.emit('resStatus',)
    })
}