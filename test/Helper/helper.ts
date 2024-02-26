import { ethers } from "ethers";

const SIGNING_DOMAIN_NAME = "XEGARA_NFT";
const SIGNING_DOMAIN_VERSION = "1";

class orderhash {
  public contract: any;
  public signer: any;
  public domain: any;

  constructor(data: any) {
    const { _contract, _signer } = data;
    this.contract = _contract;
    this.signer = _signer;
  }

  async createNFTDataVoucher(
    tokenId: any,
    fractionsQuantity: any,
    uri: any,
    owner: any
  ) {
    const Voucher = { tokenId, fractionsQuantity, uri, owner };

    const types = {
      NFTDetails: [
        { name: "tokenId", type: "uint256" },
        { name: "fractionsQuantity", type: "uint256" },
        { name: "uri", type: "string" },
        { name: "owner", type: "address" },
      ],
    };

    const domain = await this._signingDomain();

    const signature = await this.signer._signTypedData(domain, types, Voucher);
    // console.log({ signature })
    return {
      ...Voucher,
      signature,
    };
  }

  async createNFTListingVoucher(
    pricePerShare: any,
    tokenId: any,
    counter: any,
    nftAmount: any,
    owner: any
  ) {
    const Voucher = { pricePerShare, tokenId, counter, nftAmount, owner };

    const types = {
      NFTListing: [
        { name: "pricePerShare", type: "uint256" },
        { name: "tokenId", type: "uint256" },
        { name: "counter", type: "uint256" },
        { name: "nftAmount", type: "uint256" },
        { name: "owner", type: "address" },
      ],
    };

    const domain = await this._signingDomain();

    const signature = await this.signer._signTypedData(domain, types, Voucher);
    // console.log({ signature })
    return {
      ...Voucher,
      signature,
    };
  }

  async createBuyDataVoucher(
    conversionRate: any,
    amountToBuy: any,
    counter: any,
    timeStamp: any,
    currency: any
  ) {
    const Voucher = {
      conversionRate,
      amountToBuy,
      counter,
      timeStamp,
      currency,
    };

    const types = {
      buyDetails: [
        { name: "conversionRate", type: "uint256" },
        { name: "amountToBuy", type: "uint256" },
        { name: "counter", type: "uint256" },
        { name: "timeStamp", type: "uint256" },
        { name: "currency", type: "address" },
      ],
    };

    const domain = await this._signingDomain();

    const signature = await this.signer._signTypedData(domain, types, Voucher);
    // console.log({ signature })
    return {
      ...Voucher,
      signature,
    };
  }

  async _signingDomain() {
    if (this.domain != null) {
      return this.domain;
    }
    const chainId = 31337;
    // const chainId = 31337;
    this.domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this.domain;
  }
}

export default orderhash;
