//SPDX-License-Identifier:UNLICENSED

pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./interface/IXegaraNFT.sol";
import "./interface/IDividend.sol";

contract vaultFactory is OwnableUpgradeable {
    address Dividend;
    address NFT;
    address dataAccessAdmin;
    address dividendToken;
    mapping(uint => address) public DividendAddress;
    mapping(address => bool) private operators;
    event dividendCreated(uint256 _tokenId, address _Dividend);

    modifier onlyOperator() {
        require(operators[msg.sender], "NO"); //Not Operator
        _;
    }

    // constructor() {
    //     _disableInitializers();
    // }

    function initialize(
        address _Dividend,
        address _NFT,
        address _dataAccessAdmin,
        address _dividendToken
    ) external initializer {
        require(_Dividend != address(0), "DZA"); //Dividend Zero Address
        require(_NFT != address(0), "NZA"); //NFT Zero Address
        require(_dataAccessAdmin != address(0), "DAZA"); //Data access admin Zero Address
        require(_dividendToken != address(0), "DTA"); //Dividend token admin Zero Address
        __Ownable_init_unchained();
        dataAccessAdmin = _dataAccessAdmin;
        dividendToken = _dividendToken;
        Dividend = _Dividend;
        NFT = _NFT;
        operators[msg.sender] = true;
        operators[_NFT] = true;
    }

    function addOperator(address account, bool status) external onlyOperator {
        require(account != address(0), "ZA"); //Zero Address
        operators[account] = status;
    }

    function createDividend(
        uint256 _tokenId,
        address _creator,
        address _admin
    ) external onlyOperator returns (address) {
        require(DividendAddress[_tokenId] == address(0), "DAE"); //Dividend address exists for this address and token ID
        bytes32 salt = keccak256(abi.encodePacked(_tokenId));
        address _Dividend = ClonesUpgradeable.cloneDeterministic(
            Dividend,
            salt
        );

        DividendAddress[_tokenId] = _Dividend;
        IDividend(_Dividend).initialize(
            _tokenId,
            dividendToken,
            NFT,
            _creator,
            _admin,
            dataAccessAdmin
        );
        emit dividendCreated(_tokenId, _Dividend);
        return _Dividend;
    }

    function updateDividendTemplate(address _Dividend) external onlyOwner {
        require(_Dividend != address(0), "ZA"); //Zero Address
        Dividend = _Dividend;
    }

    function viewDividenAddress(
        uint256 _tokenId
    ) external view returns (address) {
        return DividendAddress[_tokenId];
    }
}
