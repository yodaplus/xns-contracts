require('@nomiclabs/hardhat-truffle5')
require('@nomiclabs/hardhat-waffle')
require('hardhat-abi-exporter')
require('@nomiclabs/hardhat-solhint')
require('hardhat-gas-reporter')
require('hardhat-deploy')
require('hardhat-deploy-ethers')
// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// TLD to use in deployment
const TLD = 'xdc';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

real_accounts = undefined
if (process.env.DEPLOYER_KEY && process.env.OWNER_KEY) {
  real_accounts = [process.env.DEPLOYER_KEY, process.env.OWNER_KEY]
}

const { MNEMONIC } = process.env;
const DEFAULT_MNEMONIC =
  "juice whisper void palm tackle film float able plunge invest focus flee";

const sharedNetworkConfig = {
  accounts: {
    mnemonic: MNEMONIC ?? DEFAULT_MNEMONIC,
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  tld: TLD,
  networks: {
    hardhat: {
      // Required for real DNS record tests
      initialDate: '2019-03-15T14:06:45.000+13:00',
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      saveDeployments: true,
      tags: ['test', 'legacy', 'use_root'],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 3,
      accounts: real_accounts,
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.xinfin.yodaplus.net`,
    },
    apothem: {
      ...sharedNetworkConfig,
      url: "https://rpc-apothem.xinfin.yodaplus.net",
      gasPrice: 10000000000,
      accounts: real_accounts,
      tags: ['test', 'legacy', 'use_root'],


    },
  },
  mocha: {},
  mocha: {},
  abiExporter: {
    path: './build/contracts',
    clear: true,
    flat: true,
    spacing: 2,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './build/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: ['Controllable$', 'INameWrapper$', 'SHA1$', 'Ownable$', 'NameResolver$', 'TestBytesUtils$'],
    spacing: 2,
    pretty: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
  },
}
