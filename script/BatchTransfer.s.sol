// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {BatchTransferContract} from "../src/BatchTransferContract.sol";

contract BatchTransferScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        
        // If PRIVATE_KEY is not set, use the default foundry sender (startBroadcast with no args)
        // effectively using the first account of the local node or the --sender flag
        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        BatchTransferContract batchTransfer = new BatchTransferContract();
        console.log("BatchTransferContract deployed at:", address(batchTransfer));

        vm.stopBroadcast();
    }
}
