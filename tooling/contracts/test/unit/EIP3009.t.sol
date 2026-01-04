pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/ERC3009.sol";
import "../helpers/SigUtils.sol";

contract ERC3009Test is Test {
    ERC3009 token;

    uint256 fromPk;
    address from;
    address to;

    function setUp() public {
        token = new ERC3009("TestToken", "TT", 6, 1_000e6);

        fromPk = 0xA11CE;
        from = vm.addr(fromPk);
        to = address(0xBEEF);

        token.transfer(from, 1_000e6);
    }

    function testAliceBalance() public {
        assertEq(token.balanceOf(from), 1_000e6);
        assertEq(token.balanceOf(to), 0);
    }

    function testTransferWithAuthorization() public {
        uint256 value = 100e6;
        uint256 validAfter = block.timestamp - 1;
        uint256 validBefore = block.timestamp + 1 days;
        bytes32 nonce = keccak256("nonce");

        bytes32 structHash = SigUtils.getStructHash(
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce
        );

        bytes32 digest = SigUtils.getTypedDataHash(
            token.DOMAIN_SEPARATOR(),
            structHash
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(fromPk, digest);

        token.transferWithAuthorization(
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );

        assertEq(token.balanceOf(from), 900e6);
        assertEq(token.balanceOf(to), 100e6);
    }
}
