try {
    const db = require('./db.js')
    const { Readable } = require('stream');

    module.exports = {
        findAll: async (props, subProps)=> {
            let firebaseData = db.collection(props.colecao)
            if (subProps != undefined) {
                firebaseData = firebaseData.doc(props.doc).collection(subProps.colecao)
            }
            
            return new Promise((resolve, reject) => {
                const outputStream = new Readable({ objectMode: true });
                outputStream._read = () => {};
            
                firebaseData.get().then((snapshot) => {
                    snapshot.forEach((doc) => {
                    const data = doc.data();
                    outputStream.push(data);
                    });
            
                    outputStream.push(null); // Indica o fim da stream
                    resolve(outputStream.toArray());
                }).catch((error) => {
                    console.error('Erro ao buscar dados do Firestore:', error);
                    reject(error);
                });
            
                outputStream.on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
            });
        },
    
        findOne: async (props,subProps,returnSubs)=>{
            let firebaseData = db.collection(props.colecao)
            if (props.hasOwnProperty('doc')) {
                firebaseData = firebaseData.doc(props.doc)
            }
            if (props.hasOwnProperty('where')) {
                firebaseData = firebaseData.where(props.where[0],props.where[1],props.where[2])
            }
            if (subProps != undefined) {
                firebaseData = firebaseData.collection(subProps.colecao).doc(subProps.doc)
            }
            
           
            return await firebaseData.get().then(async(res)=>{
                let data = await res.data()
                if (returnSubs == true) {
                    let subcollectionRef = await firebaseData.listCollections()

                    if (subcollectionRef.length > 0) {
                        data.subcollections = {};
                        // Iterar sobre as subcoleções
                        for (const subcollection of subcollectionRef) {
                            const subcollectionDocs = await subcollection.get();
                            const subcollectionName = subcollection.id;
                            const subcollectionData = [];
                            subcollectionDocs.forEach(doc => {
                                subcollectionData.push(doc.data());
                            });
                            data.subcollections[subcollectionName] = subcollectionData;
                        }
                    }
                }
                return data
                
            }).catch((error) => {
                console.error('Erro ao buscar dados do Firestore:', error);
            });
            
        },
        findColGroup: async(colecao,doc)=>{
            return new Promise((resolve, reject) => {
                try {
                    const dadosRecebidos = [];

                    const queryStream = db.collectionGroup(colecao).stream();

                    queryStream.on('data', async (docSnapshot) => {
                        if (docSnapshot.id == doc) {
                            dadosRecebidos.push(docSnapshot.data());
                        }
                    });
        
                    queryStream.on('error', (error) => {
                        console.error("Erro ao buscar documentos:", error);
                        reject(error);
                    });
        
                    queryStream.on('end', () => {
                        resolve(dadosRecebidos[0]);
                    });
                } catch (error) {
                    console.error("Erro ao buscar documentos:", error);
                    reject(error);
                }
            });
        },
        update: async(colecao, doc, data,subProps)=>{
            let firebaseData = db.collection(colecao).doc(doc)
            if (subProps != undefined) {
                firebaseData = firebaseData.collection(subProps.colecao).doc(subProps.doc)
            }
            await firebaseData.update(data);
            return 
        },
        delete: async(colecao, doc,subProps)=>{
            let firebaseData = db.collection(colecao).doc(doc)
            if (subProps != undefined) {
                firebaseData = firebaseData.collection(subProps.colecao).doc(subProps.doc)
            }
            await firebaseData.delete();
            return
        },
        create: async (colecao,doc,data,subProps)=> {
            let firebaseData = db.collection(colecao).doc(doc)
            if (subProps != undefined) {
                firebaseData = firebaseData.collection(subProps.colecao).doc(subProps.doc)
            }
            await firebaseData.set(data);
            return
        }    
    }
    module.exports.status = 'OK' 
} catch (error) {
    module.exports.status = 'ERROR'
}