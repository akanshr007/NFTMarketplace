// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./interface/IFactory.sol";
import "./interface/IDividend.sol";
import "./Library/structs.sol";

/**
 * @title XegaraNFT
 * @dev Contract for managing ERC1155 fractional NFTs with buy functionality.
 * @notice This contract allows users to create, buy, and transfer ERC1155 fractional NFTs.
 */
contract XegaraNFT is
    ERC1155URIStorageUpgradeable,
    OwnableUpgradeable,
    EIP712Upgradeable,
    ReentrancyGuardUpgradeable
{
    address public admin;
    address private conversionRateOperator;
    uint256 public platformFee;
    IFactory public factory;
    mapping(uint256 => uint256) supply;
    mapping(uint256 => address[]) NFTHolders;
    // Mapping for used Listing vouchers
    mapping(uint256 => bool) public usedListingCounters;
    mapping(uint256 => bool) public usedBuyDataCounters;
    // Mapping of the counter to the amount left in voucher
    mapping(uint256 => uint256) public amountLeft;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not Admin");
        _;
    }

    // constructor() {
    //     _disableInitializers();
    // }

    /**
     * @dev Initializes the contract.
     * @param _uri The base URI for the token metadata.
     * @param _factory The address of the factory contract.
     * @param _platformfee is the fee percentage for platform.
     * @param _conversionRateOperator The address of the conversion rate operator contract.
     */
    function initialize(
        string memory _uri,
        address _admin,
        address _factory,
        uint256 _platformfee,
        address _conversionRateOperator
    ) external initializer {
        require(_admin!=address(0),"AZA"); // Admin address cannot be zero
        require(_factory != address(0), "FZA"); //Factory address cannot be zero
        require(_conversionRateOperator != address(0), "CZA"); // Conversion Rate Operator address cannot be zero
        require(_platformfee > 0, "ZF"); // Zero Fee
        __ERC1155_init_unchained(_uri);
        __ERC1155URIStorage_init_unchained();
        __EIP712_init_unchained("XEGARA_NFT", "1");
        __Ownable_init_unchained();
        __ReentrancyGuard_init_unchained();
        conversionRateOperator = _conversionRateOperator;
        factory = IFactory(_factory);
        platformFee = _platformfee;
        admin = _admin;
    }

    /**
     * @dev Verifies the signed data for NFT details.
     * @param _nftData The NFT details data structure.
     * @return The address of the signer.
     */
    function verifyNFTDetails(
        structs.NFTDetails memory _nftData
    ) public view returns (address) {
        bytes32 signed_data = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "NFTDetails(uint256 tokenId,uint256 fractionsQuantity,string uri,address owner)"
                    ),
                    _nftData.tokenId,
                    _nftData.fractionsQuantity,
                    keccak256(bytes(_nftData.uri)),
                    _nftData.owner
                )
            )
        );

        return ECDSAUpgradeable.recover(signed_data, _nftData.signature);
    }

    /**
     * @dev Verifies the signed data for Buy details.
     * @param _buyData The buy details data structure.
     * @return The address of the signer.
     */
    function verifyBuyDetails(
        structs.buyDetails memory _buyData
    ) public view returns (address) {
        bytes32 signed_data = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "buyDetails(uint256 conversionRate,uint256 amountToBuy,uint256 counter,uint256 timeStamp,address currency)"
                    ),
                    _buyData.conversionRate,
                    _buyData.amountToBuy,
                    _buyData.counter,
                    _buyData.timeStamp,
                    _buyData.currency
                )
            )
        );

        return ECDSAUpgradeable.recover(signed_data, _buyData.signature);
    }

    /**
     * @dev Verifies the signed data for NFT listing.
     * @param _nftListing The NFT listing data structure.
     * @return The address of the signer.
     */
    function verifyNFTListing(
        structs.NFTListing memory _nftListing
    ) public view returns (address) {
        bytes32 signed_data = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "NFTListing(uint256 pricePerShare,uint256 tokenId,uint256 counter,uint256 nftAmount,address owner)"
                    ),
                    _nftListing.pricePerShare,
                    _nftListing.tokenId,
                    _nftListing.counter,
                    _nftListing.nftAmount,
                    _nftListing.owner
                )
            )
        );

        return ECDSAUpgradeable.recover(signed_data, _nftListing.signature);
    }

    /**
     * @dev Creates a new ERC1155 token.
     * @param _nftData The NFT details data structure.
     * @notice This function allows the contract owner to create a new ERC1155 token with the specified details.
     */
    function createToken(structs.NFTDetails memory _nftData) external {
        require(supply[_nftData.tokenId] == 0, "TAM"); // Token already minted
        require(verifyNFTDetails(_nftData) == admin, "IS"); // Invalid Signer
        if (
            IFactory(factory).viewDividenAddress(_nftData.tokenId) == address(0)
        ) {
            IFactory(factory).createDividend(
                _nftData.tokenId,
                _nftData.owner,
                admin
            );
        }
        _mint(_nftData.owner, _nftData.tokenId, _nftData.fractionsQuantity, "");
        _setURI(_nftData.tokenId, _nftData.uri);
    }

    /**
     * @dev Buys ERC1155 tokens.
     * @param _nftListing The NFT listing data structure.
     * @param _buyData The buy details data structure.
     * @notice This function allows users to buy ERC1155 tokens from the NFT listing at the given price.
     */
    function buyToken(
        structs.NFTListing memory _nftListing,
        structs.buyDetails memory _buyData
    ) external payable nonReentrant {
        require(_buyData.timeStamp + 2 minutes >= block.timestamp, "Time Out");
        require(_buyData.currency != address(0), "EZA"); // ERC20 Token address can't be zero address
        require(_nftListing.owner != address(0), "NOCZA"); // NFT owner can't be zero address
        require(
            _buyData.amountToBuy <=
                balanceOf(_nftListing.owner, _nftListing.tokenId),
            "IBA"
        ); // Invalid buy Amount
        require(_buyData.amountToBuy > 0, "AMZ"); // Amount to buy Zero
        require(!usedBuyDataCounters[_buyData.counter], "BVU"); // Buy Voucher Used
        setCounter(_nftListing, _buyData.amountToBuy);
        require(verifyNFTListing(_nftListing) == _nftListing.owner, "IS"); // Invalid Signer
        require(verifyBuyDetails(_buyData) == conversionRateOperator, "ICOS"); //Invalid conversion rate operator

        uint256 finalPrice = _buyData.conversionRate * _buyData.amountToBuy;
        uint256 fee = (finalPrice * platformFee) / 10000;
        if (_buyData.currency == address(1)) {
            require(msg.value >= finalPrice, "IA"); // Insufficient Amount
            (bool success, ) = msg.sender.call{value: finalPrice - fee}("");
            require(success == true, "ATF"); // Amount Transfer Failed
            (bool feeSuccess, ) = admin.call{value: fee}("");
            require(feeSuccess == true, "FTF"); // Fee Transfer Failed
        } else {
            require(
                IERC20Upgradeable(_buyData.currency).balanceOf(msg.sender) >=
                    finalPrice,
                "IA"
            ); // Insufficient Amount
            IERC20Upgradeable(_buyData.currency).transferFrom(
                msg.sender,
                _nftListing.owner,
                finalPrice - fee
            );
            IERC20Upgradeable(_buyData.currency).transferFrom(
                msg.sender,
                admin,
                fee
            );
        }
        if (factory.viewDividenAddress(_nftListing.tokenId) != address(0)) {
            address dividend = factory.viewDividenAddress(_nftListing.tokenId);
            IDividend(dividend).trackShares(
                _buyData.amountToBuy,
                _nftListing.owner,
                msg.sender
            );
        }

        usedBuyDataCounters[_buyData.counter] = true;

        _safeTransferFrom(
            _nftListing.owner,
            msg.sender,
            _nftListing.tokenId,
            _buyData.amountToBuy,
            ""
        );
    }

    /**
     * @dev Sets the voucher counter for NFT listings.
     * @param _nftListing The NFT listing data structure.
     * @param amountToBuy The amount of NFTs to be bought.
     * @notice This function sets the voucher counter for NFT listings to control the available tokens for sale.
     */
    function setCounter(
        structs.NFTListing memory _nftListing,
        uint256 amountToBuy
    ) internal {
        //Counter used
        require(!usedListingCounters[_nftListing.counter], "CU");

        uint256 leftCounter = amountLeft[_nftListing.counter];

        if (leftCounter == 0) {
            leftCounter = _nftListing.nftAmount - amountToBuy;
        } else {
            leftCounter = leftCounter - amountToBuy;
        }
        require(leftCounter >= 0, "ALZ"); //Amount left less than zero

        amountLeft[_nftListing.counter] = leftCounter;
        if (leftCounter == 0) usedListingCounters[_nftListing.counter] = true;
    }

    /**
     * @dev Resets the voucher counter for NFT listings.
     * @param _nftListing The NFT listing data structure.
     * @notice This function resets the voucher counter for NFT listings, allowing more tokens to be bought.
     */
    function resetVoucherCounter(
        structs.NFTListing memory _nftListing
    ) external {
        require(_nftListing.owner == msg.sender, "IC"); // Invalid caller
        amountLeft[_nftListing.counter] = 0;
        usedListingCounters[_nftListing.counter] = true;
    }

    /**
     * @notice Mints ERC1155 tokens.
     * @param to The address to mint tokens to.
     * @param id The token ID to mint.
     * @param amount The amount of tokens to mint.
     * @param data Additional data to pass to the recipient.
     */
    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal override(ERC1155Upgradeable) {
        supply[id] += amount;
        super._mint(to, id, amount, data);
    }

    /**
     * @dev Mints a batch of ERC1155 tokens.
     * @param to The address to mint tokens to.
     * @param ids The token IDs to mint.
     * @param amounts The amounts of tokens to mint.
     * @param data Additional data to pass to the recipient.
     * @notice This function allows the contract owner to mint a batch of ERC1155 tokens to a specific address.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyAdmin {
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Burns ERC1155 tokens.
     * @param from The address to burn tokens from.
     * @param id The token ID to burn.
     * @param amount The amount of tokens to burn.
     * @notice This function allows the contract owner to burn ERC1155 tokens.
     */
    function safeBurn(
        address from,
        uint256 id,
        uint256 amount
    ) public onlyAdmin {
        _burn(from, id, amount);
    }

    /**
     * @dev Transfers ERC1155 tokens.
     * @param from The address to transfer tokens from.
     * @param to The address to transfer tokens to.
     * @param id The token ID to transfer.
     * @param amount The amount of tokens to transfer.
     * @param data Additional data to pass to the recipient.
     * @notice This function allows the contract owner to transfer ERC1155 tokens.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override(ERC1155Upgradeable) {
        require(msg.sender == admin, "NA"); // Transfer not allowed
        super.safeTransferFrom(from, to, id, amount, data);
    }

    /**
     * @dev Returns the total supply of a token.
     * @param tokenID The ID of the token.
     * @return The total supply of the token.
     * @notice This function allows anyone to check the total supply of a specific ERC1155 token.
     */
    function tokenSupply(uint tokenID) external view returns (uint256) {
        require(supply[tokenID] > 0, "TDNE"); // Token does not exist
        return supply[tokenID];
    }

    /**
     * @dev Updates the address of the factory contract.
     * @param _factory The address of the factory contract.
     * @notice This function allows the contract owner to update the address of the factory contract.
     */
    function updateFactory(address _factory) external onlyAdmin {
        require(_factory != address(0), "ZA"); // Zero address
        factory = IFactory(_factory);
    }

    /**
     * @dev Updates the platformFee of the platform .
     * @param _newFee is The updated value of the platformFee.
     * @notice This function allows the contract admin to update the value of the fplatfromFee.
     */
    function updatePlatformFee(uint256 _newFee) external onlyAdmin {
        require(_newFee > 0, "ZF"); // Zero Fee
        platformFee = _newFee;
    }
}
