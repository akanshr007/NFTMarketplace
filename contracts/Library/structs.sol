// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;

library structs {
    struct NFTDetails {
        uint256 tokenId;
        uint256 fractionsQuantity;
        string uri;
        address owner;
        bytes signature;
    }

    struct NFTListing {
        uint256 pricePerShare;
        uint256 tokenId;
        uint256 counter;
        uint256 nftAmount;
        address owner;
        bytes signature;
    }

    struct buyDetails {
        uint256 conversionRate;
        uint256 amountToBuy;
        uint256 counter;
        uint256 timeStamp;
        address currency;
        bytes signature; 
    }
}
