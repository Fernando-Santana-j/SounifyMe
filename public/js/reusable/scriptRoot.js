reloadActivate()
function reloadActivate() {
    document.getElementById('reload-containner').show('flex')
}
function reloadStop() {
    document.getElementById('reload-containner').hide()
}
document.body.onload = ()=>{
    setTimeout(()=>{     
        document.getElementById('containner').show()
        reloadStop()
    }, 1000);
}



