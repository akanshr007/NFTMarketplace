/* eslint-disable prettier/prettier */
import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-web3";
import "solidity-coverage";
require("hardhat-contract-sizer");

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings :{
      optimizer :{
        enabled: true,
        runs: 200,
        details:{
          yul:true
        }
      },
      viaIR:false,
    },
  },
  mocha: {
    timeout: 60 * 1000, // 60 seconds
    reporter: "nyan", // try "nyan" for the NYAN cat
    },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsctestnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [`0xa4cf9f6d432010daa2d049b0028aea8d8d9b917a9ca38a969d18351d0929823f`],
      // gasPrice: 500000000
    },
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/BWMh4yxGGzCwVntdaYk835zNhbFc-tUX',
      accounts: [`0xa4cf9f6d432010daa2d049b0028aea8d8d9b917a9ca38a969d18351d0929823f`],
      // gasPrice: 500000000
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/384158242f384bcbb27cbb663fbca37e",
      accounts: [`0x${process.env.PVTKEY}`],
    }
  },
  etherscan: {
    apiKey: 'K2KYW58RBCGMX3RP134XXP82TN4VP5WSV5',
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
    only:["XegaraNFT","Dividend","vaultFactory"],
  },
  gasReporter: {
    //enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice:100,
  },
};

export default config;