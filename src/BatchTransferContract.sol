// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BatchTransferContract
 * @author https://github.com/ujangdoubleday
 * @notice Contract for efficient batch transfers of ETH and ERC20 tokens
 * @dev Implements ReentrancyGuard, Ownable, and Pausable for maximum security
 *      Gas optimizations: Custom Errors, Unchecked Loops
 * 
 * Features:
 * - Batch transfer ETH to multiple recipients
 * - Batch transfer single ERC20 token to multiple recipients (2 modes)
 * - Batch transfer multiple ERC20 tokens to multiple recipients
 * - Combined batch transfer (ETH + multiple tokens in single transaction)
 * - Pausable for emergency situations
 * - Owner-controlled max recipients limit
 * - Emergency withdrawal functions
 * 
 * Security:
 * - ReentrancyGuard protects against reentrancy attacks
 * - SafeERC20 protects against token transfer failures
 * - Pausable allows owner to pause contract during emergencies
 * - Extensive input validations (zero address, zero amount, array length checks)
 * - No external calls after state changes (CEI pattern)
 */
contract BatchTransferContract is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using Address for address;

    /*//////////////////////////////////////////////////////////////
                            CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidMaxRecipients();
    error EmptyRecipients();
    error LengthMismatch();
    error TooManyRecipients();
    error ZeroRecipient();
    error ZeroAmount();
    error ZeroTokenAddress();
    error IncorrectMsgValue();
    error TokenArraysMismatch();
    error EthArraysMismatch();
    error EmptyArrays();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Maximum number of recipients allowed per batch operation
    /// @dev Default 100, owner can update between 1-500. This limit prevents out-of-gas errors
    uint256 public maxRecipients = 100;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when ETH batch transfer succeeds
     * @param sender Address that initiated the transfer
     * @param totalAmount Total ETH transferred (in Wei)
     * @param recipientCount Number of recipients
     * @param batchHash Unique hash for this batch (for tracking and audit purposes)
     */
    event BatchTransferEth(
        address indexed sender, 
        uint256 totalAmount, 
        uint256 recipientCount,
        bytes32 indexed batchHash
    );
    
    /**
     * @notice Emitted when ERC20 token batch transfer succeeds
     * @param sender Address that initiated the transfer
     * @param token Address of the ERC20 token transferred
     * @param totalAmount Total tokens transferred
     * @param recipientCount Number of recipients
     * @param batchHash Unique hash for this batch
     */
    event BatchTransferToken(
        address indexed sender, 
        address indexed token,
        uint256 totalAmount,
        uint256 recipientCount,
        bytes32 indexed batchHash
    );
    
    /**
     * @notice Emitted when multiple tokens batch transfer succeeds
     * @param sender Address that initiated the transfer
     * @param tokenCount Number of token transfers performed
     * @param batchHash Unique hash for this batch
     */
    event BatchTransferMultiToken(
        address indexed sender,
        uint256 tokenCount,
        bytes32 indexed batchHash
    );
    
    /**
     * @notice Emitted when combined batch transfer (ETH + tokens) succeeds
     * @param sender Address that initiated the transfer
     * @param ethAmount Total ETH transferred
     * @param tokenCount Number of token transfers performed
     * @param batchHash Unique hash for this batch
     */
    event BatchTransferCombined(
        address indexed sender,
        uint256 ethAmount,
        uint256 tokenCount,
        bytes32 indexed batchHash
    );

    /**
     * @notice Emitted when max recipients limit is updated
     * @param oldValue Previous value
     * @param newValue New value
     */
    event MaxRecipientsUpdated(uint256 oldValue, uint256 newValue);

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes contract with deployer as owner
     * @dev Sets msg.sender as owner (required by OpenZeppelin Ownable v5.x)
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Allows contract to receive ETH directly
     * @dev Needed to receive ETH refunds or direct transfers
     */
    receive() external payable {}

    /*//////////////////////////////////////////////////////////////
                        OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Updates maximum recipients limit
     * @dev Only owner can call this. Limit between 1-500 to prevent gas issues
     * @param _maxRecipients New maximum recipients value (must be 1-500)
     * 
     * Requirements:
     * - Caller must be owner
     * - _maxRecipients must be > 0 and <= 500
     */
    function setMaxRecipients(uint256 _maxRecipients) external onlyOwner {
        if (_maxRecipients == 0 || _maxRecipients > 500) revert InvalidMaxRecipients();
        uint256 oldValue = maxRecipients;
        maxRecipients = _maxRecipients;
        emit MaxRecipientsUpdated(oldValue, _maxRecipients);
    }

    /**
     * @notice Pauses all batch transfer operations
     * @dev Only owner can call. Used in emergency situations
     * 
     * Requirements:
     * - Caller must be owner
     * - Contract must not already be paused
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses batch transfer operations
     * @dev Only owner can call
     * 
     * Requirements:
     * - Caller must be owner
     * - Contract must be paused
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                    BATCH TRANSFER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Batch transfers ETH to multiple recipients
     * @dev Transfers exact amounts to each recipient. Total msg.value must equal sum of amounts
     * 
     * @param recipients Array of recipient addresses (max length = maxRecipients)
     * @param amounts Array of amounts in Wei for each recipient
     * 
     * Requirements:
     * - Contract must not be paused
     * - Arrays must not be empty
     * - Array lengths must match
     * - Recipients length <= maxRecipients
     * - No zero addresses in recipients
     * - No zero amounts
     * - msg.value must equal sum of all amounts
     * 
     * Example:
     * ```
     * address[] memory addrs = [0xAAA..., 0xBBB...];
     * uint256[] memory amts = [0.1 ether, 0.2 ether];
     * contract.batchTransferEth{value: 0.3 ether}(addrs, amts);
     * ```
     * 
     * @custom:security Reentrancy protected, uses CEI pattern
     */
    function batchTransferEth(
        address[] calldata recipients, 
        uint256[] calldata amounts
    ) external payable nonReentrant whenNotPaused {
        if (recipients.length == 0) revert EmptyRecipients();
        if (recipients.length != amounts.length) revert LengthMismatch();
        if (recipients.length > maxRecipients) revert TooManyRecipients();

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length;) {
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            total += amounts[i];
            unchecked { ++i; }
        }
        if (msg.value != total) revert IncorrectMsgValue();

        for (uint256 i = 0; i < recipients.length;) {
            Address.sendValue(payable(recipients[i]), amounts[i]);
            unchecked { ++i; }
        }

        bytes32 batchHash = _computeHash(
            abi.encodePacked(msg.sender, recipients, amounts, block.number, block.timestamp)
        );
        emit BatchTransferEth(msg.sender, total, recipients.length, batchHash);
    }

    /**
     * @notice Simple batch transfer: Transfers ERC20 token to multiple recipients (direct transferFrom)
     * @dev Each transfer goes directly from caller to recipient. Caller must approve contract for TOTAL amount
     * 
     * @param tokenAddress Address of ERC20 token contract
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts for each recipient (in smallest unit, e.g., Wei for WETH)
     * 
     * Requirements:
     * - Contract must not be paused
     * - Token address must not be zero address
     * - Arrays must not be empty
     * - Array lengths must match
     * - Recipients length <= maxRecipients
     * - No zero addresses in recipients
     * - No zero amounts
     * - Caller must have approved this contract for sum(amounts) tokens
     * 
     * Gas Usage: More expensive than batchTransferToken due to multiple transferFrom calls
     * 
     * Example:
     * ```
     * // Approve first
     * IERC20(token).approve(contractAddress, 1000e18);
     * 
     * // Then call
     * address[] memory addrs = [0xAAA..., 0xBBB...];
     * uint256[] memory amts = [500e18, 500e18];
     * contract.simpleBatchTransferToken(token, addrs, amts);
     * ```
     * 
     * @custom:security Uses SafeERC20 to handle non-standard tokens
     */
    function simpleBatchTransferToken(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (tokenAddress == address(0)) revert ZeroTokenAddress();
        if (recipients.length == 0) revert EmptyRecipients();
        if (recipients.length != amounts.length) revert LengthMismatch();
        if (recipients.length > maxRecipients) revert TooManyRecipients();

        IERC20 token = IERC20(tokenAddress);

        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length;) {
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            token.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            total += amounts[i];
            unchecked { ++i; }
        }

        bytes32 batchHash = _computeHash(
            abi.encodePacked(msg.sender, tokenAddress, recipients, amounts, block.number, block.timestamp)
        );
        
        emit BatchTransferToken(msg.sender, tokenAddress, total, recipients.length, batchHash);
    }

    /**
     * @notice Batch transfer: Pulls total tokens to contract, then distributes to recipients
     * @dev More gas efficient than simpleBatchTransferToken. Contract pulls total amount first, then distributes
     * 
     * @param tokenAddress Address of ERC20 token contract
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts for each recipient
     * 
     * Requirements:
     * - Same as simpleBatchTransferToken
     * - Caller must have approved this contract for sum(amounts) tokens
     * 
     * Gas Usage: Cheaper than simpleBatchTransferToken (1 transferFrom + N transfers vs N transferFrom)
     * 
     * Example:
     * ```
     * // Approve first
     * IERC20(token).approve(contractAddress, 1000e18);
     * 
     * // Then call
     * address[] memory addrs = [0xAAA..., 0xBBB...];
     * uint256[] memory amts = [500e18, 500e18];
     * contract.batchTransferToken(token, addrs, amts);
     * ```
     * 
     * @custom:security Contract temporarily holds tokens, but immediately distributes them (no state change between)
     */
    function batchTransferToken(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (tokenAddress == address(0)) revert ZeroTokenAddress();
        if (recipients.length == 0) revert EmptyRecipients();
        if (recipients.length != amounts.length) revert LengthMismatch();
        if (recipients.length > maxRecipients) revert TooManyRecipients();

        IERC20 token = IERC20(tokenAddress);

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length;) {
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            total += amounts[i];
            unchecked { ++i; }
        }

        token.safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i = 0; i < recipients.length;) {
            token.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        bytes32 batchHash = _computeHash(
            abi.encodePacked(msg.sender, tokenAddress, recipients, amounts, block.number, block.timestamp)
        );
        emit BatchTransferToken(msg.sender, tokenAddress, total, recipients.length, batchHash);
    }

    /**
     * @notice Batch transfers multiple different tokens to multiple recipients
     * @dev Each index is a separate transfer: tokenAddresses[i] -> recipients[i] for amounts[i]
     * 
     * @param tokenAddresses Array of ERC20 token addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts
     * 
     * Requirements:
     * - Contract must not be paused
     * - All three arrays must have the same length
     * - Arrays must not be empty
     * - Total length <= maxRecipients
     * - No zero addresses in tokenAddresses or recipients
     * - No zero amounts
     * - Caller must have approved this contract for amounts[i] of tokenAddresses[i] for each i
     * 
     * Use Case: Transfer different tokens to different recipients in a single transaction
     * 
     * Example:
     * ```
     * // Approve each token first
     * IERC20(tokenA).approve(contractAddress, 100e18);
     * IERC20(tokenB).approve(contractAddress, 200e18);
     * 
     * // Then call
     * address[] memory tokens = [tokenA, tokenB];
     * address[] memory addrs = [0xAAA..., 0xBBB...];
     * uint256[] memory amts = [100e18, 200e18];
     * contract.batchTransferMultiTokens(tokens, addrs, amts);
     * ```
     * 
     * @custom:security Each transfer is independent, if one fails all revert
     */
    function batchTransferMultiTokens(
        address[] calldata tokenAddresses,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (tokenAddresses.length == 0) revert EmptyArrays();
        if (tokenAddresses.length != recipients.length || recipients.length != amounts.length) revert LengthMismatch();
        if (tokenAddresses.length > maxRecipients) revert TooManyRecipients();

        for (uint256 i = 0; i < tokenAddresses.length;) {
            if (tokenAddresses[i] == address(0)) revert ZeroTokenAddress();
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            
            IERC20(tokenAddresses[i]).safeTransferFrom(
                msg.sender,
                recipients[i],
                amounts[i]
            );
            unchecked { ++i; }
        }

        bytes32 batchHash = _computeHash(
            abi.encodePacked(msg.sender, tokenAddresses, recipients, amounts, block.number, block.timestamp)
        );
        emit BatchTransferMultiToken(msg.sender, tokenAddresses.length, batchHash);
    }

    /**
     * @notice Combined batch transfer: ETH + multiple tokens in a single transaction
     * @dev Powerful function to transfer ETH and multiple tokens simultaneously. Useful for airdrops or payroll
     * 
     * @param tokenAddresses Array of ERC20 token addresses to transfer
     * @param tokenRecipients Array of token recipients (parallel with tokenAddresses)
     * @param tokenAmounts Array of token amounts (parallel with tokenAddresses)
     * @param ethRecipients Array of ETH recipients
     * @param ethAmounts Array of ETH amounts in Wei (parallel with ethRecipients)
     * 
     * Requirements:
     * - Contract must not be paused
     * - tokenAddresses, tokenRecipients, tokenAmounts must have the same length
     * - ethRecipients, ethAmounts must have the same length
     * - Both lengths <= maxRecipients
     * - No zero addresses in any recipient arrays or token addresses
     * - No zero amounts
     * - If ethRecipients not empty: msg.value must equal sum(ethAmounts)
     * - If ethRecipients empty: msg.value must be 0
     * - Caller must have approved this contract for all token amounts
     * 
     * Use Case: Payroll with ETH for gas + stablecoins, or multi-token + ETH airdrops
     * 
     * Example:
     * ```
     * // Approve tokens
     * IERC20(tokenA).approve(contractAddress, 100e18);
     * 
     * // Prepare arrays
     * address[] memory tokens = [tokenA];
     * address[] memory tokenRecips = [0xAAA...];
     * uint256[] memory tokenAmts = [100e18];
     * address[] memory ethRecips = [0xBBB..., 0xCCC...];
     * uint256[] memory ethAmts = [0.1 ether, 0.2 ether];
     * 
     * // Call with ETH
     * contract.batchTransferCombinedMultiTokens{value: 0.3 ether}(
     *     tokens, tokenRecips, tokenAmts,
     *     ethRecips, ethAmts
     * );
     * ```
     * 
     * @custom:security ETH transfers executed first, then token transfers (CEI pattern)
     * @custom:gas-optimization Split into internal functions to avoid stack too deep
     */
    function batchTransferCombinedMultiTokens(
        address[] calldata tokenAddresses,
        address[] calldata tokenRecipients,
        uint256[] calldata tokenAmounts,
        address[] calldata ethRecipients,
        uint256[] calldata ethAmounts
    ) external payable nonReentrant whenNotPaused {
        _validateCombinedArrays(tokenAddresses, tokenRecipients, tokenAmounts, ethRecipients, ethAmounts);
        
        uint256 totalEth = _processEthTransfers(ethRecipients, ethAmounts);
        _processTokenTransfers(tokenAddresses, tokenRecipients, tokenAmounts);

        bytes32 batchHash = _computeHash(
            abi.encodePacked(
                msg.sender,
                tokenAddresses,
                tokenRecipients,
                tokenAmounts,
                ethRecipients,
                ethAmounts,
                block.number,
                block.timestamp
            )
        );
        emit BatchTransferCombined(msg.sender, totalEth, tokenAddresses.length, batchHash);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Validates arrays for combined batch transfer
     * @dev Internal helper to reduce stack depth
     * @param tokenAddresses Token addresses array
     * @param tokenRecipients Token recipients array
     * @param tokenAmounts Token amounts array
     * @param ethRecipients ETH recipients array
     * @param ethAmounts ETH amounts array
     */
    function _validateCombinedArrays(
        address[] calldata tokenAddresses,
        address[] calldata tokenRecipients,
        uint256[] calldata tokenAmounts,
        address[] calldata ethRecipients,
        uint256[] calldata ethAmounts
    ) internal view {
        if (tokenAddresses.length != tokenRecipients.length || tokenAddresses.length != tokenAmounts.length) revert TokenArraysMismatch();
        if (ethRecipients.length != ethAmounts.length) revert EthArraysMismatch();
        if (ethRecipients.length > maxRecipients || tokenAddresses.length > maxRecipients) revert TooManyRecipients();
    }

    /**
     * @notice Processes ETH transfers in combined batch transfer
     * @dev Internal helper to reduce stack depth. Returns total ETH transferred
     * @param recipients ETH recipients array
     * @param amounts ETH amounts array
     * @return totalEth Total amount of ETH transferred
     */
    function _processEthTransfers(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal returns (uint256 totalEth) {
        if (recipients.length == 0) {
            if (msg.value != 0) revert IncorrectMsgValue();
            return 0;
        }

        for (uint256 i = 0; i < amounts.length;) {
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            totalEth += amounts[i];
            unchecked { ++i; }
        }
        if (msg.value != totalEth) revert IncorrectMsgValue();

        for (uint256 i = 0; i < recipients.length;) {
            Address.sendValue(payable(recipients[i]), amounts[i]);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Processes token transfers in combined batch transfer
     * @dev Internal helper to reduce stack depth
     * @param tokenAddresses Token addresses array
     * @param recipients Token recipients array
     * @param amounts Token amounts array
     */
    function _processTokenTransfers(
        address[] calldata tokenAddresses,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal {
        for (uint256 i = 0; i < tokenAddresses.length;) {
            if (tokenAddresses[i] == address(0)) revert ZeroTokenAddress();
            if (recipients[i] == address(0)) revert ZeroRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            
            IERC20(tokenAddresses[i]).safeTransferFrom(
                msg.sender,
                recipients[i],
                amounts[i]
            );
            unchecked { ++i; }
        }
    }

    /**
     * @notice Computes keccak256 hash using assembly for gas efficiency
     * @dev More efficient than regular keccak256() - saves ~100 gas per call
     * @param data Bytes data to hash
     * @return result The keccak256 hash
     */
    function _computeHash(bytes memory data) internal pure returns (bytes32 result) {
        assembly {
            result := keccak256(add(data, 32), mload(data))
        }
    }

    /*//////////////////////////////////////////////////////////////
                    EMERGENCY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emergency withdraws ERC20 tokens stuck in contract
     * @dev Only owner can call. Useful if tokens are accidentally sent to the contract
     * 
     * @param tokenAddress Address of ERC20 token to withdraw
     * @param to Destination address
     * @param amount Amount to withdraw
     * 
     * Requirements:
     * - Caller must be owner
     * - Token address must not be zero address
     * - Destination must not be zero address
     * 
     * @custom:security Owner only, cannot be used to steal user funds as contract doesn't hold user funds
     */
    function emergencyWithdrawToken(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (tokenAddress == address(0)) revert ZeroTokenAddress();
        if (to == address(0)) revert ZeroRecipient();
        IERC20(tokenAddress).safeTransfer(to, amount);
    }

    /**
     * @notice Emergency withdraws ETH stuck in contract
     * @dev Only owner can call. Useful if ETH is accidentally sent to the contract
     * 
     * @param to Destination address
     * @param amount Amount in Wei to withdraw
     * 
     * Requirements:
     * - Caller must be owner
     * - Destination must not be zero address
     * 
     * @custom:security Owner only, cannot be used to steal user funds as contract doesn't hold user funds
     */
    function emergencyWithdrawEth(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroRecipient();
        Address.sendValue(to, amount);
    }
}
