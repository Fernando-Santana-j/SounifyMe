let userNotPopup = document.getElementById('user-options-notifications-popup')


function reqNot(elementReturn) {

    $.ajax({
        traditional: true,
        url: '/reqMyNots/' + uid,
        type: 'POST',
        success: function(response) {
            console.log(response);
            if (response.success == true) {
                
                document.getElementById('user-options-notifications-popup-row').innerHTML = ''
                if (response.data != null) {
                    response.data.forEach((element)=>{
                        if (element.userinvitador.uid != elementReturn.userinvitador.uid && element.type != elementReturn.type) {
                            document.getElementById('user-options-notifications-popup-row').innerHTML +=`
                            <div class="user-options-notifications-col" data-uid="${element.userinvitador.uid}">
                                <div class="user-options-notifications-col-img">
                                    <img src="${element.userinvitador.profilePic}">
                                </div>
                                <div class="user-options-notifications-col-content">
                                    <div class="user-options-notifications-col-content-text">${ element.userinvitador.displayName } ${ element.type == 'inv-friend' ? 'quer ser seu amigo, deseja aceitar?' : ''}</div>
                                    <div class="user-options-notifications-col-cotent-date">${ element.date }</div>
                                </div>
                                <div class="user-options-notifications-col-options">
                                    <div class="user-options-notifications-col-options-button" data-type="${element.type}">
                                        <span class="user-options-notifications-col-options-button-texts">
                                            Options <span class="options-col-not-plus"> > </span>
                                        </span>
                                        <div class="user-options-notifications-col-options-box" >
                                            <div data-value="sim" id='sim-option' class="user-options-notifications-col-options-box-col">
                                                Sim ✅
                                            </div>
                                            <div data-value="nao" id='nao-option' class="user-options-notifications-col-options-box-col">
                                                Não ❌
                                            </div>
                                            <div data-value="fechar" id='fechar-option' class="user-options-notifications-col-options-box-col">
                                                Fechar
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            ` 
                        }
                        
                    })
                }
                optionsNot()
                
            }
            
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })

}

document.getElementById('user-options-notifications-button').addEventListener('click',(event)=>{
    reqNot({type:null,userinvitador:{uid:null}})
    let optionsPopup = document.getElementById('user-options-notifications-popup')
    optionsPopup.show()
    optionsPopup.css({
        top: event.clientY + 5 + 'px',
        left: event.clientX - document.getElementById('user-options-notifications-popup-content').offsetWidth + 'px',
    })
})

function optionsNot() {
    let isOpen = false
    function handleClick() {
        return function(){
            function hideMenuOnClickOutside(type) {
                
                document.removeEventListener("click", hideMenuOnClickOutside);
                document.removeEventListener('click', handleClick);
                isOpen = false
                reqNot(type == 'fechar' ? {type:null,userinvitador:{uid:null}} : {type:typeNot,userinvitador:{uid:userInv}})
            }
            if (isOpen == true) {
                hideMenuOnClickOutside('fechar')
                return
            }
            const element = this
            document.removeEventListener('click', handleClick);
            let box = element.querySelector('.user-options-notifications-col-options-box');
            isOpen = true
            box.toggle('flex')
            box.css({
                width: element.offsetWidth + 'px',
                left:element.offsetLeft + 'px',
                top:element.offsetTop + element.offsetHeight + 'px',
            })


            let userInv = element.parentElement.parentElement.getAttribute('data-uid');
            let typeNot = element.getAttribute('data-type');
            

            function handleOptionClick(option) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        traditional: true,
                        url: '/notOptions',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            type: typeNot,
                            attribute: option,
                            userInv: userInv,
                            myUser: uid,
                        }),
                        dataType: 'json',
                        success: function (response) {
                            console.log(response);
                            if (response.success == true) {

                                resolve();
                            } else {
                                reject(response.error);
                            }
                        },
                        error: function (xhr, status, error) {
                            reject(error);
                        },
                    });
                });
            }
            

            box.querySelector("#sim-option").addEventListener("click", function () {
                handleOptionClick('sim')
                    .then(() => hideMenuOnClickOutside(type=false))
                    .catch((error) => console.error(error));
            });

            box.querySelector("#nao-option").addEventListener("click", function () {
                handleOptionClick('nao').then(() => hideMenuOnClickOutside(type=false)).catch((error) => console.error(error));
            });

            box.querySelector('#fechar-option').addEventListener("click", ()=>{
                hideMenuOnClickOutside('fechar')
            });

           
        }

    }

    var buttons = document.querySelectorAll('.user-options-notifications-col-options-button');
    for(var i=0; i<buttons.length; i++) {
        buttons[i].onclick = handleClick()
        
    }
}

document.getElementById('close-popup-notification').addEventListener('click',()=>{
    userNotPopup.hide()
})
