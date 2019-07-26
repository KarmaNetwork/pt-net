const Websocket = require('ws');
const wrtc = require('wrtc');

const AlptP2P = require('../src/connection.js');

const ws = new Websocket('ws://45.76.223.13:3000/bootstrap');

ws.on('open', () => {
    let p2p = new AlptP2P( {
        wrtc: wrtc,
        handlers: {
            send_bootstrap(pk, data) {
                console.log(data.type)
                ws.send(JSON.stringify({
                    pk: p2p.get_hex_key().publicKey,
                    data: data,
                }))
            }
        }
    } );

    ws.on('message', (data) => {
        let d = JSON.parse(data);
        console.log(d.data.type);
        p2p.recv_bootstrap(d.pk, d.data);
    });

    let pk = '08f1f9ecb0a9cf94bc58e6902fc80b8e5dcd2c8a0173ae46ac17d1f78d55e757'

    p2p.bootstrap({
        pk: pk,
    }).then(() => {
        p2p.send(pk, 'hello')
    });


});



