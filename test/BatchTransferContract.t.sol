// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {BatchTransferContract} from "../src/BatchTransferContract.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract BatchTransferContractTest is Test {
    BatchTransferContract public batchTransfer;
    MockERC20 public tokenA;
    MockERC20 public tokenB;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    address[] public recipients;
    uint256[] public amounts;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        batchTransfer = new BatchTransferContract();
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");

        // Mint tokens to owner
        tokenA.mint(owner, 10000e18);
        tokenB.mint(owner, 10000e18);

        // Approve contract
        tokenA.approve(address(batchTransfer), type(uint256).max);
        tokenB.approve(address(batchTransfer), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                        OWNER FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetMaxRecipients() public {
        assertEq(batchTransfer.maxRecipients(), 100);

        batchTransfer.setMaxRecipients(200);
        assertEq(batchTransfer.maxRecipients(), 200);
    }

    function test_SetMaxRecipients_RevertIfInvalid() public {
        vm.expectRevert("Invalid max recipients");
        batchTransfer.setMaxRecipients(0);

        vm.expectRevert("Invalid max recipients");
        batchTransfer.setMaxRecipients(501);
    }

    function test_SetMaxRecipients_RevertIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        batchTransfer.setMaxRecipients(50);
    }

    function test_PauseUnpause() public {
        assertFalse(batchTransfer.paused());

        batchTransfer.pause();
        assertTrue(batchTransfer.paused());

        batchTransfer.unpause();
        assertFalse(batchTransfer.paused());
    }

    /*//////////////////////////////////////////////////////////////
                        ETH TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_BatchTransferEth() public {
        recipients = [user1, user2];
        amounts = [1 ether, 2 ether];

        uint256 preBal1 = user1.balance;
        uint256 preBal2 = user2.balance;

        batchTransfer.batchTransferEth{value: 3 ether}(recipients, amounts);

        assertEq(user1.balance, preBal1 + 1 ether);
        assertEq(user2.balance, preBal2 + 2 ether);
    }

    function test_BatchTransferEth_RevertIfMismatch() public {
        recipients = [user1, user2];
        amounts = [1 ether];

        vm.expectRevert("Length mismatch");
        batchTransfer.batchTransferEth{value: 1 ether}(recipients, amounts);
    }

    function test_BatchTransferEth_RevertIfIncorrectValue() public {
        recipients = [user1];
        amounts = [1 ether];

        vm.expectRevert("Incorrect msg.value");
        batchTransfer.batchTransferEth{value: 0.5 ether}(recipients, amounts);
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SimpleBatchTransferToken() public {
        recipients = [user1, user2];
        amounts = [10e18, 20e18];

        batchTransfer.simpleBatchTransferToken(address(tokenA), recipients, amounts);

        assertEq(tokenA.balanceOf(user1), 10e18);
        assertEq(tokenA.balanceOf(user2), 20e18);
    }

    function test_BatchTransferToken() public {
        recipients = [user1, user2];
        amounts = [10e18, 20e18];

        batchTransfer.batchTransferToken(address(tokenA), recipients, amounts);

        assertEq(tokenA.balanceOf(user1), 10e18);
        assertEq(tokenA.balanceOf(user2), 20e18);
        assertEq(tokenA.balanceOf(address(batchTransfer)), 0);
    }

    function test_BatchTransferMultiTokens() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA);
        tokens[1] = address(tokenB);

        recipients = [user1, user2];
        amounts = [10e18, 20e18];

        batchTransfer.batchTransferMultiTokens(tokens, recipients, amounts);

        assertEq(tokenA.balanceOf(user1), 10e18);
        assertEq(tokenB.balanceOf(user2), 20e18);
    }

    /*//////////////////////////////////////////////////////////////
                    COMBINED TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_BatchTransferCombinedMultiTokens() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);
        address[] memory tokenRecips = new address[](1);
        tokenRecips[0] = user1;
        uint256[] memory tokenAmts = new uint256[](1);
        tokenAmts[0] = 10e18;

        address[] memory ethRecips = new address[](1);
        ethRecips[0] = user2;
        uint256[] memory ethAmts = new uint256[](1);
        ethAmts[0] = 1 ether;

        batchTransfer.batchTransferCombinedMultiTokens{value: 1 ether}(
            tokens, tokenRecips, tokenAmts,
            ethRecips, ethAmts
        );

        assertEq(tokenA.balanceOf(user1), 10e18);
        assertEq(user2.balance, 1 ether);
    }

    /*//////////////////////////////////////////////////////////////
                    EMERGENCY FUNCTIONS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_EmergencyWithdrawToken() public {
        tokenA.mint(address(batchTransfer), 100e18);
        
        uint256 preBal = tokenA.balanceOf(owner);
        batchTransfer.emergencyWithdrawToken(address(tokenA), owner, 100e18);
        assertEq(tokenA.balanceOf(owner), preBal + 100e18);
    }

    function test_EmergencyWithdrawEth() public {
        (bool success,) = address(batchTransfer).call{value: 1 ether}("");
        require(success, "Transfer failed");

        uint256 preBal = address(this).balance;
        batchTransfer.emergencyWithdrawEth(payable(address(this)), 1 ether);
        assertEq(address(this).balance, preBal + 1 ether);
    }

    receive() external payable {}
}
