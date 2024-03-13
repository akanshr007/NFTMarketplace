import { SignerWithAddress } from "../node_modules/@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import {
  expandTo18Decimals,
  expandTo6Decimals,
} from "../test/utilities/utilities";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  // We get the contract to deploy
  const xar = await ethers.getContractFactory("XARtoken");
  const XAR = await xar.deploy();
  await sleep(4000);
  console.log("XAR", XAR.address);


//   const XNFT = await ethers.getContractFactory("XegaraNFT");
//   const NFT = await XNFT.deploy();
//   await sleep(4000);
//   console.log("Xegara NFT", NFT.address);

//   const DividendFactory = await ethers.getContractFactory("vaultFactory");
//   const factory = await DividendFactory.deploy();
//   await sleep(4000);
//   console.log("Xegara factory", factory.address);

//   const DividendContract = await ethers.getContractFactory("Dividend");
//   const dividend = await DividendContract.deploy();
//   await sleep(4000);
//   console.log("Xegara dividend", dividend.address);


//   const upgradeability = await ethers.getContractFactory(
//     "OwnedUpgradeabilityProxy"
//   );
//   const proxy1 = await upgradeability.deploy();
//   await sleep(4000);
//   const proxy2 = await upgradeability.deploy();
//   await sleep(4000);
// //   const proxy3 = await upgradeability.deploy();
// //   await sleep(4000);
//   console.log("Proxy1 deployed", proxy1.address);
//   console.log("Proxy2 deployed", proxy2.address);
// //   console.log("Proxy3 deployed", proxy3.address);

//   await proxy1.upgradeTo(NFT.address);
//   await sleep(3000);
//   console.log("______________________");
//   await sleep(3000);
//   await proxy2.upgradeTo(factory.address);
//   await sleep(3000);
// //   await proxy3.upgradeTo(dividend.address);
// //   await sleep(3000);
//   console.log("upgradeTo done");

//   await sleep(5000);
//   let Proxy1 = await XNFT.attach(proxy1.address);
//   console.log(Proxy1.address, "NFTProxy");
//   await sleep(5000);
//   let Proxy2 = await DividendFactory.attach(proxy2.address);
//   console.log(Proxy2.address, "FactoryProxy");
//   await sleep(5000);
//   let Proxy3 = await DividendContract.attach(proxy3.address);
//   console.log(Proxy3.address, "DividendProxy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
