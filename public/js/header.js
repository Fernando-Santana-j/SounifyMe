import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signOut} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';



let miniperfil = document.getElementById('mini-perfil-header-content')
let optionsMiniperfil = document.getElementsByClassName('mini-perfil-options-popup')
let miniPerfilMiniHeader = document.getElementById('profile-image-miniheader')
let header = document.getElementById('header')
let miniHeader = document.getElementById('miniHeader')

let isSetNoneMenu = window.innerWidth < 700 ? true : false

const menuType = localStorage.getItem('menu')

addEventListener('resize',()=>{
    let windowWidth = window.innerWidth
    if (windowWidth > 1000) {
        setMenuResize('full')
        isSetNoneMenu = false
    }
    if (windowWidth < 700) {
        isSetNoneMenu = true
        setMenuResize('none')
    }
    
    if (windowWidth <= 1000) {
        setMenuResize('mini')
    }   
    if (windowWidth <= 500) {
        setMenuResize('none')
    }
})

if (window.innerWidth <= 1000) {
    setMenuResize('mini')
}   

if (window.innerWidth <= 500) {
    setMenuResize('none')
}
switch (menuType) {
    case 'full':
        setMenuResize('full')
        break;
    case 'mini':
        setMenuResize('mini')
        break
    case 'none':
        setMenuResize('none')
        break
    default:
        if (isSetNoneMenu == true) {
            localStorage.setItem('menu','none')
            setMenuResize('none')
        }else{
            localStorage.setItem('menu','full')
            setMenuResize('full')
        }
        break;
}
document.getElementById('hamburgerMenu').addEventListener('click', ()=>{
    if (isSetNoneMenu == true) {
        if (localStorage.getItem('menu')  == 'full' || localStorage.getItem('menu') == 'mini') {
            setMenuResize('none')
        }else{
            setMenuResize('mini')
        }
    }else{
        let menudata = localStorage.getItem('menu') ? localStorage.getItem('menu') : 'full'
        if (menudata == 'mini') {
            setMenuResize('full')
        }else{
            setMenuResize('mini')
        }
        
    }
    
})


function setMenuResize(type) {
    switch (type) {
        case 'full':
                header.show('flex')
                miniHeader.hide()
                localStorage.setItem('menu','full') 
                document.getElementById('main-containner').style.width = 'calc(100% - 15em)'
            break;
        case 'mini':
            document.getElementById('main-containner').style.width = 'calc(100% - 4em)'
            header.hide()
            miniHeader.show('flex')
            localStorage.setItem('menu','mini') 
            break
        case 'none':
            header.hide()
            miniHeader.hide()
            localStorage.setItem('menu','none') 
            document.getElementById('main-containner').style.width ='100%'
            break
        default:
            if (isSetNoneMenu == true) {
                localStorage.setItem('menu','none')
                header.hide()
                miniHeader.hide()
                document.getElementById('main-containner').style.width ='100%'
            }else{
                header.show('flex')
                miniHeader.hide()
                localStorage.setItem('menu','full')
            }
            break;
    }
}


miniperfil.addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})

miniPerfilMiniHeader.addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})

document.getElementById('close-options').addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})





document.getElementById('logout').addEventListener('click',()=>{
    location.href = '/logout'
})
var numberPlaylist = parseInt(playlists.length)

document.querySelectorAll('.playlistCreate').forEach(element=>{
    element.addEventListener("click",()=>{

        $.ajax({
            traditional: true,
            url: '/createPlaylist/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                numberPlaylist: numberPlaylist + 1
            } ), 
            success: function(response) {
                console.log(response);
               if (response.success == true) {
                    numberPlaylist + 1
                    document.querySelector('#playlists-created-mini').innerHTML += `
                            <li><a href="/playlist/${response.newPlaylist.playlistUID}"><img class="svg-icons-Miniheader" src="${response.newPlaylist.playlistImg}" alt=""><span class="miniHeader-text-links">${response.newPlaylist.playlistName}</span></a></li>
                        `
                    
                    document.querySelector('#playlists-created').innerHTML += `
                            <li><a href="/playlist/${response.newPlaylist.playlistUID}"><img class="svg-icons-header" src="${response.newPlaylist.playlistImg}" alt=""><span class="header-text-links">${response.newPlaylist.playlistName}</span></a></li>
                        `
               }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
})

