import { ethers } from "hardhat";
import {
  expandTo15Decimals,
  expandTo16Decimals,
  expandTo18Decimals,
  expandTo6Decimals,
} from "./utilities";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  let NFTProxy = "0x9fb3A6348C15007F0fAa233f464812E71795D995";
  let dividendAddress = "0x0adB614159C2a525F78Cde38edD59e9fB5368cD9";
  let factoryProxy = "0x7cb3BeEeBE22460c28BA102Cb00b0f7b8Da7f55c";
  let XNFT = await ethers.getContractFactory("XegaraNFT");
  let nft = await XNFT.attach(NFTProxy);
  let XFac = await ethers.getContractFactory("vaultFactory");
  let fact = await XFac.attach(factoryProxy);
  let Xdiv = await ethers.getContractFactory("Dividend");
  let DIV = Xdiv.attach(dividendAddress);

  // await nft.initialize(
  //   "test_uri",
  //   "0x3E379370c0b6ABf789F260995BbC617305B71F79",
  //   factoryProxy,
  //   200,
  //   "0x3E379370c0b6ABf789F260995BbC617305B71F79"
  // );

  await fact.initialize(dividendAddress,NFTProxy,"0x3E379370c0b6ABf789F260995BbC617305B71F79","0xEDd4393147D29555a7a39cc12267BFA4bC3027Ba");
  await sleep(5000);
  console.log("Passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
