//SPDX-License-Identifier:MIT

pragma solidity >=0.8.17;

interface IDividend {
    function initialize(
        uint tokenId,
        address _dividendToken,
        address _NFT,
        address _creator,
        address _admin,
        address _dataAccessAdmin
    ) external;

    function deposit_dividend(uint amount) external;

    function claim_dividend() external;

    function trackShares(
        uint amount,
        address from,
        address to
    ) external;
}
