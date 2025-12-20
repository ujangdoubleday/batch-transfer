# Batch Transfer

**Batch Transfer** is a secure and gas-efficient smart contract for distributing **ETH** and **ERC20 tokens** to multiple recipients in a single transaction.

This project includes a **Foundry**-based smart contract and a **React + TypeScript + Vite** user interface for managing batch transactions.

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

## Getting Started

### 1. Clone & Install

```shell
git clone git@github.com:ujangdoubleday/batch-transfer.git
cd batch-transfer
forge install
```

### 2. Test

Run the comprehensive test suite to ensure everything is working correctly:

```shell
forge test
```

### 3. Build

Compile the smart contracts:

```shell
forge build
```

### 4. Frontend (UI)

The project includes a React + TypeScript + Vite frontend located in the `ui/` directory. You can run all commands from the root directory.

**Install Dependencies:**

```shell
npm install
```

**Run Development Server:**

```shell
npm run dev
```

**Build & Preview:**

```shell
npm run build
npm run preview
```

## Deployment & Verification

I use the **Sepolia** network for testing.

### Deploy

**Usage:**

```shell
forge script script/BatchTransfer.s.sol:BatchTransferScript \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY> \
  --broadcast
```

**Example:**

```shell
forge script script/BatchTransfer.s.sol:BatchTransferScript \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY> \
  --broadcast
```

**Deployed Contract Address**: <a href="https://sepolia.etherscan.io/address/0x7f17307ab20599c8b5B3d1dCf26667baae096478" target="_blank">0x7f17307ab20599c8b5B3d1dCf26667baae096478</a>

### Verify

**Usage:**

```shell
forge verify-contract \
  --chain sepolia \
  --num-of-optimizations 200 \
  --compiler-version <YOUR_VERSION> \
  <BATCH_CONTRACT_ADDRESS> \
  src/BatchTransferContract.sol:BatchTransferContract
```

**Example:**

```shell
forge verify-contract \
  --chain sepolia \
  --num-of-optimizations 200 \
  --compiler-version v0.8.30 \
  0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  src/BatchTransferContract.sol:BatchTransferContract
```

## Usage Guide (Cast)

This section demonstrates how to interact with the deployed contract using `cast` on the Sepolia network.

**Public Access**: Anyone can use these transfer functions. You do not need to be the contract owner to perform batch transfers.

### Test Tokens

I used the following test tokens for experimentation:

| Symbol   | Address                                      |
| :------- | :------------------------------------------- |
| **MTT1** | `0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C` |
| **MTT2** | `0x10Ab0D3D182C3FF60771ee9F5e7ff8ABcd98C6aC` |
| **MTT3** | `0x8869Ad42b697aA00AfDb28169d98eA66D367c57E` |

### Test Addresses

I used the following addresses for testing:

| Name           | Address                                      |
| :------------- | :------------------------------------------- |
| **My Address** | `0x101010171D3E2d1f3DcAa07b7C1B89C7d5D63Fb2` |
| **Burner 1**   | `0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11` |
| **Burner 2**   | `0x22eE339894BC6384aCCc30542E95E287f63dFC22` |
| **Burner 3**   | `0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33` |

---

### 1. Batch Transfer ETH

Send ETH to multiple recipients.

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "batchTransferEth(address[],uint256[])" \
  "[<RECIPIENT_1>,<RECIPIENT_2>,...,<RECIPIENT_N>]" \
  "[<AMOUNT_1>,<AMOUNT_2>,...,<AMOUNT_N>]" \
  --value <TOTAL_ETH_AMOUNT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

In this example, I am sending **0.01 ETH** to Burner 1, **0.02 ETH** to Burner 2, and **0.03 ETH** to Burner 3.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0xf86d1a967028b4a4fdb05113bf1895639d77201dec4eca9b33ee6abf4572281f" target="_blank">0xf86d1a967028b4a4fdb05113bf1895639d77201dec4eca9b33ee6abf4572281f</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "batchTransferEth(address[],uint256[])" \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33]" \
  "[10000000000000000,20000000000000000,30000000000000000]" \
  --value 60000000000000000 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

---

### 2. Approve Contract

Before sending tokens, you must approve the BatchTransfer contract to spend your tokens.

> [!WARNING] > **DWYOR (Do With Your Own Risk)**: Always approve **only the exact amount** you intend to transfer. Never grant unlimited allowance (infinite approval) to any smart contract, including this one.

**Usage:**

```shell
cast send <TOKEN_ADDRESS> \
  "approve(address,uint256)" \
  <BATCH_CONTRACT_ADDRESS> \
  <AMOUNT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Approving the contract to spend **100 MTT1** tokens.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0x2fa95e3fa560e9cf6d77434eee2cfa6682fc91d094782c6b2f90ae9a1764ee67" target="_blank">0x2fa95e3fa560e9cf6d77434eee2cfa6682fc91d094782c6b2f90ae9a1764ee67</a>

```shell
cast send 0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C \
  "approve(address,uint256)" \
  0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  100000000000000000000 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

---

### 3. Simple Batch Transfer Token

Transfers tokens directly from you to recipients (`transferFrom`). Good for non-standard tokens.

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "simpleBatchTransferToken(address,address[],uint256[])" \
  <TOKEN_ADDRESS> \
  "[<RECIPIENT_1>,<RECIPIENT_2>,...,<RECIPIENT_N>]" \
  "[<AMOUNT_1>,<AMOUNT_2>,...,<AMOUNT_N>]" \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Sending **1 MTT1** token to Burner 1, Burner 2, and Burner 3 using `simpleBatchTransferToken`.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0x347eceec82e68d98b5de42bfa285ae372068e501ff95fe8437c963a7b5f440a1" target="_blank">0x347eceec82e68d98b5de42bfa285ae372068e501ff95fe8437c963a7b5f440a1</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "simpleBatchTransferToken(address,address[],uint256[])" \
  0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33]" \
  "[1000000000000000000,1000000000000000000,1000000000000000000]" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

---

### 4. Batch Transfer Token

Pulls all tokens to the contract first, then distributes. More gas efficient for standard tokens.

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "batchTransferToken(address,address[],uint256[])" \
  <TOKEN_ADDRESS> \
  "[<RECIPIENT_1>,<RECIPIENT_2>,...,<RECIPIENT_N>]" \
  "[<AMOUNT_1>,<AMOUNT_2>,...,<AMOUNT_N>]" \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Sending **1 MTT1** token each to Burner 1, Burner 2, and Burner 3 using the optimized `batchTransferToken`.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0xdedc12eae3be796ca6f2a28ee5b28af6602ba2c1fb5f92ba242adffc6b6b645a" target="_blank">0xdedc12eae3be796ca6f2a28ee5b28af6602ba2c1fb5f92ba242adffc6b6b645a</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "batchTransferToken(address,address[],uint256[])" \
  0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33]" \
  "[1000000000000000000,1000000000000000000,1000000000000000000]" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

---

### 5. Multi-Token Transfer

Send different tokens to different recipients in a single transaction.

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "batchTransferMultiTokens(address[],address[],uint256[])" \
  "[<TOKEN_1>,<TOKEN_2>,...,<TOKEN_N>]" \
  "[<RECIPIENT_1>,<RECIPIENT_2>,...,<RECIPIENT_N>]" \
  "[<AMOUNT_1>,<AMOUNT_2>,...,<AMOUNT_N>]" \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Sending mixed tokens:

- **MTT1** to Burner 1 (1 Token)
- **MTT2** to Burner 2 (2 Tokens)
- **MTT3** to Burner 3 (3 Tokens)
- **MTT1** to Burner 3 (2 Tokens)
- **MTT1** to Burner 2 (2 Tokens)

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0xc392ca8682204627f9a94b388b108a32472a3dff87d4ef2da6af79d5f47aa23f" target="_blank">0xc392ca8682204627f9a94b388b108a32472a3dff87d4ef2da6af79d5f47aa23f</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "batchTransferMultiTokens(address[],address[],uint256[])" \
  "[0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C,0x10Ab0D3D182C3FF60771ee9F5e7ff8ABcd98C6aC,0x8869Ad42b697aA00AfDb28169d98eA66D367c57E,0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C,0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C]" \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33,0x22eE339894BC6384aCCc30542E95E287f63dFC22]" \
  "[1000000000000000000,2000000000000000000,3000000000000000000,2000000000000000000,2000000000000000000]" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

---

### 6. Combined Transfer (ETH + Tokens)

Send ETH and multiple tokens in one transaction.

> **Limit Note**: The `maxRecipients` limit applies **independently** to each type. If the limit is **100**, you can send up to **100 ETH transfers** AND **100 Token transfers** in a single transaction (Total 200).

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "batchTransferCombinedMultiTokens(address[],address[],uint256[],address[],uint256[])" \
  "[<TOKEN_1>,<TOKEN_2>,...,<TOKEN_N>]" \
  "[<TOKEN_RECIPIENT_1>,<TOKEN_RECIPIENT_2>,...,<TOKEN_RECIPIENT_N>]" \
  "[<TOKEN_AMOUNT_1>,<TOKEN_AMOUNT_2>,...,<TOKEN_AMOUNT_N>]" \
  "[<ETH_RECIPIENT_1>,...,<ETH_RECIPIENT_N>]" \
  "[<ETH_AMOUNT_1>,...,<ETH_AMOUNT_N>]" \
  --value <TOTAL_ETH_AMOUNT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Sending **1 MTT1**, **2 MTT2**, **3 MTT3** to Burner 1, 2, and 3 respectively, AND sending **0.003 ETH** each to Burner 1, 2, and 3.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0x6e9aca387f0fe52ef04d9c54a7574c71a7d29749e4b438b1b5dd07970b65c484" target="_blank">0x6e9aca387f0fe52ef04d9c54a7574c71a7d29749e4b438b1b5dd07970b65c484</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "batchTransferCombinedMultiTokens(address[],address[],uint256[],address[],uint256[])" \
  "[0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C,0x10Ab0D3D182C3FF60771ee9F5e7ff8ABcd98C6aC,0x8869Ad42b697aA00AfDb28169d98eA66D367c57E]" \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33]" \
  "[1000000000000000000,2000000000000000000,3000000000000000000]" \
  "[0x11Fd302Cf0cd9bC460d0c387d088eF53b2352e11,0x22eE339894BC6384aCCc30542E95E287f63dFC22,0x33d51ea1F130971EA7DF2c4F4c8b1772E252Bf33]" \
  "[3000000000000000,3000000000000000,3000000000000000]" \
  --value 9000000000000000 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

## Admin Functions

**Restricted Access**: These functions can **only** be called by the contract owner (the address that deployed the contract, or transferred ownership to). Regular users cannot use these functions.

### Pause / Unpause

Stop all transfers in case of emergency.

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> "pause()" --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
cast send <BATCH_CONTRACT_ADDRESS> "unpause()" --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

**Example:**

Pausing the contract to prevent further transfers.

**Transaction (Pause)**: <a href="https://sepolia.etherscan.io/tx/0xad5fafd3beb4e92c80bb9ed560f8b6a189421419f4fddc1303de6a8844df400a" target="_blank">0xad5fafd3beb4e92c80bb9ed560f8b6a189421419f4fddc1303de6a8844df400a</a>

**Transaction (Unpause)**: <a href="https://sepolia.etherscan.io/tx/0xbf9851817b0102c3e5d5e086da914e46aec0e7afe773d6c4b11b8839bf6edfd5" target="_blank">0xbf9851817b0102c3e5d5e086da914e46aec0e7afe773d6c4b11b8839bf6edfd5</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 "pause()" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

### Set Max Recipients

Adjust the limit of recipients per batch (Max 500).

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "setMaxRecipients(uint256)" \
  <NEW_LIMIT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Changing the maximum recipients limit to **200**.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0x678ac0dda2e2e166db70ebafc04c0ffbddb46ae165308f0fd89866dbb4dd02fb" target="_blank">0x678ac0dda2e2e166db70ebafc04c0ffbddb46ae165308f0fd89866dbb4dd02fb</a>

```shell
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "setMaxRecipients(uint256)" \
  200 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

### Emergency Withdraw

Recover accidentally sent tokens or ETH.

#### Withdraw Tokens

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "emergencyWithdrawToken(address,address,uint256)" \
  <TOKEN_ADDRESS> \
  <DESTINATION_ADDRESS> \
  <AMOUNT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Recovering **1 MTT1** token accidentally sent to the contract, returning it to my address.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0xd0bc0bb56a36c2da555c096fb0e8e2a64fec948d22216119551809716ef4bf2a" target="_blank">0xd0bc0bb56a36c2da555c096fb0e8e2a64fec948d22216119551809716ef4bf2a</a>

```shell
# Withdraw MTT1 stuck in contract
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "emergencyWithdrawToken(address,address,uint256)" \
  0x5d3B9198177d6CcF14AafbE2d140C92EE74B9d7C \
  0x101010171D3E2d1f3DcAa07b7C1B89C7d5D63Fb2 \
  1000000000000000000 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

#### Withdraw ETH

**Usage:**

```shell
cast send <BATCH_CONTRACT_ADDRESS> \
  "emergencyWithdrawEth(address,uint256)" \
  <DESTINATION_ADDRESS> \
  <AMOUNT> \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY>
```

**Example:**

Recovering **0.001 ETH** accidentally sent to the contract, returning it to my address.

**Transaction**: <a href="https://sepolia.etherscan.io/tx/0xed340f601e07a04f370e431e04e28b95eaf29f69ee66df4047b9e7d5f79b8d60" target="_blank">0xed340f601e07a04f370e431e04e28b95eaf29f69ee66df4047b9e7d5f79b8d60</a>

```shell
# Withdraw 0.001 ETH stuck in contract
cast send 0x7f17307ab20599c8b5B3d1dCf26667baae096478 \
  "emergencyWithdrawEth(address,uint256)" \
  0x101010171D3E2d1f3DcAa07b7C1B89C7d5D63Fb2 \
  1000000000000000 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key <PRIVATE_KEY>
```

## Contract Details

### `maxRecipients`

To prevent out-of-gas errors, the contract enforces a maximum number of recipients per batch (default 100). The owner can adjust this limit between 1 and 500.

## License

[MIT](LICENSE.md)
