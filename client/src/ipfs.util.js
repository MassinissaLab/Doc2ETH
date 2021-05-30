import IPFS from 'ipfs-http-client'
//const ipfsClient = require('ipfs-http-client')

//const createClient = require('ipfs-http-client')
//const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

//connect to local ipfs
const ipfs = new IPFS({ host: '127.0.0.1', port: 5001, protocol: 'http' });
export { ipfs };