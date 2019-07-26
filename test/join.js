const Websocket = require('ws');
const wrtc = require('wrtc');

const AlptP2P = require('../src/connection.js');

const ws = new Websocket('ws://127.0.0.1:3000/bootstrap');

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

    let pk = 'b2ff8520baf601c1161880ed2d754ad774f731fb5b745e78bbbb47d336122a69'

    p2p.bootstrap({
        pk: pk,
    }).then(() => {
        p2p.send(pk, 'hello')
    });


});



