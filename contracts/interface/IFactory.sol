//SPDX-License-Identifier:MIT

pragma solidity >=0.8.17;

interface IFactory {


    function createDividend(
       uint256 _tokenId,
        address _creator,
        address _admin
    ) external;

    function updateDividendTemplate(address _Dividend) external;

    function viewDividenAddress(uint256 _tokenId) external view returns (address);
}
