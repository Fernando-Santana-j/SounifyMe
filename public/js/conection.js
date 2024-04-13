let isSize = window.innerWidth > 1190 ? true : false
window.addEventListener('resize', function() {
    // Captura a largura e altura da janela
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width <= 1190) {
        isSize = false
    }else{
        isSize = true
    }
});
const createOpen = new URLSearchParams(window.location.search).get('create');

if (createOpen == 'true') {
    $.ajax({
        traditional: true,
        url: '/getcodesroom',
        type: 'POST',
        success: function(response) {
            if (response.success == true) {
                document.getElementById('create-room-inv-code-span').innerText = response.roomInvateCode
                document.getElementById('inv-roomcode').value = response.roomInvateCode
                document.getElementById('inv-roomid').value = response.roomId
                
                document.getElementById('create-room-containner').show('flex')
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    }) 
}



document.getElementById('find-room-icon').addEventListener('click',()=>{
    if (document.getElementById('find-room-input').value == 0) {
        document.getElementById('find-room-input').focus()
    }else{
        findRoom(document.getElementById('find-room-input').value)
    }
})

addEventListener('keypress',(keyArray)=>{
    let keyCode = keyArray.keyCode
    if (keyCode == 13) {
        if (document.getElementById('find-room-input').value > 0) {
            findRoom(document.getElementById('find-room-input').value)
        }else{

        }
    }
})

function findRoom(value){
    console.log(value);
}


document.getElementById('direct-connection-button').addEventListener('click',()=>{
    let codeInv = document.getElementById('direct-connection-input').value
    console.log(codeInv);
    $.ajax({
        traditional: true,
        url: '/findRoomInv',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            codeInv: parseInt(codeInv),
        } ), 
        success: function(response) {
            if (response.success == true) {
                location.href = '/room/'+response.roomID
            }else{
                
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
})

async function reqRooms(data) {
    $.ajax({
        traditional: true,
        url: '/findconnection',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            roomId: data,
        } ), 
        success: function(response) {
            if (response.success == true) {
                let room = response.room
                let banda = room.musicaAtual == null || room.musicaAtual == undefined ? 'Nome Da Banda' : room.musicaAtual.banda 
                let musica = room.musicaAtual == null || room.musicaAtual == undefined ? 'Nome Da Musica' : room.musicaAtual.musica
                document.getElementById('server-list-right-containner').style.width = '20%'
                document.getElementById('server-list-left-content').style.width ='100%'
                document.getElementById('server-list-right-containner').innerHTML = `
                        <div id="server-list-right-content">
                        <div id="server-list-right-top-infos">
                            <div id="room-right-pic">
                                <img id="room-right-pic-img" src="${room.roomPic}" >
                            </div>
                            <div id="room-right-title">
                                <h1 id="room-right-title-h1">${room.roomName}</h1>
                            </div>
                        </div>
                        <div class="linha"></div>
                        <div id="server-list-right-music-infos">
                            <h1 id="room-right-tocando">Tocando</h1>
                            <div id="room-right-music-pic">
                                <img id="room-right-music-pic-img" src="${room.musicaAtual == null || room.musicaAtual == undefined ? 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg' : room.musicaAtual.thumbnail }">
                            </div>
                            <div id="room-right-music-name">
                                <h1 id="room-right-music-name-h1">${musica}</h1>
                            </div>
                            <div id="room-right-music-banda">
                                <p id="room-right-music-banda-p">${banda}</p>
                            </div>
                        </div>
                        <div class="linha"></div>
                        <div id="server-list-right-others-infos">
                            <div id="server-list-right-others-infos-islocked">
                                <h1 id="server-list-right-others-infos-islocked-h1">${room.islocked == false ? "Sem Senha" : "Com Senha"}</h1>
                            </div>
                            <div id="server-list-right-others-infos-estilos">
                                <h1 id="server-list-right-others-infos-estilos-h1">${room.estilos}</h1>
                            </div>
                            <div id="server-list-right-others-infos-pessoas">
                                <h1 id="server-list-right-others-infos-pessoas-h1">${room.pessoas.length} pessoas de ${room.maxpessoas}</h1>
                            </div>
                            
                        </div>
                        <div class="linha"></div>
                        <div id="server-list-right-button-containner">
                            <div id="server-list-right-button-content" data-roomId="${room.roomId}">
                                <span id="server-list-right-button-span">Entrar</span>
                                <svg id="server-list-right-button-svg" viewBox="-27 0 448 448" xmlns="http://www.w3.org/2000/svg"><path d="m341.332031 448h-224v-138.667969h21.335938v117.335938h202.664062c17.601563 0 32-14.402344 32-32v-341.335938c0-17.597656-14.398437-32-32-32h-202.664062v117.335938h-21.335938v-138.667969h224c29.46875 0 53.335938 23.867188 53.335938 53.332031v341.335938c0 29.464843-23.867188 53.332031-53.335938 53.332031zm0 0"></path><path d="m203.867188 312.535156-15.066407-15.070312 73.464844-73.464844-73.464844-73.464844 15.066407-15.070312 88.53125 88.535156zm0 0"></path><path d="m0 213.332031h277.332031v21.335938h-277.332031zm0 0"></path></svg>
                            </div>
                        </div>
                    </div>
                `
                document.getElementById('server-list-right-button-content').addEventListener('click',()=>{
                    joinRoom({roomID:document.getElementById('server-list-right-button-content').getAttribute('data-roomId'), uid:uid})
                })
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
}

document.getElementById('random-room-button').addEventListener('click',async()=>{
    if (isSize == true) {
        await reqRooms('random')
    }
})

document.querySelectorAll('.server-list-col').forEach((element,index)=>{
    element.addEventListener('click',()=>{
        let roomId = element.getAttribute('data-roomId')
        if (isSize == true) {
            reqRooms(roomId)
        }
        
    })
})


document.querySelectorAll('.enter-room').forEach((element,index)=>{
    element.addEventListener('click',()=>{
        joinRoom({roomID:element.getAttribute('data-roomId'), uid:uid})
    })
})
function joinRoom(data) {
    // socket.emit('joinRoom', {roomID:data.roomID, uid:data.uid});
    location.href = '/room/'+data.roomID
}

document.getElementById('direct-connection-popup-close').addEventListener('click',()=>{
    document.getElementById('direct-connection-popup-containner').hide()
})

document.getElementById('close-popup-button-direct').addEventListener('click',()=>{
    document.getElementById('direct-connection-popup-containner').hide()
})

document.getElementById('direct-button').addEventListener('click',()=>{
    document.getElementById('direct-connection-popup-containner').show('flex')
})

document.getElementById('refresh-button').addEventListener('click',()=>{
    refreshRooms()
})

function refreshRooms() {
    $.ajax({
        traditional: true,
        url: '/getRoom',
        type: 'POST',
        success: function(response) {
            if (response.success == true) {
                document.getElementById('server-list-row').innerHTML = ''
                 
                response.data.forEach((element,index)=>{
                    let musicaAtual = 'musicaAtual' in element ? 'musica' in element.musicaAtual ? element.musicaAtual.musica : null : null
                    document.getElementById('server-list-row').innerHTML += `
                    <div class="server-list-col" data-index="${index}" data-roomId="${ element.roomId }">
                        <div class="server-list-col-img-text-containner">
                            <div class="server-list-img">
                                <img src="${element.roomPic} ">
                            </div>
                            <div class="server-list-texts">
                                <div class="server-list-name">
                                    <h1 class="server-list-name-h1">${element.roomName}</h1>
                                </div>
                                <div class="server-list-musicAc">
                                    <span class="server-list-musicAc-span">Tocando:<p class="server-list-musicAc-p" title="${musicaAtual}">${musicaAtual}</p></span>
                                </div>
                            </div>
                        </div>
                        <div class="server-list-style-containner" title="${element.estilos}">
                            <h1 class="server-list-style-title">Estilo Musical</h1>
                            <p class="server-list-style-p">${element.estilos}</p>
                        </div>
                        <div class="server-list-status">
                            <div class="number-people-containner">
                                <p class="number-people-p">${element.pessoas.length} / ${element.maxpessoas}</p>
                            </div>
                            <div class="islocked-containner">
                                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 65.469 65.469" style="enable-background:new 0 0 65.469 65.469;" xml:space="preserve"><g><path d="M50.504,23.929h-0.603v-6.762C49.902,7.701,42.202,0,32.736,0S15.569,7.701,15.569,17.167v6.762h-0.604 c-5.401,0-9.796,4.395-9.796,9.797v21.946c0,5.402,4.395,9.797,9.796,9.797h35.54c5.401,0,9.796-4.395,9.796-9.797V33.726 C60.3,28.324,55.905,23.929,50.504,23.929z M21.569,17.167C21.569,11.01,26.577,6,32.736,6c6.157,0,11.166,5.009,11.166,11.167 v6.762H21.569V17.167z M54.3,55.673c0,2.094-1.703,3.797-3.796,3.797H14.965c-2.093,0-3.796-1.703-3.796-3.797V33.726 c0-2.094,1.703-3.797,3.796-3.797h35.54c2.093,0,3.796,1.703,3.796,3.797L54.3,55.673L54.3,55.673z"></path><path d="M32.734,37.163c-3.321,0-6.014,2.692-6.014,6.014c0,2.227,1.214,4.167,3.014,5.207v6.686h6v-6.686 c1.8-1.04,3.014-2.98,3.014-5.207C38.748,39.855,36.055,37.163,32.734,37.163z"></path></g></svg>
                            </div>
                        </div>
                        <div class="enter-room" data-roomId="${element.roomId}">
                            <svg viewBox="-27 0 448 448" xmlns="http://www.w3.org/2000/svg"><path d="m341.332031 448h-224v-138.667969h21.335938v117.335938h202.664062c17.601563 0 32-14.402344 32-32v-341.335938c0-17.597656-14.398437-32-32-32h-202.664062v117.335938h-21.335938v-138.667969h224c29.46875 0 53.335938 23.867188 53.335938 53.332031v341.335938c0 29.464843-23.867188 53.332031-53.335938 53.332031zm0 0"></path><path d="m203.867188 312.535156-15.066407-15.070312 73.464844-73.464844-73.464844-73.464844 15.066407-15.070312 88.53125 88.535156zm0 0"></path><path d="m0 213.332031h277.332031v21.335938h-277.332031zm0 0"></path></svg>
                        </div>
                    </div>
                    <div class="linha"></div>
                `
                })
                document.querySelectorAll('.server-list-col').forEach((element,index)=>{
                    element.addEventListener('click',()=>{
                        let roomId = element.getAttribute('data-roomId')
                        if (isSize == true) {
                            reqRooms(roomId)
                        }
                        
                    })
                })
                document.querySelectorAll('.enter-room').forEach((element,index)=>{
                    element.addEventListener('click',()=>{
                        joinRoom({roomID:element.getAttribute('data-roomId'), uid:uid})
                    })
                })
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
}


document.getElementById('create-room-button').addEventListener('click',async()=>{
    let codes = await new Promise((resolve, reject) => {
        $.ajax({
            traditional: true,
            url: '/getcodesroom',
            type: 'POST',
            success: function(response) {
                if (response.success == true) {
                    resolve({roomInvateCode:response.roomInvateCode,roomId:response.roomId})
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
    document.getElementById('create-room-inv-code-span').innerText = codes.roomInvateCode
    document.getElementById('inv-roomcode').value = codes.roomInvateCode
    document.getElementById('inv-roomid').value = codes.roomId
    document.getElementById('create-room-containner').show('flex')
    history.pushState({}, '', '/conection?create=true');
})

