document.getElementById('create-room-image-preview-content').addEventListener('click',()=>{
    document.getElementById('create-room-image-input').click()
})


document.getElementById('create-room-image-input').addEventListener('change', function() {
    let input = this
    if (input.files && input.files[0]) {
        const arquivo = input.files[0];
        const tipoDeArquivo = arquivo.type;

        // Verifica se o arquivo é uma imagem
        if (tipoDeArquivo && tipoDeArquivo.startsWith('image/')) {
            const leitorDeArquivo = new FileReader();

            leitorDeArquivo.onload = function(e) {
                document.getElementById('create-room-image-preview').src = e.target.result;
            };

            leitorDeArquivo.readAsDataURL(arquivo);
            successNotify('Imagem adicionada!')
        } else {
            errorNotify('O arquivo precisa ser uma imagem!')
        }
    }
});


document.getElementById('create-room-inv-code-h1').addEventListener('click', function() {
    const texto = document.getElementById('create-room-inv-code-span').innerText

    navigator.clipboard.writeText(texto).then(() => {
        successNotify('Codigo da Sala copiado!')
    }).catch(err => {
        errorNotify('Erro ao copiar o codigo!')
    });
});


document.getElementById("create-room-content").addEventListener("submit", async function(event) {
    event.preventDefault(); 
    $.ajax({
        traditional: true,
        url: '/verifyRoom',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            roomName: document.getElementById('create-room-name-input').value,
        } ), 
        success:async function(response) {
            console.log(response);
            if (response.success == true) {
                document.getElementById("create-room-content").submit()
            }else if (response.success == false) {
                errorNotify(response.data)
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
    
    
});
document.getElementById('create-room-name-input').addEventListener('change',()=>{
    history.pushState({}, '', `/conection${location.search}&name=${document.getElementById('create-room-inputs-basic').value}`);
})
document.getElementById('create-room-pass-input').addEventListener('change',()=>{
    history.pushState({}, '', `/conection${location.search}&pass=${document.getElementById('create-room-pass-input').value}`);
})
document.getElementById('create-room-style-music-input').addEventListener('change',()=>{
    history.pushState({}, '', `/conection${location.search}&style=${document.getElementById('create-room-style-music-input').value}`);
})
document.getElementById('create-room-max-pessoas-input').addEventListener('change',()=>{
    history.pushState({}, '', `/conection${location.search}&max=${document.getElementById('create-room-max-pessoas-input').value}`);
})


document.getElementById('create-room-top-cancel').addEventListener('click',(event)=>{
    document.getElementById('create-room-containner').hide()
    history.pushState({}, '', '/conection?create=false');
})