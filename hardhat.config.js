require('dotenv').config()
require('@nomicfoundation/hardhat-toolbox')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',

  networks: {
    hardhat: {
      forking: {
        url: 'https://goerli.infura.io/v3/<YOUR_API_KEY>',
      },
    },
    // fork a netwok with hardhat in case of using the below config
    // forked: {
    //   url: 'http://127.0.0.1:8545/',
    //   accounts: [process.env.EOA_FIRST, process.env.EOA_SECOND],
    // },
  },
}
