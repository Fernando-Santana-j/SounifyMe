const admin = require('firebase-admin');
const models = require('./Firebase/models');
const ytdl = require('ytdl-core');
const axios = require('axios');
const authentication = require('./Firebase/authentication');
const config = require('./config/index-config');
const db = require('./Firebase/db');
try {
    module.exports = {
        isAuthenticated: async (req, res, next)=> {
            const idToken = req.session.accesstoken;
            if (!idToken) {
                res.redirect(`/logout?redirect=${req.originalUrl}`)
                
            } else {
                await admin.auth().verifyIdToken(idToken).then(function(decodedToken) {
                    if (!req.session.uid) {
                        req.session.uid = decodedToken.uid
                        req.session.accesstoken = idToken
                    }
                    next();
                }).catch(function(error) {
                    console.error('Erro ao verificar o token de autenticação:', error);
                    res.redirect('/logout');
                });
            }
        },
        verifyAuthToken: async (idToken)=>{
            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const uid = decodedToken.uid;
                // O token de autenticação é válido e pertence ao usuário com UID uid
                return uid
            } catch (error) {
                // O token de autenticação é inválido ou expirado
                console.error(error);
                return null;
            }
        },
        removeArrayEmpty: (array)=>{
            if (Array.isArray(array)) {
                var arrayFilter = array.filter(function(elemento) {
                    return elemento !== '' && elemento !== null && elemento !== undefined;
                });
                
                var index = array.indexOf('');
                if (index > -1) {
                  array.splice(index, 1);
                }
                return arrayFilter
            }else{
                return []
            }

        },
        numberFormater: (array)=>{
            // -----
    
            // inacabado!!!!!!!!!!!
            
            // -----
            function formatarNumero(number) {
                let numero = parseInt(number)
                var resultado = numero.toString();
    
                switch (true) {
                    case numero >= 1000000000:
                        var bilhao = Math.floor(numero / 1000000000);
                        resultado = bilhao + " bi";
                    break;
    
                    case numero >= 1000000:
                        var milhao = Math.floor(numero / 1000000);
                        resultado = milhao + " mi";
                    break;
    
                    case numero >= 1000:
                        var mil = Math.floor(numero / 1000);
                        resultado = mil + " mil";
                    break;
    
                    default:
                        resultado = resultado;
                    break;
                }
    
                return resultado;
            }
            if (number) {
                formatarNumero(number)
            }
            if (array) {
                var arrayFormatado = [];
    
                for (var i = 0; i < array.length; i++) {
                    var numeroFormatado = formatarNumero(array[i]);
                    arrayFormatado.push(numeroFormatado);
                }
            
                return arrayFormatado;
            }
        },
        stringLimit: (str,maxLength)=>{
            if (str.length <= maxLength) {
                return str; // Retorna a string original se já estiver dentro do tamanho desejado
            } else {
                // Procura o último espaço antes do tamanho desejado
                var ultimoEspaco = str.lastIndexOf(' ', maxLength);
                if (ultimoEspaco !== -1) {
                // Se encontrou um espaço antes do tamanho desejado, retorna a substring até esse ponto
                    return str.substring(0, ultimoEspaco);
                } else {
                // Se não encontrou um espaço antes do tamanho desejado, retorna a substring até o tamanho
                    return str.substring(0, maxLength);
                }
            }
        },
        findUser: async (array,pagina, porPagina)=>{
            if (array.length <= 0) {
                return null
            }
            let findIni = parseInt((pagina * porPagina) - porPagina)
            let findEnd = parseInt(findIni + porPagina)
    
            let arrayModify = array.length <= porPagina ? array : array.slice(findIni, findEnd)
            let userData = await arrayModify.map(async(result)=>{
                let findUser = await models.findOne({colecao:'users',doc:result})
                if (findUser) {
                    return {
                        displayName: findUser.displayName,
                        profilePic: findUser.profilePic,
                        uid: findUser.uid
                    }  
                }else{
                    return null
                }
                
                
            })
            return await Promise.all(userData)
            
        },
        userModel: async (result,removeArrayEmpty)=>{
            let seguindo = removeArrayEmpty(result.folowInfo.seguindo)
            let seguidores = removeArrayEmpty(result.folowInfo.seguidores)
            return {
                uid: result.uid,
                profilePic: result.profilePic,
                email: result.email,
                displayName: result.displayName,
                banda: result.banda,
                banner:result.banner,
                folowInfo: {
                    seguindo,
                    seguidores
                },
                playlist: result.subcollections && result.subcollections.playlist ? result.subcollections.playlist : [],
                playlistString: JSON.stringify(result.subcollections && result.subcollections.playlist ? result.subcollections.playlist : []),
                joinroom:result.joinroom,
                myNots: result.myNots ? result.myNots : null,
                invsPendente:result.invsPendente ? result.invsPendente : null,
                friends:result.friends ? result.friends : []
            }
        },
        frequenceData: async (dadosRecebidos)=>{
            if (dadosRecebidos.length === 0) {
                console.error('Ainda não há dados recebidos.');
                return null;
            }
        
            // Crie um objeto para armazenar a contagem dos dados
            const contador = {};
        
            // Percorra o array de dados recebidos e conte a frequência de cada dado
            dadosRecebidos.forEach(dado => {
                contador[dado] = (contador[dado] || 0) + 1;
            });
        
            // Encontre o dado com a maior frequência
            let dadoMaisFrequente = dadosRecebidos[0];
            let frequenciaMaisAlta = contador[dadosRecebidos[0]];
        
            for (const dado in contador) {
                if (contador[dado] > frequenciaMaisAlta) {
                frequenciaMaisAlta = contador[dado];
                dadoMaisFrequente = dado;
                }
            }
        
            console.log('Dado mais frequente:', dadoMaisFrequente);
            console.log('Frequência:', frequenciaMaisAlta);
            return dadoMaisFrequente
        },
        percentualNumber: async (initialValue,finalValue,thresholdPercentage)=>{
            const thresholdValue = (initialValue * thresholdPercentage) / 100;
            
            if (finalValue >= thresholdValue) {
                return true
            }else{
                return false
            } 
        },
        getPlaylistMusic: async (link,queueIndex,io,roomID)=>{
            const accessToken = (await require('./Firebase/authentication').authenticateSpotify());
            const match = link.match(/playlist\/([a-zA-Z0-9]+)$/i);
            let playlistId = await match && match[1] ? match[1] : null
    
            if (!playlistId) {
                console.error('ID da playlist não encontrado.');
                return;
            }
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }).then((res)=>{
                return res.json()
            }).catch(err=>{
                console.error(err);
                return
                
            });
            const tracks = response.items;
    
            let playlistMusicData = []
    
            await tracks.forEach(async(track,index) => {
                
                const API_KEY = config.googleYoutubeToken
    
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(track.track.name)}&type=video`;
    
                let linkMusic = await axios.get(searchUrl).then(async response => {
                    const videoId = response.data.items[0].id.videoId;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    // Example of filtering the formats to audio only.
                    const info = await ytdl.getInfo(videoUrl).then((res)=>{
                        return res
                    }).catch(err=>{
                        console.error(err);
                        return
                    });
                    
                    const link = ytdl.chooseFormat(info.formats, { filter: 'audioonly' }).url
                    return link
                }).catch(error => {
                    console.error('Erro ao buscar vídeos:', error);
                });
                playlistMusicData.push({
                    musica: track.track.name,
                    banda: track.track.artists[0].name,
                    thumbnail: track.track.album.images[0].url,
                    link: linkMusic,
                    index: queueIndex + index,
                })
            });
            return playlistMusicData
        },
        searchTrackLink:async (songName)=> {
            const accessToken = (await require('./Firebase/authentication').authenticateSpotify());
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }).then((res)=>{
                return res
            }).catch(err=>{
                console.error(err);
                return "erro"
                
            });
          
            const data = await response.json();
            if (data.tracks && data.tracks.items.length > 0) {
                try{
                    const track = data.tracks.items[0];
                    const response2 = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(track.external_urls.spotify)}`).then((res)=>{
                        return res
                    }).catch(err=>{
                        console.error(err);
                        return "erro"
                    });
                    
                    const data2 = await response2.json();
                    const info = await ytdl.getInfo(data2.linksByPlatform.youtube.url).then((res)=>{
                        return res
                    }).catch(err=>{
                        console.error(err);
                        return "erro"
                    });
                    
                    const link = ytdl.chooseFormat(info.formats, { filter: 'audioonly' }).url
                    const trackInfo = {
                        thumbnail: track.album.images[0].url,
                        musica: track.name,
                        banda: track.artists[0].name,
                        link: link,
                    };
                    return trackInfo;
                }catch{
                    return "erro"
                }
                
            } else {
              console.error('Nenhuma música encontrada.');
              return "erro"
            }
        },
        getPlaylistYoutube:async(playlistUrl)=>{
    
            let videoLinks = [];
            const match = playlistUrl.match(/[?&]list=([^&]+)/);
            let playlistID = match ? match[1] : null;
            // URL da API do YouTube Data com o token de próxima página
            const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistID}&key=${config.googleYoutubeToken}`;
    
            // Faça uma solicitação GET para a API do YouTube Data
            const response = await axios.get(apiUrl);
    
            // Extraia os links de cada vídeo na playlist
            videoLinks = videoLinks.concat(response.data.items.map(item => {
                const videoId = item.contentDetails.videoId;
                return `https://www.youtube.com/watch?v=${videoId}`;
            }));
            return videoLinks
        },
        getLinkYtData:async (linkVideo)=>{
            function removerTextosIndesejados(texto) {
                const padroes = [
                  /\(Vídeo Oficial\)/g,
                  /\(Official Lyric Video\)/g,
                  /\(Legendado\)/g,
                  /\(Official Music Video\)/g,
                  /\(tradução\)/g,
                  /\(legendado\)/g
                ];
              
                padroes.forEach(p => {
                  texto = texto.replace(p, '');
                });
              
                return texto;
            }
            const matchLink = await linkVideo.match(/[?&]v=([^&]+)/);
            let playlistID = await matchLink ? matchLink[1] : null;
            const info = await ytdl.getInfo(playlistID)
            if (!info && !info.formats) {
                return {error: 'Não foi possivel obter as informações do video'}
            }
            const link = ytdl.chooseFormat(info.formats, { filter: 'audioonly' }).url
            const thumbnailURL = info.videoDetails.thumbnails[0].url;
            const tituloDoVideo = info.videoDetails.title;
            const match = info.videoDetails.title.match(/^(.*?)\s*-\s*(.*)$/);
            var banda = null
            var musica = null
    
        
            if (match) {
                banda = match[1].trim()
                musica = await removerTextosIndesejados(match[2].trim())
            } else {
                musica =await removerTextosIndesejados(tituloDoVideo);
                banda = info.videoDetails.author.name
            }
            return {
                link:link,
                thumbnail:thumbnailURL,
                banda:banda,
                musica:musica
            }
        },
        createServerDB: async(data)=>{
            await models.create('Conections',data.roomId,{
                estilos:data.estilos,
                islocked: data.islocked,
                maxpessoas:data.maxpessoas ,
                mensages:[],
                musicOptions:{
                    loop:false,
                },
                musicaAtual:{},
                musics:[],
                pass: data.islocked == true ? data.pass : null,
                pessoas:[],
                positionQueue:0,
                queue:[],
                roomId:data.roomId,
                roomInvateCode:data.roomInvateCode,
                roomName: data.roomName,
                roomPic: data.roomPic ? data.roomPic : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1689452893/j4tfvjlyp1ssspbefzg9.png',
                admins: data.admins
            }).then(()=>{
                return true
            }).catch((err)=>{
                return err
            })
            return 
        },
        calcularDiferencaTempo: async(dataFornecida)=>{
            const dataFornecidaObj = new Date(dataFornecida);
          
            if (isNaN(dataFornecidaObj)) {
              return "Data inválida.";
            }
          
            const dataAtual = new Date();
            const diferencaEmMilissegundos = dataAtual - dataFornecidaObj;
          
            const segundos = Math.floor(diferencaEmMilissegundos / 1000);
            const minutos = Math.floor(segundos / 60);
            const horas = Math.floor(minutos / 60);
            const dias = Math.floor(horas / 24);
          
            if (dias > 0) {
              return `${dias} dia${dias > 1 ? 's' : ''}`;
            } else if (horas > 0) {
              return `${horas} hora${horas > 1 ? 's' : ''}`;
            } else if (minutos > 0) {
              return `${minutos} min${minutos > 1 ? 's' : ''}`;
            } else {
              return `${segundos} sec${segundos > 1 ? 's' : ''}`;
            }
        }
        
    }
    module.exports.removeArrayEmpty = module.exports.removeArrayEmpty.bind(module.exports);
    module.exports.numberFormater = module.exports.numberFormater.bind(module.exports);
    module.exports.status = 'OK'
} catch (error) {
    module.exports.status = 'ERROR'
}


