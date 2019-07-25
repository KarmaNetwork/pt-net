# Alpaca P2P Prototype

## Feature

- Node discovery.
- Connection by public key.
- NAT Traversal.

## Technical Stack

- WebRTC
- STUN and TURN (ICE Framework)
- Cryptography

## Prototype Protocol

### bootstrap

- Find bootstrap server $B$.
- Use $B$ as ICE Server to bootstrap.
- Send http request to $B$ to inital connection.
- Bootstrap Kademlia

### discovery

- Select some connectable nodes $Ns$
- Send WebRTC message to $Ns$.
- Recv `CInfos` from $Ns$.
- Try to connect them.



