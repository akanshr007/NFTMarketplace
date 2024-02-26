//SPDX-License-Identifier:MIT
pragma solidity >=0.8.17;
import "./interface/IXegaraNFT.sol";
import "./interface/IDividend.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Dividend is OwnableUpgradeable, IDividend {
    address creator;
    address public admin;
    address dataAccessAdmin;
    uint tokenId;
    address[] shareHolders; // array to keep track of shareholders
    address NFT; //address of xegara NFT
    IERC20Upgradeable public dividendToken; //instance of ERC20 token
    uint start; //pointer to keep track of the starting point of the array
    uint xar_balance; //variable to keep track of XAR NFT deposited at the start of the year
    uint256 totalSupply; //variable to keep track of total supply
    mapping(address => uint) claimAmount; //mapping to keep track of claim amount of all the shareholders
    mapping(address => uint) shares; //mapping to keep track of the shares of each address
    mapping(address => bool) exists; // mapping to keep track of whether an address has any shares or not

    /**
     * @notice  .
     * @dev     .
     * @param   _tokenId  .
     * @param   _dividendToken  .
     * @param   _NFT  .
     * @param   _creator  .
     * @param   _admin  .
     * @param   _dataAccessAdmin  .
     */
    function initialize(
        uint _tokenId,
        address _dividendToken,
        address _NFT,
        address _creator,
        address _admin,
        address _dataAccessAdmin
    ) external initializer {
        creator = _creator;
        admin = _admin;
        dataAccessAdmin = _dataAccessAdmin;
        NFT = _NFT;
        tokenId = _tokenId;
        dividendToken = IERC20Upgradeable(_dividendToken);
        __Ownable_init_unchained();
    }

    /**
     * @dev Deposits dividend amount into the contract
     * @param amount The amount of dividend to be deposited
     */

    function deposit_dividend(uint amount) public {
        require(msg.sender == creator || msg.sender == admin, "NA"); // Not Authorized
        xar_balance = amount;
        dividendToken.transferFrom(creator, address(this), amount);
    }

    /**
     * @dev Calculates and accumulates dividend amount for shareholders
     */
    function calculate_dividend() public {
        totalSupply = IXegaraNFT(NFT).tokenSupply(tokenId);

        // Calculate the amount of dividend to distribute to each shareholder
        uint amount_to_distribute = dividendToken.balanceOf(address(this)) / 12;

        // Iterate over the list of shareholders
        for (uint i = start; i < shareHolders.length; i++) {
            // Calculate the dividend amount for each shareholder based on their shares
            claimAmount[shareHolders[i]] +=
                (shares[shareHolders[i]] * amount_to_distribute) /
                totalSupply;
        }
    }

    /**
     * @dev Claims dividend amount for the caller
     */
    function claim_dividend() public {
        // Get the dividend amount available for the caller
        uint claim = claimAmount[msg.sender];

        // Ensure that there is a dividend to claim and the caller owns shares
        require(claim > 0, "Dividend already claimed or doesn't own shares");

        // Set the claimed amount to 0 to prevent double claiming
        claimAmount[msg.sender] = 0;

        // Transfer the dividend amount to the caller
        dividendToken.transfer(msg.sender, claim);
    }

    /**
     * @dev Tracks the transfer of shares from one address to another
     * @param amount The amount of shares being transferred
     * @param from The address from which shares are being transferred
     * @param to The address to which shares are being transferred
     */
    function trackShares(uint amount, address from, address to) public {
        // Ensure the amount is greater than zero
        require(amount > 0, "Amount should be greater than zero");

        // Ensure the 'to' address is not the zero address
        require(to != address(0), "To can't be zero address");

        // Ensure the 'from' address has enough shares to transfer

        // Track the previous amount of shares for the 'from' address
        uint prev_amount_from = shares[from];

        // Check if the 'to' address already exists in the shareHolders list
        if (exists[to]) {
            // Add the transferred amount to the existing shares of the 'to' address
            shares[to] += amount;
        } else {
            // Add the 'to' address to the shareHolders list
            shareHolders.push(to);
            // Set the shares of the 'to' address to the transferred amount
            shares[to] = amount;
            // Mark the 'to' address as existing
            exists[to] = true;
        }

        // Handle the cases where the transferred amount is equal to or less than the previous amount of shares for the 'from' address

        if (amount == prev_amount_from) {
            // If the transferred amount is equal to the previous amount,
            // set the shares of the 'from' address to zero, mark it as not existing,
            // and rearrange the shareHolders list by moving the 'from' address to the end of the processed addresses
            shares[from] = 0;
            exists[from] = false;
            uint i = start;
            while (shareHolders[i] != from) {
                i++;
            }
            address temp = shareHolders[start];
            shareHolders[start] = shareHolders[i];
            shareHolders[i] = temp;
            start += 1;
        } else if (amount < prev_amount_from) {
            // If the transferred amount is less than the previous amount,
            // subtract the transferred amount from the shares of the 'from' address
            shares[from] -= amount;
        }
    }

    function DividendAmount(
        address shareHolder
    ) external view returns (uint256) {
        require(msg.sender == dataAccessAdmin, "Not Authorized");
        return claimAmount[shareHolder];
    }
}
