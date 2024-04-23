//TODO-------------importes------------

const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session')
const path = require('path');
const multer = require('multer')
const cookieParser = require("cookie-parser");
const configs = require('./config/index-config')
const db = require('./Firebase/models');
const functions = require('./functions');
const authentication = require('./Firebase/authentication')
const { getAuth, fetchSignInMethodsForEmail } = require('firebase/auth')
const cloudinary = require('cloudinary')
var ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();

const https = require('http').createServer(app);
const io = require('socket.io')(https, { 'pingTimeout': 7000, 'pingInterval': 3000 });

const socketManager = require('./socket.io/index-socket');
var RateLimit = require('express-rate-limit');

//TODO------------Configs--------------




require('dotenv').config()

app.use(cors());

var limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
});

app.use(limiter);


app.use(session(configs.session));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('src'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');


const auth = getAuth();


//TODO Multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/')
    },
    filename: function (req, file, cb) {
        const nomeArquivo = file.originalname
        const codigo = require('crypto').randomBytes(42).toString('hex');
        const originalName = file.originalname;
        const extension = originalName.substr(originalName.lastIndexOf('.'));
        const fileName = codigo + extension;
        cb(null, `${fileName}`)
    }
});

const upload = multer({ storage });


//TODO Cloudinary

cloudinary.config({
    cloud_name: 'dgcnfudya',
    api_key: '634395634388475',
    api_secret: 'sGIzXYveDRCN_iSnjKepzB8mMd8'
});



//TODO SOCKET

socketManager(io)


//TODO-----------Arquivos TEST-----------------

const functionsStatus = require('./functions').status
const socketStatus = require('./socket.io/index-socket').status
const authenticStatus = require('./Firebase/authentication').status
const dbStatus = require('./Firebase/db').status
const modelsStatus = require('./Firebase/models').status
console.table({
    Functions: functionsStatus,
    Socket: socketStatus,
    Authentication: authenticStatus,
    DB: dbStatus,
    Models: modelsStatus
})



//TODO-----------POST CONFIGS-----------------

app.post('/firebaseApp', (req, res) => {
    res.send(require('./config/index-config').firebaseConfig)
})

app.post('/getRoom/:roomID', async (req, res) => {
    var responseData = {}

    let room = await db.findOne({ colecao: 'Conections', doc: req.params.roomID })
    if (room) {
        responseData.success = true
        responseData.room = room
    } else {
        responseData.success = false
        responseData.room = null
    }
    res.status(200).json(responseData);
})



//TODO-----------GET CONFIGS-----------------




//TODO-----------------GET--------------------


//TODO PAGES

app.get('/', (req, res) => {
    if (req.session.uid) {
        res.redirect('/home')
    } else {
        res.redirect('/login')
    }
})


app.get('/home', functions.isAuthenticated, async (req, res) => {
    await db.findOne({ colecao: 'users', doc: req.session.uid }, undefined, true).then(async (result) => {
        const user = await functions.userModel(result, functions.removeArrayEmpty)
        res.render('index', { user: user })
    })
})

app.get('/login', async (req, res) => {
    let mensage = ''
    if (req.query.exist == 'false') {
        mensage = 'Esse email não existe, tente cadastra-lo!'
    } else {
        mensage = 'Esse email ja existe, faça login para acessar sua conta!'
    }
    if (req.query.pass == 'invalid') {
        mensage = 'Senha incorreta!'
    }
    res.render('login', { mensage, exist: req.query.exist, pass: req.query.pass, login: req.query.login ? req.query.login : null })
})

app.get('/room/:roomid', functions.isAuthenticated, async (req, res) => {
    let room = await db.findOne({ colecao: 'Conections', doc: req.params.roomid })
    let user = await db.findOne({ colecao: "users", doc: req.session.uid })
    res.render('room', { myUser: user, room: room })
})

app.get('/conection', functions.isAuthenticated, async (req, res) => {
    await db.findOne({ colecao: 'users', doc: req.session.uid }, undefined, true).then(async (result) => {
        const user = await functions.userModel(result, functions.removeArrayEmpty)
        let rooms = await db.findAll({ colecao: 'Conections' })
        res.render('conection', { user: user, rooms: rooms, createRoom: req.query.createRoom })
    })

})

app.get('/user/:uid', functions.isAuthenticated, async (req, res) => {
    await db.findOne({ colecao: 'users', doc: req.session.uid }, undefined, true).then(async (result) => {
        let seguindo = await functions.removeArrayEmpty(result.folowInfo.seguindo)
        var isFolow = null
        let isMyProfile = result.uid == req.params.uid ? true : false
        seguindo.forEach(element => {
            if (req.params.uid == element) {
                isFolow = true
            }
        });
        const myUser = await functions.userModel(result, functions.removeArrayEmpty)
        myUser.userConta = result.uid == req.session.uid ? true : false
        myUser.isMyProfile = isMyProfile
        myUser.isFolow = isFolow == true ? true : false
        myUser.blockedUsers = result.blockedUsers
        if (isMyProfile == true) {
            userProfile = myUser
        } else {
            await db.findOne({ colecao: 'users', doc: req.params.uid }, undefined, true).then(async (result1) => {
                if (result1 == undefined || result1.blockedUsers.includes(result.uid)) {
                    res.redirect('/404/profile')
                    return
                }

                let seguidores = await functions.removeArrayEmpty(result1.folowInfo.seguidores)
                let seguindo = await functions.removeArrayEmpty(result1.folowInfo.seguindo)
                userProfile = {
                    uid: result1.uid,
                    profilePic: result1.profilePic,
                    email: result1.email,
                    displayName: result1.displayName,
                    banda: result1.banda,
                    banner: result1.banner,
                    folowInfo: {
                        seguindo,
                        seguidores
                    },
                    playlist: result1.subcollections && result1.subcollections.playlist ? result1.subcollections.playlist : [],
                    isMyProfile: isMyProfile,
                    isFolow: isFolow == true ? true : false,
                    userBockeds: result1.userBockeds,
                    friends: result1.friends ? result1.friends : []
                }
            })

        }
        res.render('perfil', { user: myUser, userProfile: userProfile })
    })
})

app.get('/auth/Google/login', (req, res) => {
    res.render('google-login')
})

app.get('/404/:type', (req, res) => {
    res.render('NotFoundPage', { type: req.params.type })
})

app.get('/playlist/:playlistId', functions.isAuthenticated, async (req, res) => {
    const user = await functions.userModel(await db.findOne({ colecao: 'users', doc: req.session.uid }, undefined, true), functions.removeArrayEmpty)
    let playlistData = await db.findColGroup('playlist', req.params.playlistId)
    if (user && playlistData) {
        res.render('playlist', { user: user, playlistData: playlistData })
    }
})



//TODO-----------------POST--------------------


app.post('/auth/reset/pass', async (req, res) => {
    let returnReset = await authentication.resetPass(req.body.email)
    res.status(200).json(returnReset)
})


app.post('/auth/Google', async (req, res) => {
    authentication.googleLogin(req, res).then(() => {
        res.redirect('/home')
    })
})

app.post('/auth/email', async (req, res) => {
    fetchSignInMethodsForEmail(auth, req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            authentication.singInEmail(req, res)
        } else {
            authentication.singUpEmail(req, res)
        }
    })
})

app.post('/auth/email/login', async (req, res) => {
    fetchSignInMethodsForEmail(auth, req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            authentication.singInEmail(req, res)
        } else {
            return res.redirect('/login?login=false&exist=false')
        }
    }).catch((err) => {
        console.log(err);
    })
})

app.post('/auth/email/cadastro', async (req, res) => {
    fetchSignInMethodsForEmail(auth, req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            return res.redirect('/login?exist=true')
        } else {
            authentication.singUpEmail(req, res)
        }
    })
})



app.post('/auth', async (req, res) => {
    let user = req.body.user
    const responseData = {};
    if (!req.session.uid) {
        let result = await functions.verifyAuthToken(user.stsTokenManager.accessToken)
        if (result) {
            req.session.uid = user.uid
            req.session.accesstoken = user.stsTokenManager.accessToken
            responseData.success = true
        } else {
            responseData.success = false
        }
    } else {
        responseData.success = true
    }
    res.status(200).json(responseData);
})


app.post("/folow/:uid", async (req, res) => {
    const responseData = {};
    await db.findOne({ colecao: 'users', doc: req.params.uid }).then(async (result1) => {
        if (result1.uid) {
            responseData.success = true
            responseData.seguidores = result1.folowInfo.seguidores.length + 1
        } else {
            responseData.success = false
            responseData.seguidores = null
        }
        let newFolowMe = result1.folowInfo.seguidores
        newFolowMe.push(req.session.uid)
        await db.update('users', req.params.uid, {
            folowInfo: {
                seguidores: newFolowMe,
                seguindo: result1.folowInfo.seguindo
            }
        })
        await db.findOne({ colecao: 'users', doc: req.session.uid }).then(async (result) => {
            let newFolow = result.folowInfo.seguindo
            newFolow.push(req.params.uid)
            await db.update('users', req.session.uid, {
                folowInfo: {
                    seguidores: result.folowInfo.seguidores,
                    seguindo: newFolow
                }
            })
        })


    })
    res.status(200).json(responseData);
})

app.post("/unfolow/:uid", async (req, res) => {
    const responseData = {};
    await db.findOne({ colecao: 'users', doc: req.params.uid }).then(async (result1) => {
        if (result1.uid) {
            responseData.success = true
            responseData.seguidores = result1.folowInfo.seguidores.length - 1
        } else {
            responseData.success = false
            responseData.seguidores = null
        }
        let newFolowMe = result1.folowInfo.seguidores
        let index = newFolowMe.indexOf(req.params.uid);
        newFolowMe.splice(index, 1);
        await db.update('users', req.params.uid, {
            folowInfo: {
                seguindo: result1.folowInfo.seguindo,
                seguidores: newFolowMe,
            }
        })
        await db.findOne({ colecao: 'users', doc: req.session.uid }).then(async (result) => {

            let newFolow = result.folowInfo.seguindo
            let index = newFolow.indexOf(req.params.uid);
            newFolow.splice(index, 1);
            await db.update('users', req.session.uid, {
                folowInfo: {
                    seguidores: result.folowInfo.seguidores,
                    seguindo: newFolow
                }
            })
        })

    })
    res.status(200).json(responseData);
})

app.post('/userBlock/:uid', async (req, res) => {
    var responseData = {}

    await db.findOne({ colecao: 'users', doc: req.session.uid }).then(async (result) => {
        let userBockeds = result.blockedUsers
        await userBockeds.push(req.params.uid)
        await db.update('users', req.session.uid, {
            blockedUsers: userBockeds
        })
    })
    responseData.success = true
    res.status(200).json(responseData);
})
app.post('/userUnBlock/:uid', async (req, res) => {
    var responseData = {}

    await db.findOne({ colecao: 'users', doc: req.session.uid }).then(async (result) => {
        let userBockeds = result.blockedUsers
        let index = userBockeds.indexOf(req.params.uid);
        await userBockeds.splice(index, 1);
        await db.update('users', req.session.uid, {
            blockedUsers: userBockeds
        })
    })
    responseData.success = true
    res.status(200).json(responseData);
})

app.post('/findOne', async (req, res) => {
    const { colecao, doc } = req.body
    var responseData = {}
    let userdata = await db.findOne({ colecao: colecao, doc: doc }).then((res) => {
        return {
            displayName: res.displayName,
            email: res.email,
            uid: res.uid,
            profilePic: res.profilePic
        }
    })
    if (userdata) {
        responseData.data = userdata
        responseData.success = true
    } else {
        responseData.data = null
        responseData.success = false
    }

    res.status(200).json(responseData);
})

app.post('/findUser', async (req, res) => {
    const { pageinPage, pageIndex, userUid } = req.body

    var responseData = {}
    await db.findOne({ colecao: "users", doc: userUid }).then(async (result) => {
        responseData.plus = result.folowInfo[pageIndex].length >= parseInt(pageinPage * 10) ? true : false
        if (result.folowInfo[pageIndex].length > 0) {
            let dataUser = await functions.removeArrayEmpty(result.folowInfo[pageIndex])
            let users = await functions.findUser(dataUser, pageinPage, 10)
            responseData.success = true
            responseData.data = users

        } else {
            responseData.success = false
        }
    })

    res.status(200).json(responseData);
})
app.post('/findArrayUsers', async (req, res) => {
    var responseData = {}
    await db.findOne({ colecao: 'Conections', doc: req.body.roomID }).then(async (res) => {
        let userData = await res.pessoas.map(async (result) => {
            let findUser = await db.findOne({ colecao: 'users', doc: result })
            if (findUser) {
                return {
                    displayName: findUser.displayName,
                    profilePic: findUser.profilePic,
                    uid: findUser.uid
                }
            } else {
                return null
            }


        })
        if (userData) {
            responseData.success = true
            responseData.data = await Promise.all(userData)
            return
        } else {
            responseData.success = false
            return 'error'
        }

    })
    res.status(200).json(responseData);
})

app.post('/editProfile/:uid', upload.single('file'), async (req, res) => {
    var responseData = {}
    await db.update('users', req.params.uid, {
        displayName: req.body.inputValue
    }).then(() => {
        return responseData.displayName = req.body.inputValue
    }).catch((err) => {
        return responseData.success = false
    })
    if (req.file) {
        let fileContent = fs.readFileSync(req.file.path)
        try {
            const stream = await cloudinary.uploader.upload_stream(async (result) => {
                if (result) {
                    await db.update('users', req.params.uid, {
                        profilePic: result.url
                    })
                    fs.unlink(req.file.path, function (err) {
                        if (err) throw err;
                    })

                } else {
                    responseData.success = false
                }
            }, {
                public_id: "sounifyme/" + req.params.uid + "-profileImg",
                transformation: {
                    width: 500,
                    height: 500,
                    crop: "fill"
                }
            });
            await stream.write(fileContent);
            await stream.end();
        } catch (err) {
            console.log(err);
            responseData.success = false
        }
    }
    responseData.success = true
    res.status(200).json(responseData);
})

app.post('/editProfileBanner/:uid', upload.single('file'), async (req, res) => {
    var responseData = {}
    if (req.body.type == "color") {
        await db.update('users', req.params.uid, {
            banner: {
                type: "color",
                content: req.body.color
            }
        })
        responseData.success = true
    } else {
        let fileContent = fs.readFileSync(req.file.path)
        const stream = await cloudinary.uploader.upload_stream(async (result) => {
            if (result) {
                await db.update('users', req.params.uid, {
                    banner: {
                        type: "image",
                        content: result.url
                    }
                })
                fs.unlink(req.file.path, function (err) {
                    if (err) throw err;
                })
            }
        }, {
            public_id: "sounifyme/" + req.params.uid + "-profileBanner",
            transformation: {
                width: 800,
                height: 500,
                crop: "fill"
            }
        });
        await stream.write(fileContent);
        await stream.end();
        responseData.success = true
    }
    res.status(200).json(responseData);
})


app.post('/createPlaylist/:uid', async (req, res) => {
    let uid = req.params.uid
    var responseData = {}
    const codigo = require('crypto').randomBytes(16).toString('hex');
    let upPlaylist = {
        playlistUser: uid,
        playlistUID: codigo,
        playlistName: "Playlist " + req.body.numberPlaylist,
        playlistMusics: [],
        playlistImg: "https://res.cloudinary.com/dgcnfudya/image/upload/v1689452893/j4tfvjlyp1ssspbefzg9.png"
    }
    db.create('users', uid, upPlaylist, {
        colecao: 'playlist',
        doc: codigo
    })

    responseData.success = true
    responseData.newPlaylist = upPlaylist
    res.status(200).json(responseData);
})



app.post('/findconnection', async (req, res) => {
    var responseData = {}
    if (req.body.roomId == 'random') {
        let AllRooms = await db.findAll({ colecao: 'Conections' })
        const randomIndex = Math.floor(Math.random() * AllRooms.length);
        const randomDocument = await AllRooms[randomIndex]
        if (randomDocument) {
            responseData.room = randomDocument
            responseData.success = true
        } else {
            responseData.room = null
            responseData.success = false
        }

    } else {
        let room = await db.findOne({ colecao: 'Conections', doc: req.body.roomId })
        if (room) {
            responseData.room = room
            responseData.success = true
        } else {
            responseData.room = null
            responseData.success = false
        }
    }
    res.status(200).json(responseData);
})

app.post('/findRoomInv', async (req, res) => {
    var responseData = {}
    let room = await db.findOne({ colecao: 'Conections', where: ['roomInvateCode', "==", parseInt(req.body.codeInv)] })
    if (room) {

        responseData.success = true
        responseData.roomID = room.roomId
    } else {
        responseData.success = false
        responseData.roomID = null
    }
    res.status(200).json(responseData);
})

app.post('/createRoom', upload.single('roomPic'), async (req, res) => {
    if (req.file) {
        let fileContent = fs.readFileSync(req.file.path)
        try {
            const stream = await cloudinary.uploader.upload_stream(async (result) => {
                if (result) {
                    await functions.createServerDB({
                        roomId: req.body.roomId,
                        roomInvateCode: req.body.roomInvateCode,
                        islocked: req.body.pass ? req.body.pass.trim().length == 0 ? false : true : false,
                        pass: req.body.pass,
                        maxpessoas: req.body.maxpessoas,
                        estilos: req.body.estilos,
                        roomName: req.body.roomName,
                        roomPic: result.url,
                        admins: [req.session.uid]
                    })

                    fs.unlink(req.file.path, function (err) {
                        if (err) throw err;
                    })
                    res.status(200).redirect('/room/' + req.body.roomIdV)

                }
            }, {
                public_id: "sounifyme/" + req.body.roomId + "-profileImg",
                transformation: {
                    width: 500,
                    height: 500,
                    crop: "fill"
                }
            });
            await stream.write(fileContent);
            await stream.end();
        } catch (err) {
            console.log(err);
        }
    } else {
        await functions.createServerDB({
            roomId: req.body.roomId,
            roomInvateCode: req.body.roomInvateCode,
            islocked: req.body.pass ? req.body.pass.trim().length == 0 ? false : true : false,
            pass: req.body.pass,
            maxpessoas: req.body.maxpessoas,
            estilos: req.body.estilos,
            roomName: req.body.roomName,
            roomPic: 'https://res.cloudinary.com/dgcnfudya/image/upload/v1699892735/fi3qe2pdlwwv24zpauu5.png',
            admins: [req.session.uid]
        })
        res.status(200).redirect('/room/' + req.body.roomIdV)
    }

})


app.post('/getcodesroom', async (req, res) => {
    async function numberGenerateID() {
        const roomId = require('crypto').randomBytes(11).toString('hex');
        return await db.findOne({ colecao: 'Conections', where: ['roomId', "==", roomId] }).then((err, resultado) => {
            if (err || resultado) {
                console.error("Erro ao verificar código no banco de dados:", err);
                numberGenerateID();
            } else {
                return roomId
            }
        });
    }
    async function numberGenerateINV() {
        const roomInvateCode = Math.random().toString().slice(2, 8);
        return await db.findOne({ colecao: 'Conections', where: ['roomInvateCode', "==", roomInvateCode] }).then((err, resultado) => {
            if (err || resultado) {
                console.error("Erro ao verificar código no banco de dados:", err);
                numberGenerateINV();
            } else {
                return roomInvateCode
            }

        })
    }
    const roomId = await numberGenerateID()
    const roomInvateCode = await numberGenerateINV()
    res.status(200).json({ success: true, roomId: roomId, roomInvateCode: roomInvateCode })
})


app.post('/createNot', async (req, res) => {

    const userinvitador = req.body.userinvitador ? req.body.userinvitador : req.session.uid
    const { type, userinvitado, date } = req.body

    switch (type) {
        case 'inv-friend':

            let myData = await db.findOne({ colecao: 'users', doc: userinvitador })
            let userinvData = await db.findOne({ colecao: 'users', doc: userinvitado })
            if (myData.uid && userinvData.uid) {
                const isInvited = await myData.invsPendente.some(objeto => Object.keys(objeto).some(chave => objeto[chave] === userinvitado))

                if (isInvited == true) {

                    res.status(200).json({
                        success: false,
                        data: null
                    });
                } else {
                    let invs = myData.invsPendente ? myData.invsPendente : []
                    let invs2 = userinvData.invsPendente ? userinvData.invsPendente : []
                    let model = {
                        type: type,
                        userinvitado: userinvitado,
                        userinvitador: {
                            displayName: myData.displayName,
                            profilePic: myData.profilePic,
                            uid: myData.uid
                        },
                        date: date
                    }

                    await invs.push(model)
                    await invs2.push(model)

                    db.update('users', userinvitador, {
                        invsPendente: invs
                    })

                    db.update('users', userinvitado, {
                        myNots: invs2
                    })



                    res.status(200).json({
                        success: true,
                        data: model
                    });

                }
            } else {
                res.status(200).json({
                    success: false,
                    data: null
                });
            }




            break;

        default:
            break;
    }

})


app.post('/reqMyNots/:uid', async (req, res) => {
    let { myNots } = await db.findOne({ colecao: 'users', doc: req.params.uid })
    res.status(200).json({
        success: true,
        data: myNots ? myNots : null
    });
})

app.post('/notOptions', async (req, res) => {
    var responseData = {}
    const { type, attribute, userInv, myUser } = req.body
    let userinvitado = await db.findOne({ colecao: 'users', doc: userInv })
    let userInvitador = await db.findOne({ colecao: 'users', doc: myUser })
    switch (type) {
        case 'inv-friend':
            if (attribute == 'sim') {
                let friends = userinvitado.friends ? userinvitado.friends : []
                let friends2 = userInvitador.friends ? userInvitador.friends : []
                let invsPendente = userinvitado.invsPendente
                invsPendente = await invsPendente.filter(objeto => objeto.userinvitador.uid !== userinvitado.uid);
                let myNots = await userInvitador.myNots
                myNots = await myNots.filter(objeto => objeto.userinvitador.uid !== userinvitado.uid);
                if (friends2.includes(userinvitado.uid) == false) {
                    await friends2.push(userinvitado.uid)
                }
                if (friends.includes(userInvitador.uid) == false) {
                    await friends.push(userInvitador.uid)
                }
                db.update('users', userinvitado.uid, {
                    friends: friends,
                    invsPendente: invsPendente
                })
                db.update('users', userInvitador.uid, {
                    friends: friends2,
                    myNots: myNots
                })
            } else {
                let invsPendente2 = userinvitado.invsPendente
                invsPendente2 = await invsPendente2.filter(objeto => objeto.userinvitador.uid !== userinvitado.uid);
                let myNots2 = await userInvitador.myNots
                myNots2 = await myNots2.filter(objeto => objeto.userinvitador.uid !== userinvitado.uid);
                db.update('users', userinvitado.uid, {
                    invsPendente: invsPendente2
                })
                db.update('users', userInvitador.uid, {
                    myNots: myNots2
                })
            }
            break;

        default:
            break;
    }


    res.status(200).json({
        success: true
    });
})


app.post('/desfFriend', async (req, res) => {

    let user1 = await db.findOne({ colecao: 'users', doc: req.session.uid })
    let user1Friends = user1.friends
    const index = await user1Friends.indexOf(req.body.profileUser);
    if (index !== -1) {
        await user1Friends.splice(index, 1);
    }
    db.update('users', user1.uid, {
        friends: user1Friends,
    })
    let user2 = await db.findOne({ colecao: 'users', doc: req.body.profileUser })
    let user2Friends = user2.friends
    const index2 = await user2Friends.indexOf(req.session.uid);
    if (index2 !== -1) {
        await user2Friends.splice(index, 1);
    }
    db.update('users', user2.uid, {
        friends: user2Friends,
    })

    res.status(200).json({
        success: true,
    });
})


app.post('/getRoom/:id?', async (req, res) => {
    if (req.params.id) {
        let room = await db.findOne({ colecao: 'Conections', doc: req.params.id })
        res.status(200).json({
            success: true,
            data: room
        })
    } else {
        let rooms = await db.findAll({ colecao: 'Conections' })
        res.status(200).json({
            success: true,
            data: rooms
        })
    }

})

app.post('/verifyRoom', async (req, res) => {
    let roomName = await db.findOne({ colecao: 'Conections', where: ['roomName', '==', req.body.roomName] })
    if (!Object.keys(roomName).length == 0) {
        res.status(200).json({
            success: false,
            data: 'O nome da sala ja esta em uso!'
        })
    } else {
        res.status(200).json({
            success: true,
            data: null
        })
    }
})



//TODO AUTH LOGIN

app.get('/logout', (req, res) => {
    if (req.session.uid) {
        const sessionID = req.session.id;
        req.sessionStore.destroy(sessionID, (err) => {
            if (err) {
                return console.error(err)
            }
        })
    }
    res.render('logout', { redirect: req.query.redirect ? req.query.redirect : '' })
})



app.get('/test', (req, res) => {
    res.render('test')
})


app.post('/stateUser/:user/:state', (req, res) => {
    console.log(req.params);
    res.sendStatus(200)
})




app.use((req, res, next) => {
    res.status(404).render('NotFoundPage.ejs', { type: null })
});

//TODO SERVER
https.listen(configs.port, () => {
    console.log(`Servidor rodando na porta ${configs.port}`);
});