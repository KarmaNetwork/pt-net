const Peer = require('simple-peer');
const nacl = require('tweetnacl');
const store = require('store');
const Buffer = require('buffer').Buffer;

class AlptP2P {
    constructor ( opts ) {
        // inital key
        this.boxkeys = store.get('boxkeys');
        if (this.boxkeys == undefined) {
            this.boxkeys = nacl.box.keyPair();
            store.set('boxkeys', this.boxkeys);
        }

        // Connections
        this.peers = {};
        if (opts.wrtc == undefined) {
            this.env = 'browser';
        } else {
            this.env = 'wrtc';
            this.wrtc = opts.wrtc;
        }
        // handler to send http server
        this.handlers = opts.handlers;
    }

    get_hex_key () {
        let obj = {};
        obj.publicKey = Buffer.from(this.boxkeys.publicKey).toString('hex');
        obj.secretKey = Buffer.from(this.boxkeys.secretKey).toString('hex');
        return obj;
    }

    async _boot_server(server, func) {
        let ice = server.ice;
        let pk = server.pk;

        let opts = { initiator:true };
        if (this.env == 'wrtc') {
            opts.wrtc = this.wrtc;
        }
        let peer = new Peer( opts );

        // receive offer connection info.
        peer.on('signal', async data => {
            this.handlers.send_bootstrap(pk ,data);
        });

        peer.on('connect', () => {
            this.peers[pk].connected = true;
            console.log(pk, 'is connected')
            func();
        });

        peer.on('close', () => {
            // delete?
            console.log(pk, 'is closed')
            if (this.peers[pk]) {
                this.peers[pk].connected = false;
                this.peers[pk].peer.destroy();
                delete this.peers[pk];
            }
        })

        peer.on('error', (err) => {
            // delete?
            console.log(pk, 'is error')
            delete this.peers[pk];
            if (this.peers[pk]) {
                this.peers[pk].connected = false;
                this.peers[pk].peer.destroy();
                delete this.peers[pk];
            }
        });

        peer.on('data', data => {
            // Need add crypto
            this.handlers.recv_data(pk,data);
        });

        this.peers[pk] = {
            peer: peer,
            connected: false,
            publicKey: Buffer.from(pk,'hex')
        };
    }

    async recv_bootstrap (pk, data) {
        if (this.peers[pk] == undefined) {
            let opts = {};
            if (this.env == 'wrtc') {
                opts.wrtc = this.wrtc;
            }

            let peer = new Peer( opts );
            this.peers[pk] = {
                peer: peer,
                connected: false,
                publicKey: Buffer.from(pk, 'hex')
            }

            peer.on('connect', () => {
                this.peers[pk].connected = true;
                console.log(pk, 'is connected')
            });

            peer.on('close', () => {
                // delete?
                console.log(pk, 'is closed')
                if (this.peers[pk]) {
                    this.peers[pk].connected = false;
                    this.peers[pk].peer.destroy();
                    delete this.peers[pk];
                }
            })

            peer.on('signal', data => {
                this.handlers.send_bootstrap(pk, data);
            })

            peer.on('data', data => {
                // Need add crypto
                this.handlers.recv_data(pk,data);
            });

            peer.on('error', (err) => {
                // delete?
                console.log(pk, 'is error')
                if (this.peers[pk]) {
                    this.peers[pk].connected = false;
                    this.peers[pk].peer.destroy();
                    delete this.peers[pk];
                }
            });
        };

        let peer = this.peers[pk];

        peer.peer.signal(data);
    }

    bootstrap (servers) {
        let promise = new Promise((resolve,reject) => {
            this._boot_server(servers, () => {
                resolve();
            });
        });
        return promise;
    }

    send(pk, data) {
        if (this.peers[pk]) {
            this.peers[pk].peer.send(data);
            return true;
        } else {
            return false;
        }
    }
}

module.exports = AlptP2P

