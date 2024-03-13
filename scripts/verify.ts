const hre = require("hardhat");
import {
  expandTo18Decimals,
  expandTo6Decimals,
} from "../test/utilities/utilities";

async function main() {
  console.log("after");

  // await hre.run("verify:verify", {
  //   address: "0x46bfB299e1784dfB4F2AF8171639Fb663E32287C",
  //   constructorArguments: [],
  //   contract: "contracts/mock/mockXARToken.sol:XARtoken",
  // });

  // await hre.run("verify:verify", {
  //   address: "0x7609D1fB6ab5B8CbcAD1CdC84AFE6036142648f5",
  //   constructorArguments: [],
  //   contract: "contracts/mock/USDT.sol:Usdt",
  // });

  // await hre.run("verify:verify", {
  //   address: "0x13B8ED17EaB9402B0f715DbeCDAA72386Ee69b52",
  //   constructorArguments: [],
  //   contract: "contracts/TestContract.sol:test",
  // });

  await hre.run("verify:verify", {
    address: "0xAb0448972B34De374A3cd53275cbBb83aFFC11E7",
    constructorArguments: [],
    contract: "contracts/XegaraNFT.sol:XegaraNFT",
  });

  await hre.run("verify:verify", {
    address: "0x2678d0777cD236dA602844080D98Ec48B2DcfCbC",
    constructorArguments: [],
    contract: "contracts/factory.sol:vaultFactory",
  });

  await hre.run("verify:verify", {
    address: "0x0adB614159C2a525F78Cde38edD59e9fB5368cD9",
    constructorArguments: [],
    contract: "contracts/dividend.sol:Dividend",
  });

  await hre.run("verify:verify", {
    address: "0x9fb3A6348C15007F0fAa233f464812E71795D995",//NFT proxy
    constructorArguments: [],
    contract: "contracts/upgradeability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  });

  await hre.run("verify:verify", {
    address: "0x7cb3BeEeBE22460c28BA102Cb00b0f7b8Da7f55c", //factory proxy
    constructorArguments: [],
    contract:
      "contracts/upgradeability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//QA
// Marketplace: 0x80397C25559Ae481CFAFd64eec155C2BAbd8cDf9
// NFT: 0x4E51c46eD01D0f2fC98920138775AF165B730007
// proxy marketplace: 0xD288dD6874C6C4CfA1b85562d99B5556E7f99fEb
// proxy nft: 0x808D96633d0525a78D908A9CfCda55bC1231C5D4
