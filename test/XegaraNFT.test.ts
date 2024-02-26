import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Dividend,
  Dividend__factory,
  VaultFactory,
  VaultFactory__factory,
  XARtoken,
  XARtoken__factory,
  XegaraNFT,
  XegaraNFT__factory,
} from "../typechain-types";
import { mockXarTokenSol } from "../contracts/mock/mockXarTokenSol";
// import { Usdc } from "../typechain-types/contracts/mock/mockXARToken.sol";
import orderhash from "./Helper/helper";
import { expandTo18Decimals } from "./utilities/utilities";
describe("Xegara NFT", () => {
  let XegaraNFT: XegaraNFT;
  let factory: VaultFactory;
  let dividend: Dividend;
  let XAR: XARtoken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let oneAddress = "0x0000000000000000000000000000000000000001";

  beforeEach("Xegara NFT deployment", async () => {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();
    XegaraNFT = await new XegaraNFT__factory(owner).deploy();
    factory = await new VaultFactory__factory(owner).deploy();
    dividend = await new Dividend__factory(owner).deploy();
    XAR = await new XARtoken__factory(owner).deploy();
    // await dividend.connect(user1).initialize(2,XAR.address,XegaraNFT.address,user1.address);

    await factory
      .connect(owner)
      .initialize(
        dividend.address,
        XegaraNFT.address,
        owner.address,
        XAR.address
      );
  });

  describe("Check Initializer", async () => {
    it("Full flow test case", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        200,
        user4.address
      );

      const NFTcreate = await new orderhash({
        _contract: XegaraNFT,
        _signer: owner,
      });
      const createNFTVoucher = await NFTcreate.createNFTDataVoucher(
        1,
        10,
        "TestURI",
        user1.address
      );
      console.log("test1");
      await XegaraNFT.connect(user1).createToken(createNFTVoucher);
      let dividendAddress = await factory.viewDividenAddress(1);
      console.log("dividend", dividendAddress);
      console.log(await XegaraNFT.tokenSupply(1));
      console.log("test2");
      expect(await XegaraNFT.balanceOf(user1.address, 1)).to.be.eq(10);
      console.log("test3", await XegaraNFT.balanceOf(user1.address, 1));
      await XAR.connect(owner).mint(user1.address, expandTo18Decimals(1000000));
      await XAR.connect(owner).mint(user2.address, expandTo18Decimals(100));
      console.log("test4");
      await XAR.connect(user2).approve(
        XegaraNFT.address,
        expandTo18Decimals(16)
      );
      // await dividend
      //   .connect(user1)
      //   .initialize(1, XAR.address, XegaraNFT.address, user1.address);

      console.log("test5");
      // await vault_instance.initialize(1,XAR.address,XegaraNFT.address,user1.address);
      let vault_instance = await ethers.getContractFactory("Dividend");
      let Xdiv = await vault_instance.attach(dividendAddress);
      await XAR.connect(user1).approve(
        dividendAddress,
        expandTo18Decimals(1000)
      );

      // await dividend.connect(user1).initialize(1,XAR.address,XegaraNFT.address,user1.address);
      await Xdiv.connect(user1).deposit_dividend(expandTo18Decimals(1000));
      // await XAR.connect(user1).transferFrom(user1.address,dividendAddress,expandTo18Decimals(1000));
      const NFTList = await new orderhash({
        _contract: XegaraNFT,
        _signer: user1,
      });
      const NFTListVoucher = await NFTList.createNFTListingVoucher(
        4, //USD  1 USD = 2 XAR/ 3ETH
        1,
        1,
        10,
        user1.address
      );

      const BuyData = await new orderhash({
        _contract: XegaraNFT,
        _signer: user4,
      });
      const BuyDataVoucher = await BuyData.createBuyDataVoucher(
        expandTo18Decimals(8),
        2,
        1,
        1790286591,
        XAR.address
      );
      const BuyDataVoucher2 = await BuyData.createBuyDataVoucher(
        expandTo18Decimals(12),
        2,
        2,
        1790286591,
        oneAddress
      );
      console.log("test6");
      console.log("admin balance", await XAR.balanceOf(owner.address));
      await XegaraNFT.connect(user2).buyToken(NFTListVoucher, BuyDataVoucher);
      console.log("admin balance", await XAR.balanceOf(owner.address));
      console.log(await Xdiv.calculate_dividend());
      // console.log("Dividend", await Xdiv.connect(user1).DividendAmount(user2.address));
      await XegaraNFT.connect(user3).buyToken(NFTListVoucher, BuyDataVoucher2, {
        value: expandTo18Decimals(24),
      });
      console.log(await Xdiv.calculate_dividend());
      console.log(
        "Dividend",
        await Xdiv.connect(owner.address).DividendAmount(user3.address)
      );

      // console.log(await XegaraNFT.tokenSupply(1));
      // console.log("test7");
      // expect(await XAR.balanceOf(user2.address)).to.be.eq(
      //   expandTo18Decimals(84)
      // );
      // // expect(await XAR.balanceOf(user3.address)).to.be.eq(
      // //   expandTo18Decimals(2)
      // // );

      // expect(await XegaraNFT.balanceOf(user2.address, 1)).to.be.eq(2);
      // expect(await XegaraNFT.balanceOf(user3.address, 1)).to.be.eq(2);

      // console.log("test8");

      // await vault_instance.calculate_dividend();
      // console.log("test9");
      // await vault_instance.connect(user2).claim_dividend();
      // console.log("test10");
      // console.log(await XAR.balanceOf(user2.address));
    });
    it("should not initialize twice", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );

      await expect(
        XegaraNFT.connect(owner).initialize(
          "TEST_URI",
          owner.address,
          factory.address,
          100,
          user4.address
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
    it("should revert if admin address is zero address", async () => {
      await expect(
        XegaraNFT.connect(owner).initialize(
          "TEST_URI",
          zeroAddress,
          factory.address,
          100,
          user4.address
        )
      ).to.be.revertedWith("AZA");
    });

    it("should revert if factory address is zero address", async () => {
      await expect(
        XegaraNFT.connect(owner).initialize(
          "TEST_URI",
          owner.address,
          zeroAddress,
          100,
          user4.address
        )
      ).to.be.revertedWith("FZA");
    });

    it("should revert if Conversion rate operator address is zero address", async () => {
      await expect(
        XegaraNFT.connect(owner).initialize(
          "TEST_URI",
          owner.address,
          factory.address,
          100,
          zeroAddress
        )
      ).to.be.revertedWith("CZA");
    });
  });

  describe("Safe Mint", () => {
    beforeEach("Minting to user1 adress", async () => {
      XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
    });

    //   it("should allow safe minting", async () => {
    //     await XegaraNFT.connect(owner).safeMint(0, 1, owner.address, "0x");
    //     expect(await XegaraNFT.balanceOf(owner.address, 0)).to.be.equal(1);
    //   });

    //   it("should not allow safe minting for unauthorized user", async () => {
    //     await expect(
    //       XegaraNFT.connect(user1).safeMint(0, 1, owner.address, "0x")
    //     ).to.be.revertedWith("CNA");
    //   });
  });

  describe("Safe Batch Minting", () => {
    beforeEach("Minting to user1 adress", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
    });
    it("should allow safe minting", async () => {
      await XegaraNFT.connect(owner).mintBatch(
        owner.address,
        [0, 1, 2],
        [10, 10, 20],
        "0x"
      );
      expect(await XegaraNFT.balanceOf(owner.address, 2)).to.be.equal(20);
    });
  });

  describe("Safe Burn", () => {
    beforeEach("Minting to user1 adress", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
      await XegaraNFT.connect(owner).mintBatch(
        user1.address,
        [0, 1, 2],
        [10, 10, 20],
        "0x"
      );
    });

    it("should allow safe burn", async () => {
      await XegaraNFT.connect(owner).safeBurn(user1.address, 0, 1);
      expect(await XegaraNFT.balanceOf(user1.address, 0)).to.equal(9);
    });

    it("should not allow safe burn from other than admin", async () => {
      await expect(
        XegaraNFT.connect(user1).safeBurn(user1.address, 0, 1)
      ).to.be.revertedWith("Not Admin");
    });
  });

  describe("Safe Transferfrom", () => {
    beforeEach("Minting to user1 adress", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
      await XegaraNFT.connect(owner).mintBatch(
        user1.address,
        [0, 1, 2],
        [10, 10, 20],
        "0x"
      );
    });

    it("should allow safe tranfer from authorized accounts", async () => {
      await XegaraNFT.connect(user1).setApprovalForAll(owner.address, true);
      await XegaraNFT.connect(owner).safeTransferFrom(
        user1.address,
        user2.address,
        0,
        1,
        "0x"
      );
      expect(await XegaraNFT.balanceOf(user2.address, 0)).to.equal(1);
    });

    it("should not allow safe tranfer from unauthorized accounts", async () => {
      await XegaraNFT.connect(user1).setApprovalForAll(user3.address, true);
      await expect(
        XegaraNFT.connect(user3).safeTransferFrom(
          user1.address,
          user2.address,
          0,
          1,
          "0x"
        )
      ).to.be.revertedWith("NA");
    });
  });

  describe("Token Supply", () => {
    beforeEach("Minting to user1 adress", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
    });
    // it("should return correct token supply", async () => {
    //   await XegaraNFT.connect(owner).safeMint(0, 10, owner.address, "0x");
    //   expect(await XegaraNFT.tokenSupply(0)).to.be.equal(10);
    // });

    it("should revert if token supply is zero", async () => {
      await expect(XegaraNFT.tokenSupply(0)).to.be.revertedWith("TDNE");
    });
  });

  describe("Buy Token", async () => {
    beforeEach("Contract Intialization", async () => {
      await XegaraNFT.connect(owner).initialize(
        "TEST_URI",
        owner.address,
        factory.address,
        100,
        user4.address
      );
    });

    // it("should revert if token address is zero address ", async () => {

    //   await expect(
    //     XegaraNFT.connect(owner)buyToken()
    //   ).to.be.revertedWith("EZA");
    // });
    // it("should revert if owner address is zero address ", async () => {
    //   await expect(
    //     factory.connect(owner).buyToken(voucher, 10, ERC20Token)
    //   ).to.be.revertedWith("NOCZA");
    // });
    // it("should revert if quantity to buy is zero ", async () => {
    //   await expect(
    // factory.connect(owner).buyToken(voucher, 10, ERC20Token)
    //   ).to.be.revertedWith("QZ");
    // });
  });
});
