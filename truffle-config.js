const path = require("path");
var HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC = 'eight torch gather december jump hood cart spin net carbon ten doll';
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "5777"
    },
    ropsten: {
      //provider: () => new HDWalletProvider(MNEMONIC,"https://ropsten.infura.io/e09362e8cde24eb591d6d07d791eb3b7"),
      provider: () => new HDWalletProvider(MNEMONIC, "wss://ropsten.infura.io/ws/v3/e09362e8cde24eb591d6d07d791eb3b7", 0),
      network_id: "3",
      gas: 4700000,
      gasPrice: 100000000000,
    }

  },
  compilers: {
    solc: {
      version: "0.5.3",
      docker: false
    }
  }

};
