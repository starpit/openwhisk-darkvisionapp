const { if:If, sequence:Sequence, retain:Retain, literal:Literal } = require('@ibm-functions/composer')

function project({cloudantUrl, cloudantDbName, id, changes}) {
    return { cloudantUrl,
             cloudantDbName,
             documentId: id,
             documentRev: changes[0].rev
           }
}

const onDocumentChange = Sequence(
    Retain('changelistener/fetchDocument'),

    ({params:{cloudantUrl, cloudantDbName, documentRev}, result:doc}) => ({cloudantUrl, cloudantDbName, documentRev, doc}),

    If( /* cond */ ({documentRev, doc}) => doc._rev !== documentRev,
        /* then */ Literal({ ok: true, has_changed: true }),
        /* else */ If(doc => doc.type === 'video' && require('./lib/cloudantstorage')().hasAttachment(doc, 'video.mp4') && !doc.metadata,
                      'l2fprod/darkvision-extractor-master',
                      If(doc => doc.type === 'audio' && require('./lib/cloudantstorage')().hasAttachment(doc, 'audio.ogg') && !doc.transcript,
                         'speechtotext/speechtotext',
                         If(doc => doc.type === 'audio' && doc.transcript && !doc.analysis,
                            'textanalysis/textanalysis',
                            If(doc => doc.type === 'image' && require('./lib/cloudantstorage')().hasAttachment(doc, 'audio.ogg') && !doc.analysis,
                               'analysis/analysis',
                               Literal({ ok: true, ignored: true })))))))

module.exports = If(
    /* cond */ event => event.deleted,
    /* then */ Literal({ok: true}),
    /* else */ Sequence(project, onDocumentChange))
