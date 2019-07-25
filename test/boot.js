const axios = require('axios');
const Koa = require('koa');
const route = require('@koa/router');
const cors = require('koa-cors');
const wrtc = require('wrtc');
const websockify = require('koa-websocket');

const AlptP2P = require('../src/connection.js');

const app = websockify(new Koa());

let router = new route();

let socks = {};

let p2p = new AlptP2P( {
    wrtc: wrtc,
    handlers: {
        send_bootstrap(pk, data) {
            console.log('send to ', pk , " ", data.type)
            socks[pk].send(JSON.stringify({
                pk: p2p.get_hex_key().publicKey,
                data: data
            }))
        }
    }
} );

console.log(p2p.get_hex_key());

router.all('/bootstrap', async ctx => {
    ctx.websocket.on('message', (message) => {
        let m = JSON.parse(message);
        console.log('recv from', m.pk ," " , m.data.type)
        socks[m.pk] = ctx.websocket;
        p2p.recv_bootstrap(m.pk, m.data);
    });
});


app.ws
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

