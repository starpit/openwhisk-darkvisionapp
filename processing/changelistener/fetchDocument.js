const main = ({cloudantUrl, cloudantDbName, documentId}) => {
    const mediaStorage = require('./lib/cloudantstorage')({
        cloudantUrl,
        cloudantDbName
    })

    return new Promise((resolve, reject) => mediaStorage.get(documentId, (err, doc) => {
        if (err) {
            console.log('[', documentId, '] KO', err);
            reject(err);
        } else {
            resolve(doc)
        }
    }))
}

