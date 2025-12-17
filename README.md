# Batch Transfer

A secure and efficient smart contract for batch transferring ETH and ERC20 tokens. Built with Foundry.

## Features

- **Batch ETH Transfer**: Send ETH to multiple recipients in a single transaction.
- **Batch ERC20 Transfer**: Two modes for token transfers:
  - `simpleBatchTransferToken`: Direct `transferFrom` from sender to recipients (useful for non-standard tokens).
  - `batchTransferToken`: Pulls total amount to contract first, then distributes (gas optimized).
- **Multi-Token Transfer**: Send different tokens to different recipients in one go.
- **Combined Transfer**: Send ETH and multiple ERC20 tokens in a single transaction.
- **Security**:
  - `ReentrancyGuard`: Protects against reentrancy attacks.
  - `Ownable`: Access control for critical functions.
  - `Pausable`: Emergency stop mechanism.
  - `SafeERC20`: Handled non-standard ERC20 implementations.
- **Gas Optimized**: Uses assembly for hashing and optimized loops.

## Installation

Ensure you have [Foundry](https://book.getfoundry.sh/getting-started/installation) installed.

```shell
git clone git@github.com:ujangdoubleday/batch-transfer.git
cd batch-transfer
forge install
```

## Usage

### Test

Run the comprehensive test suite:

```shell
forge test
```

### Build

```shell
forge build
```

### Deploy

To deploy the contract to a network:

```shell
forge script script/BatchTransfer.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
```

## Contract Details

### `maxRecipients`

To prevent out-of-gas errors, the contract enforces a maximum number of recipients per batch (default 100). The owner can adjust this limit between 1 and 500.

### Emergency Functions

The owner can recover ETH or tokens accidentally sent to the contract address using `emergencyWithdrawEth` and `emergencyWithdrawToken`. Note: The contract logic does not hold user funds during normal operation.

## License

[MIT](LICENSE.md)
