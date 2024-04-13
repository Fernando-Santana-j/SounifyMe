let bannerContinner = document.getElementById('banner-continner')
if (bannerContinner.getAttribute('data-type') == 'color') {
    let color = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('banner-color').style.backgroundColor = '#'+color
}
var url = window.location.pathname
var partes = url.split("/");
var uid = partes.pop();

let folowInfoPopup = document.getElementById('folow-info-popup-containner')


var pageinPageSeguidores = 1
var pageinPageSeguindo = 1

let isMyProfile = document.getElementsByTagName('body')[0].getAttribute('data-isMy')
document.getElementsByTagName('body')[0].removeAttribute('data-isMy')

function resetFolowPopups() {
    document.querySelector("#seguindo-popup .folow-info-row").innerHTML = ``
    document.querySelector("#seguidores-popup .folow-info-row").innerHTML = ``
    pageinPageSeguidores = 1
    pageinPageSeguindo = 1
    document.getElementById('seguidores-popup').setAttribute('data-page-seguidores',1)
    document.getElementById('seguindo-popup').setAttribute('data-page-seguindo',1)
}

document.getElementsByClassName('close-popup')[0].addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})
document.getElementsByClassName('close-popup')[1].addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})
document.getElementById('close-popup-out').addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})

if (document.getElementById('edit-profile-popup-containner')) {
    let popupEditContainner = document.getElementById('edit-profile-popup-containner')
    
    document.getElementById('button-editar').addEventListener('click',()=>{
        popupEditContainner.show('flex')
    })

    document.getElementById('close-popup-out-edit').addEventListener('click',()=>{
        popupEditContainner.hide()
    })

    document.getElementById('close-edit').addEventListener('click',()=>{
        popupEditContainner.hide()
    })
}

if (document.getElementById('close-popup-banner-edit')) {
    document.getElementById('close-popup-banner-edit').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}

if (document.getElementById('circle-img')) {
    document.getElementById('circle-img').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.getElementById('circle-color')) {
    document.getElementById('circle-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.getElementById('close-popup-banner')) {
    
    document.getElementById('close-popup-banner').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.querySelector('.banner-profile-class')) {
    document.querySelector('.banner-profile-class').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').show("flex")
    })
    
}
if (isMyProfile == 'true') {
    document.getElementById('edit-banner-img').addEventListener('click',(event)=>{
        document.getElementById('profile-banner-input-img').click()
    })
    
}
if (document.getElementById('preview-color')) {
    document.getElementById('preview-color').addEventListener('click',(event)=>{
        document.getElementById('profile-banner-input-color').click()
    })
    
}
if (document.getElementById('edit-banner-color')) {
    document.getElementById('edit-banner-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').show("flex")
    })
    
}
if (document.getElementById('close-popup-banner-edit-color')) {
    document.getElementById('close-popup-banner-edit-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').hide()
    })
    
}
if ( document.getElementById('save-color-banner')) {
    document.getElementById('save-color-banner').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').hide()
    })
    
}

async function folowInfoPopupUserAdd(users,page,plus) {
    await users.forEach(element => {
        document.querySelector("#"+page+"-popup .folow-info-row").innerHTML += `
            <a href="/user/${element.uid}">
                <div class="folow-info-col flex-center" >
                    <div class="profileImg-col-containner flex-center" >
                        <img class="profileImg-col" src="${element.profilePic == null ? "https://res.cloudinary.com/dgcnfudya/image/upload/v1689452893/j4tfvjlyp1ssspbefzg9.png" : element.profilePic}">
                    </div>
                    <div class="usernameProfile-col">
                        <span>${element.displayName}</span>
                    </div>
                    <div class="optionsUser-col">
                        <img class="options-button" src="../public/assets/svg/menu_l2y2ye71lkcy.svg" alt="">
                    </div>
                </div>
            </a>
        `
    });
    if (document.getElementById(`plus-${page}`)) {
        document.querySelector("#"+page+"-popup .folow-info-row").removeChild(document.getElementById(`plus-${page}`))
    }
    if (plus == true) {
        document.querySelector("#"+page+"-popup .folow-info-row").innerHTML += `
            <div id='plus-${page}' class="plus-users"><span class="plus-users-span">Ver Mais</span></div>
        `
    }
}





document.getElementById('seguidores').addEventListener('click',async()=>{
    document.getElementById('folow-info-popup-containner').show('flex')
    document.getElementById('seguidores-popup').show('flex')
    document.getElementById('seguindo-popup').hide()

    await $.ajax({
        traditional: true,
        url: '/findUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            pageinPage: 1,
            pageIndex:'seguidores',
            userUid: uid
        } ),
        dataType: 'json',
        success: function(response) {
            if (response.success == true) {
                contact()
            }   
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
    
    document.querySelector('#plus-seguidores span').addEventListener('click',async()=>{
        let atr = document.getElementById('seguidores-popup').getAttribute('data-page-seguidores')
        pageinPageSeguidores = parseInt(atr) + 1
        document.getElementById('seguidores-popup').setAttribute('data-page-seguidores',pageinPageSeguidores)
        await $.ajax({
            traditional: true,
            url: '/findUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                pageinPage: pageinPageSeguidores,
                pageIndex:'seguidores',
                userUid: uid
            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    folowInfoPopupUserAdd(response.data,'seguidores',response.plus)
                }   
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
    
})

document.getElementById('seguindo').addEventListener('click',async()=>{
    document.getElementById('folow-info-popup-containner').show('flex')
    document.getElementById('seguidores-popup').hide()
    document.getElementById('seguindo-popup').show('flex')

    await $.ajax({
        traditional: true,
        url: '/findUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            pageinPage: 1,
            pageIndex:'seguindo',
            userUid: uid
        } ),
        dataType: 'json',
        success: function(response) {
            if (response.success == true) {
                
                folowInfoPopupUserAdd(response.data,'seguindo',response.plus)
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
    
    
    document.querySelector('#plus-seguindo span').addEventListener('click',async()=>{
        let atr = document.getElementById('seguindo-popup').getAttribute('data-page-seguindo')
        pageinPageSeguindo = parseInt(atr) + 1
        document.getElementById('seguindo-popup').setAttribute('data-page-seguindo',pageinPageSeguindo)
        await $.ajax({
            traditional: true,
            url: '/findUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                pageinPage: pageinPageSeguindo,
                pageIndex:'seguindo',
                userUid: uid
            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    folowInfoPopupUserAdd(response.data,'seguindo',response.plus)
                }   
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })

})
if (isMyProfile == 'false') {
    let buttonOptions = document.getElementById('profile-options-svg')
    let buttonSeguir = document.getElementById('button-seguir')
    let optionsFolow = document.getElementById('options-folow-user-content')
    let optionsContainner = document.getElementById('options-folow-user-containner')
    if (buttonSeguir.getAttribute('data-folow') == "false") {
        document.getElementById('profile-options').hide()
    }else{
        document.getElementById('profile-options').show()
    }


    buttonSeguir.addEventListener('click',()=>{
        if (buttonSeguir.getAttribute('data-folow') == "false") {
            $.ajax({
                traditional: true,
                url: '/folow/' + uid,
                type: 'POST',
                success: function(response) {
                    if (response.success == true) {
                        buttonSeguir.setAttribute('data-folow',true)
                        buttonSeguir.classList.add('seguindo')
                        let seguidores = document.querySelector('#seguidores .number-info')
                        seguidores.innerHTML = response.seguidores
                        document.getElementById('profile-options').show()
                    }
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }else{
            
            $.ajax({
                traditional: true,
                url: '/unfolow/' + uid,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {

                } ),
                dataType: 'json',
                success: function(response) {
                    if (response.success == true) {
                        buttonSeguir.setAttribute('data-folow',false)
                        buttonSeguir.classList.remove('seguindo')
                        let seguidores = document.querySelector('#seguidores .number-info')
                        seguidores.innerHTML = response.seguidores
                        document.getElementById('profile-options').hide()
                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }
    })  

    buttonOptions.addEventListener('click',(event)=>{
        optionsFolow.css({
            left: event.clientX - 10 + "px" ,
            top: event.clientY + 10 + 'px',
        })
        optionsContainner.show('block')
        
        document.getElementById('bloquearUser').addEventListener('click',()=>{
            $.ajax({
                traditional: true,
                url: '/userBlock/' + uid,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {

                } ),
                dataType: 'json',
                success: function(response) {
                    if (response.success == true) {
                        location.reload()
                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        })
        if (document.getElementById('RemoverUser')) {
            document.getElementById('RemoverUser').addEventListener('click',()=>{
                $.ajax({
                    traditional: true,
                    url: '/desfFriend',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify( {
                        profileUser: uid,
                    } ),
                    dataType: 'json',
                    success: function(response) {
                        if (response.success == true) {
                            successNotify('Amizade Desfeita!')
                            document.getElementById('options-folow-user-containner-list').removeChild(document.getElementById('RemoverUser'))
                            let optionsContainnerList = document.getElementById('options-folow-user-containner-list')
                            var novaLi = document.createElement("li");
                            novaLi.id = "AdicionarUser";
                            novaLi.className = "optinosUser-containner-list-item";
                            novaLi.innerHTML = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M2370 5105 c-407 -57 -759 -292 -979 -654 -154 -254 -220 -581 -175 -878 50 -342 219 -644 479 -860 45 -37 48 -42 30 -49 -178 -62 -397 -167 -548 -262 -149 -93 -273 -191 -415 -328 -353 -338 -598 -757 -724 -1238 -26 -100 -32 -140 -32 -231 0 -95 4 -121 28 -190 65 -187 203 -324 391 -387 l70 -23 1321 0 1320 0 41 27 c62 41 88 90 88 168 0 78 -26 127 -88 168 l-41 27 -1295 5 c-1195 5 -1298 6 -1327 22 -65 35 -114 115 -114 186 0 35 47 214 86 327 70 202 214 461 353 635 133 166 330 345 511 464 356 234 720 349 1150 363 333 11 628 -47 974 -192 71 -30 98 -36 132 -32 127 14 212 140 173 258 -28 83 -86 122 -294 199 -49 19 -94 37 -98 40 -4 4 18 28 50 54 32 27 91 84 131 129 484 535 463 1356 -48 1867 -303 303 -726 444 -1150 385z m373 -406 c193 -39 354 -125 493 -263 139 -140 224 -299 264 -496 74 -359 -88 -759 -392 -968 -281 -193 -648 -223 -954 -78 -112 53 -165 89 -249 168 -239 223 -350 565 -285 878 40 197 125 356 264 496 230 229 548 327 859 263z"/><path d="M4102 1889 c-45 -13 -108 -80 -121 -126 -7 -23 -11 -154 -11 -325 l0-287 -308 -3 -309 -3 -40 -27 c-62 -41 -88 -90 -88 -168 0 -78 26 -127 88 -168 l40 -27 308 -3 308 -3 3 -307 c3 -303 3 -307 27 -345 13 -21 42 -50 64-65 34 -23 52 -27 107 -27 55 0 73 4 107 27 22 15 51 44 64 65 24 38 24 42 27 345 l3 307 307 3 c303 3 307 3 345 27 21 13 50 42 65 64 23 34 27 52 27 107 0 55 -4 73 -27 107 -15 22 -44 51 -65 64 -38 24 -42 24 -345 27 l-307 3 -3 307 c-3 303 -3 307 -27 345 -47 76 -151 113 -239 86z"/></g></svg> Adicionar Amigo';
                            optionsContainnerList.insertBefore(novaLi,optionsContainnerList.firstChild)
                            document.getElementById('AdicionarUser').addEventListener('click',()=>{
                                let date = new Date().formatString(new Date())
                                $.ajax({
                                    traditional: true,
                                    url: '/createNot',
                                    type: 'POST',
                                    contentType: 'application/json',
                                    data: JSON.stringify( {
                                        type:'inv-friend',
                                        userinvitado: uid,
                                        date:date
                                    } ),
                                    dataType: 'json',
                                    success: function(response) {
                                        if (response.success == true) {
                                            successNotify('Solicitação de amizade enviada com sucesso!')
                                        }else{
                                            errorNotify('Já existe um pedido de amizade pendente para esse usuário!')
                                        }
                                        
                                    },
                                    error: function(xhr, status, error) {
                                        console.error(error);
                                    }
                                })
                            })
                        }
                        
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                })
            })
            
        }
        if (document.getElementById('AdicionarUser')) {
            document.getElementById('AdicionarUser').addEventListener('click',()=>{
                let date = new Date().formatString(new Date())
                $.ajax({
                    traditional: true,
                    url: '/createNot',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify( {
                        type:'inv-friend',
                        userinvitado: uid,
                        date:date
                    } ),
                    dataType: 'json',
                    success: function(response) {
                        if (response.success == true) {
                            successNotify('Solicitação de amizade enviada com sucesso!')
                        }else{
                            errorNotify('Já existe um pedido de amizade pendente para esse usuário!')
                        }
                        
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                })
            })
        }
        

        document.getElementById('denunciarUser').addEventListener('click',()=>{
            location.href = '/denunciar/' + uid
        })
        
        document.getElementById('pararDeSeguir').addEventListener('click',()=>{
            optionsContainner.hide()
            $.ajax({
                traditional: true,
                url: '/unfolow/' + uid,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {

                } ),
                dataType: 'json',
                success: function(response) {
                    if (response.success == true) {
                        buttonSeguir.setAttribute('data-folow',false)
                        buttonSeguir.classList.remove('seguindo')
                        let seguidores = document.querySelector('#seguidores .number-info')
                        seguidores.innerHTML =  response.seguidores
                        document.getElementById('profile-options').hide()
                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
            
        })
        
        document.getElementById('close-options-folow-user').addEventListener('click',()=>{
            optionsContainner.hide()
        })
            
        
    })
}

if (document.getElementById('desblock')) {
    document.getElementById('desblock').addEventListener('click',()=>{
        $.ajax({
            traditional: true,
            url: '/userUnBlock/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {

            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    location.reload()
                }
                
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
}


if (isMyProfile == 'true') {
    document.getElementById('edit-photo').addEventListener('click',()=>{
        document.getElementById('inputFile-profileImg').click()
     })
    var Imgfile = null
    let imgInputFile = document.getElementById('inputFile-profileImg')
    let previewImage = document.getElementById('imgDisplayUser')
    imgInputFile.addEventListener('change',(event)=>{
        let file = event.target.files[0]
        Imgfile = file
        if (file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            previewImage.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
    
    })
    
    document.getElementById('save-edit').addEventListener('click',async()=>{
        let displayNameValue = document.getElementById('input-displayName').value
        if (Imgfile) {
            var formData = new FormData();
            formData.append('file', Imgfile);
            formData.append('inputValue', displayNameValue);
            $.ajax({
                traditional: true,
                url: '/editProfile/' + uid,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,  
                success: function(response) {
                    if (response.success == true) {
                        if (response.displayName) {
                            document.getElementsByTagName('title')[0].innerHTML = `Perfil - ${response.displayName}`
                            document.getElementById("displayName-profile").innerHTML = response.displayName
                            document.querySelector('#displayName span').innerHTML = response.displayName 
                        }
                        
                        if (Imgfile) {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                document.querySelector('#profile-pic img').src = e.target.result;
                                document.querySelector('#profile-image-miniheader img').src = e.target.result;
                                document.querySelector('#profile-image img').src = e.target.result;
                            };
                            reader.readAsDataURL(Imgfile);
                            
                        }else{
                            location.reload()
                        }
                        
                        
                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }else{
            $.ajax({
                traditional: true,
                url: '/editProfile/' + uid,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {
                    inputValue: displayNameValue
                } ),
                dataType: 'json', 
                success: function(response) {
                    if (response.success == true) {
                        if (response.displayName) {
                            document.getElementsByTagName('title')[0].innerHTML = `Perfil - ${response.displayName}`
                            document.getElementById("displayName-profile").innerHTML = response.displayName
                            document.querySelector('#displayName span').innerHTML = response.displayName
                        }

                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }
        document.getElementById('edit-profile-popup-containner').hide()   
        successNotify('Perfil Editado!')
    })




    document.getElementById('profile-banner-input-img').addEventListener('change',(event)=>{
        let Imgfile = event.target.files[0]
        var formData = new FormData();
            formData.append('file', Imgfile);
            formData.append('type', "image");
            $.ajax({
                traditional: true,
                url: '/editProfileBanner/' + uid,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,  
                success: function(response) {
                    if (response.success == true) {
                        if (Imgfile) {
                            if (isMyProfile == 'true') {
                                document.getElementById("banner-continner").innerHTML = ` 
                                    <div id="banner-img"> 
                                        <div class="banner-profile-class"></div>
                                        <img src="">
                                    </div>
                                `
                            }else{
                                document.getElementById("banner-continner").innerHTML = ` 
                                    <div id="banner-img">
                                        <img src="">
                                    </div>
                                `
                            }
                            document.querySelector('.banner-profile-class').addEventListener('click',()=>{
                                document.getElementById('edit-banner-containner').show("flex")
                            })
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                document.querySelector('#banner-img img').src = e.target.result;
                            };
                            reader.readAsDataURL(Imgfile);
                            successNotify('Banner Editado!')
                        }else{
                            setTimeout(()=>{
                                location.reload()
                            },3000)
                        }

                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
    })
    if (document.getElementById('banner-color')) {
        document.getElementById('banner-color').style.backgroundColor =  document.getElementById('banner-color').getAttribute('data-color')
        
        
    }
    document.getElementById('profile-banner-input-color').value = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('preview-color').style.backgroundColor = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('profile-banner-input-color').addEventListener('change',(event)=>{
        document.getElementById('preview-color').style.backgroundColor = document.getElementById('profile-banner-input-color').value
    })
    document.getElementById('save-color-banner').addEventListener('click',(event)=>{
        let colorInput = document.getElementById('profile-banner-input-color').value
        $.ajax({
            traditional: true,
            url: '/editProfileBanner/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                type: "color",
                color: colorInput
            } ), 
            success: function(response) {
                if (response.success == true) {
                    if (isMyProfile == 'true') {
                        document.getElementById("banner-continner").innerHTML = ` 
                            <div id="banner-color" data-color="${colorInput}"> 
                                <div class="banner-profile-class"></div>
                            </div>
                        `
                    }else{
                        document.getElementById("banner-continner").innerHTML = ` 
                            <div id="banner-color" data-color="${colorInput}"></div>
                        `
                    }
                    document.querySelector('.banner-profile-class').addEventListener('click',()=>{
                        document.getElementById('edit-banner-containner').show("flex")
                    })
                    document.getElementById('banner-color').style.backgroundColor =  colorInput
                    document.getElementById('preview-color').style.backgroundColor = colorInput
                    successNotify('Banner Editado!')
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
}



