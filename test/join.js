const Websocket = require('ws');
const wrtc = require('wrtc');

const AlptP2P = require('../src/connection.js');

const ws = new Websocket('ws://localhost:3000/bootstrap');

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

    let pk = 'd74af42f278607ca9552443f3fe1425746facc1b9b92ed93f385571a9a33b46a'

    p2p.bootstrap({
        pk: pk,
    }).then(() => {
        p2p.send(pk, 'hello')
    });


});



