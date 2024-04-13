const db = require('../Firebase/models');
const functions = require('../functions');

module.exports.desc = async (io,socket)=>{
    if (socket.hasOwnProperty('room')) {
        var room = await db.findOne({colecao:"Conections",doc:socket.room})
        socket.leave(socket.room)
        console.log(room);
        var pessoas = room.pessoas
        
        if (pessoas.includes(socket.user.uid)) {
            socket.broadcast.emit('isMyUser',socket.user.uid)
        }

        await db.update('users',socket.user.uid,{
            joinroom:null
        })
        let removePessoa = pessoas
        const index = await removePessoa.indexOf(socket.user.uid);
        if (index !== -1) {
            await removePessoa.splice(index, 1);
        }
        
        await db.update('Conections',socket.room,{
            pessoas: await removePessoa
        })
        socket.broadcast.emit('leave_user',socket.user.uid);
    }
}

module.exports.index = async (io, socket)=>{

    socket.on('refreshMusic',async(data)=>{
        let musicData = await functions.searchTrackLink(data.findMusic).then((res)=>{
            if (res == 'erro') {
                return {erro:"Não foi possivel encontrar a musica"}
            }
            return res
        }).catch(err=>{
            console.log(err);
            return {erro:err}
        })
        if (!musicData.hasOwnProperty('erro')) {
            db.findOne({colecao:'Conections',doc:data.room}).then(async(res)=>{
                await res.queue.forEach((element,index,arr)=>{
                    if (element.musica == musicData.musica && element.banda == musicData.banda) {
                        element.link = musicData.link
                    }
                })
                db.update('Conections',data.room,{
                    musicaAtual:musicData,
                    queue: res.queue
                })
                io.to(data.userSocket).emit('receiveCommand', {typeResult:'fullPlay',command:'/play',user:data.userUID, date:'null', queueIndex:'null',linkInfos:musicData});

                
            }).catch((err)=>{console.log(err);})
            
        }else{
            io.to(data.room).emit('Reqerror', {erroType:'findMusic',errorText:musicData.erro});
        }
    })

    socket.on('initVote',async(data)=>{
        io.to(data.roomID).emit('reqVote', data)

    })
    socket.on('resVote',async(data)=>{
        if (data.numberVotes > data.numberRecuses) {
            functions.percentualNumber(data.numberVotes,data.roomUserNumber,80).then((res)=>{
                if (res == true) {
                    socket.to(data.roomID).emit('resultVote',data, true);
                }else{
                    socket.to(data.roomID).emit('resultVote',data, false);
                }
            })
        }else{
            socket.to(data.roomID).emit('resultVote',data,false);
        }
        
        
    })

    
    socket.on("reqTimeMusic",async(user,room,socketID)=>{
        io.to(room).emit('TimeMusicPost', user,room,socketID)
        
    })
    socket.on('resTimeMusic',async(data)=>{
        io.to(data.socketID).emit('TimeMusicGet',data)
    })
   
    socket.on("indexMusic",async(musicIndex,room)=>{
        io.to(room).emit('resultCommandsMusic', musicIndex,room)
        await db.update('Conections',room,{
            positionQueue:musicIndex
        })
    })

    socket.on('getCommand', async(data)=>{
        switch (data.command) {
            case '/play':
                var roomData = await db.findOne({colecao:'Conections',doc:data.room})
                var roomQueue = roomData.queue
                var roomQueueCount = roomQueue.length + 1
                async function validLinkType(data) {
                     switch (data.type) {
                        case 'youtube':
                            if (data.link.includes('/playlist')) {
                                let playlistDataYt = await functions.getPlaylistYoutube(data.link);
                                const promises = [];
                                
                                for (const [index, element] of playlistDataYt.entries()) {
                                    let matchLink = element.match(/[?&]v=([^&]+)/);
                                    let playlistID =  matchLink ? matchLink[1] : null;
                                    if (playlistID) {
                                        let linkData = await functions.getLinkYtData(element)
                                        linkData.index = roomQueueCount + index
                                        promises.push(linkData);
                                    } else {
                                        
                                        console.error('ID de playlist inválido:', element);
                                        return {erro:"ID de playlist inválido"}
                                    }
                                }

                                await Promise.all(promises);
                                return {
                                    type:'youtubePlaylist',
                                    playlistDataRes : promises
                                }
                            }else{
                                let linkData = await functions.getLinkYtData(data.link)
                                return linkData
                            } 
                            break;
                        case 'songName':
                            return await functions.searchTrackLink(data.link).then((res)=>{
                                if (res == 'erro') {
                                    return {erro:"Não foi possivel encontrar a musica"}
                                }
                                return res
                            }).catch(err=>{
                                console.log(err);
                                return {erro:err}
                            })
                            break;
                        case 'spotify':
                            if (data.link.includes('/playlist/')) {
                                return alert('Atualmente não aceitamos playlists do spotify')
                            }else{
                                const response2 = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(data.link)}`);
                                const data2 = await response2.json();
                                
                                const infoRES = await ytdl.getInfo(data2.linksByPlatform.youtube.url);
                                const linkRES = ytdl.chooseFormat(infoRES.formats, { filter: 'audioonly' }).url
                                const resInfos = data2.entitiesByUniqueId[data2.entityUniqueId]
                                return {
                                    thumbnail: resInfos.thumbnailUrl,
                                    musica: resInfos.title,
                                    banda: resInfos.artistName,
                                    link: linkRES,
                                };
                            }
                            break
                        default:
                            break;
                    }
                }
            
                
               

                let verifyLinkResult = await validLinkType(data)
                if (verifyLinkResult == undefined || 'erro' in verifyLinkResult) {
                    if (verifyLinkResult == undefined) {
                        verifyLinkResult = {
                            erro:'Ocorreu Algum erro ao iniciar a musica!'
                        }
                    }
                    switch (verifyLinkResult.erro) {
                        case 'Não foi possivel encontrar a musica':
                            io.to(data.room).emit('Reqerror', {erroType:'playMusic',errorText:verifyLinkResult.erro});
                            break;
                    
                        default:
                            break;
                    
                    }
                    
                    return
                }

                if (verifyLinkResult.type == 'youtubePlaylist') {
                    var roomDataPl = await db.findOne({colecao:'Conections',doc:data.room})
                    let roomModifyAddPlaylist = roomDataPl.queue
                    var roomQueueCount = roomDataPl.queue.length + 1
                    await verifyLinkResult.playlistDataRes.forEach(async(element,index)=>{
                        let elementResolve = await Promise.resolve(element)
                        if (roomModifyAddPlaylist.length == 0 && index == 0) {
                            io.to(data.room).emit('getMuiscPlaylist', {user:data.user,typeResult:'play', date:data.date,queueIndex:roomQueueCount, linkInfos:elementResolve});
                            db.update('Conections',data.room,{
                                musicaAtual:{
                                    link:elementResolve.link,
                                    thumbnail: elementResolve.thumbnail ? elementResolve.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                                    banda:elementResolve.banda,
                                    musica:elementResolve.musica
                                }
                            })
                        }else{
                            io.to(data.room).emit('getMuiscPlaylist', {user:data.user,typeResult:'queue', date:data.date,queueIndex:roomQueueCount, linkInfos:elementResolve});
                        }
                        await roomModifyAddPlaylist.push(elementResolve)
                    })
                    let mensageObj = await roomDataPl.mensages
                    await mensageObj.push({
                        userUID:data.user.uid,
                        mensageDate: data.date,
                        userName: data.user.displayName,
                        userPic: data.user.profilePic,
                        command:data.command,
                        type:'playlistYT',
                    })
                    db.update('Conections',data.room,{
                        queue:roomModifyAddPlaylist,
                        mensages:mensageObj
                    })

                    return
                }

                if (verifyLinkResult.type == 'spotifyPlaylist') {
                    console.log(verifyLinkResult);
                    // io.to(data.room).emit('test',verifyLinkResult.playlistData );
                    return
                }
                let modelAddMusic = {
                    link:verifyLinkResult.link,
                    thumbnail: verifyLinkResult.thumbnail ? verifyLinkResult.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                    banda:verifyLinkResult.banda,
                    musica:verifyLinkResult.musica
                }

                
                
                if (roomQueue.length == 0) {
                    io.to(data.room).emit('receiveCommand', {typeResult:'play',command:data.command,user:data.user, date:data.date, queueIndex:roomQueueCount,linkInfos:modelAddMusic});
    
                    await db.update('Conections',data.room,{
                        musicaAtual:modelAddMusic
                    })
                }else{
                    io.to(data.room).emit('receiveCommand', {typeResult:'queue',command:data.command,user:data.user, date:data.date,queueIndex:roomQueueCount, linkInfos:modelAddMusic});
                }
                let modelAddMusicQueue = modelAddMusic
                modelAddMusicQueue.index = roomQueueCount
                await roomQueue.push(modelAddMusicQueue)
                await db.update('Conections',data.room,{
                    queue:roomQueue
                })
                
                
                
                let mensageObj = await roomData.mensages
                await mensageObj.push({
                    userUID:data.user.uid,
                    mensageDate: data.date,
                    userName: data.user.displayName,
                    userPic: data.user.profilePic,
                    command:data.command,
                    resCommand:{
                        link:verifyLinkResult.link,
                        thumbnail: verifyLinkResult.thumbnail ? verifyLinkResult.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                        banda:verifyLinkResult.banda,
                        musica:verifyLinkResult.musica
                    }
                })
                await db.update('Conections',data.room,{
                    mensages:mensageObj
                })
                break;
            case '/clear':
                switch (data.action) {
                    case 'apagar o chat':
                        io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,});
                        await db.update('Conections',data.roomID,{
                            mensages:[]
                        })
                        break;
                    case 'parar a musica atual':
                        if (data.other.link) {
                            const roomDataClear = await db.findOne({colecao:'Conections',doc:data.roomID})
                            let roomQueueClear = roomDataClear.queue
                            let newArrayQueue = []
                            let indexArray = 0
                            await roomQueueClear.forEach((element,index)=>{
                                indexArray ++ 
                                if (element.link == data.other.link) {
                                    indexArray -- 
                                }else{
                                    newArrayQueue.push({
                                        link:element.link,
                                        thumbnail: element.thumbnail,
                                        banda:element.banda,
                                        musica:element.musica,
                                        index: indexArray
                                    })
                                }
                            })
                            await db.update('Conections',data.roomID,{
                                musicaAtual:{},
                                queue:newArrayQueue
                            })
                            io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                        }else{
                            io.to(data.roomID).emit('Reqerror', {erroType:'empty',errorText:'Não tem nenhuma musica em reprodução para ser apagada!'});
                        }
                        
                        break;
                    case 'apagar a fila de reprodução':
                        io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,});
                        await db.update('Conections',data.roomID,{
                            musicaAtual:{},
                            queue:[]
                        })
                        break
                    
                }
                break
            case '/indexChange':
                const roomDataChange = await db.findOne({colecao:'Conections',doc:data.roomID})
                let roomDataQueue = roomDataChange.queue
                if (data.other > roomDataQueue.length || data.other <= 0) {
                    return
                }
                io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                await db.update('Conections',data.roomID,{
                    positionQueue:data.other,
                    musicaAtual:roomDataQueue[data.other - 1]
                })
                break
            case '/kick':
                const roomDataKick = await db.findOne({colecao:'Conections',doc:data.roomID})
                const roomPessoas = roomDataKick.pessoas
                const index = await roomPessoas.indexOf(data.other);
                if (index !== -1) {
                    await roomPessoas.splice(index, 1);
                }
                
                await db.update('Conections',data.roomID,{
                    pessoas:roomPessoas
                })

                io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                break
        }
    })

    socket.on('sendMessage', async(data) => {
        let roomData = await db.findOne({colecao:'Conections',doc:data.room})
        let mensageObj = await roomData.mensages
        io.to(data.room).emit('receiveMessage', {mensage:data.mensage,user:data.user,date:data.date});
        await mensageObj.push({
            userUID:data.user.uid,
            mensageDate: data.date,
            userName: data.user.displayName,
            userPic: data.user.profilePic,
            mensage: data.mensage
        })
        await db.update('Conections',data.room,{
            mensages:mensageObj
        })
        
    });
    
    socket.on('joinRoom',async (data) => {
        let myUser = await db.findOne({colecao:'users',doc:data.uid})
        var room = await db.findOne({colecao:"Conections",doc:data.roomID})

        var pessoas = room.pessoas
        socket.join(data.roomID);
        if (pessoas.includes(myUser.uid)) {
            return
        }

        socket.user = myUser
        socket.room = data.roomID
        await db.update('users',data.uid,{
            joinroom: data.roomID,
        })
        await pessoas.push(data.uid)
        await db.update('Conections',data.roomID,{
            pessoas:pessoas
        })
       
        socket.broadcast.emit('join_user',myUser.uid);

        socket.on('disconnect', async () => {
            if (pessoas.includes(data.uid)) {
                socket.broadcast.emit('isMyUser',data.uid)
            }
    
            await db.update('users',data.uid,{
                joinroom:null
            })
            let removePessoa = pessoas
            const index = await removePessoa.indexOf(data.uid);
            if (index !== -1) {
                await removePessoa.splice(index, 1);
            }
            await db.update('Conections',data.roomID,{
                pessoas: await removePessoa
            })
            socket.broadcast.emit('leave_user',data.uid);
            socket.leave(data.roomID)
        });
    });

    socket.on('leaveRoom', async(data) => {
        var room = await db.findOne({colecao:"Conections",doc:data.roomID})
        
        var pessoas = room.pessoas

        if (pessoas.includes(data.uid)) {
            socket.broadcast.emit('isMyUser',data.uid)
        }

        await db.update('users',data.uid,{
            joinroom:null
        })
        let removePessoa = pessoas
        const index = await removePessoa.indexOf(data.uid);
        if (index !== -1) {
            await removePessoa.splice(index, 1);
        }
        await db.update('Conections',data.roomID,{
            pessoas: await removePessoa
        })
        socket.broadcast.emit('leave_user',data.uid);
        socket.leave(data.roomID)
    });
}