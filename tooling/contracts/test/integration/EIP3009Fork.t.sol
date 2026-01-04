// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

interface IEIP3009 {
    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

contract EIP3009ForkTest is Test {
    // === FILL THESE IN WITH REAL ADDRESSES ON YOUR FORKED CHAIN ===
    // Example (Base mainnet USDC): TOKEN = 0x833589fCD6eDb6E08f4c7C32D4f71b54b267Bea4
    // Example whale: a rich USDC holder address from a block explorer.
    address constant USDC_TOKEN =
        address(0x036CbD53842c5426634e7929541eC2318f3dCF7e);
    address constant WHALE_ACCOUNT =
        address(0x0DB1C29b18398bf3a00209c185a4F972eBaA1F63);
    // ==============================================================

    IEIP3009 token = IEIP3009(USDC_TOKEN);
    IERC20 erc20 = IERC20(USDC_TOKEN);

    uint256 userPk;
    address user; // signer ("from")
    address relayer; // pays gas / submits tx
    address recipient;

    // ERC-3009 typehash (most implementations use exactly this)
    bytes32 constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256(
            "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
        );

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("base_sepolia"), 10000000);

        userPk = 0xA11CE;
        user = vm.addr(userPk);

        relayer = makeAddr("relayer");
        recipient = makeAddr("recipient");

        vm.deal(relayer, 1 ether);

        // Fund the user with tokens by impersonating a whale.
        vm.startPrank(WHALE_ACCOUNT);
        (bool ok, ) = USDC_TOKEN.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                user,
                10_000_000
            ) // e.g. 10 USDC if 6 decimals
        );
        require(ok, "whale transfer failed");
        vm.stopPrank();

        console2.log("chainid", block.chainid);
        console2.log("usdc code length", address(USDC_TOKEN).code.length);
    }

    function test_transferWithAuthorization_happyPath() public {
        uint256 value = 1_000_000; // 1 USDC if 6 decimals
        uint256 validAfter = 0;
        uint256 validBefore = block.timestamp + 1 hours;
        bytes32 nonce = keccak256(
            abi.encodePacked("nonce-1", block.number, user)
        );

        uint256 userBalBefore = erc20.balanceOf(user);
        uint256 toBalBefore = erc20.balanceOf(recipient);

        bytes32 digest = _eip712Digest(
            token.DOMAIN_SEPARATOR(),
            _structHash(user, recipient, value, validAfter, validBefore, nonce)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);

        vm.startPrank(relayer);
        uint256 gasBefore = gasleft();
        token.transferWithAuthorization(
            user,
            recipient,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );
        uint256 gasAfter = gasleft();
        vm.stopPrank();

        console2.log("gas used", gasBefore - gasAfter);
        assertEq(erc20.balanceOf(user), userBalBefore - value, "user balance");
        assertEq(
            erc20.balanceOf(recipient),
            toBalBefore + value,
            "recipient balance"
        );
    }

    function test_transferWithAuthorization_replayFails() public {
        uint256 value = 1_000_000;
        uint256 validAfter = 0;
        uint256 validBefore = block.timestamp + 1 hours;
        bytes32 nonce = keccak256(
            abi.encodePacked("nonce-replay", block.number, user)
        );

        bytes32 digest = _eip712Digest(
            token.DOMAIN_SEPARATOR(),
            _structHash(user, recipient, value, validAfter, validBefore, nonce)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);

        vm.startPrank(relayer);
        token.transferWithAuthorization(
            user,
            recipient,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );

        vm.expectRevert();
        token.transferWithAuthorization(
            user,
            recipient,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );
        vm.stopPrank();
    }

    function test_transferWithAuthorization_expired_reverts() public {
        uint256 value = 1_000_000;
        uint256 validAfter = 0;
        uint256 validBefore = block.timestamp; // already expired
        bytes32 nonce = keccak256(
            abi.encodePacked("nonce-expired", block.number, user)
        );

        bytes32 digest = _eip712Digest(
            token.DOMAIN_SEPARATOR(),
            _structHash(user, recipient, value, validAfter, validBefore, nonce)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);

        vm.startPrank(relayer);
        vm.expectRevert(); // most implementations revert on expiry
        token.transferWithAuthorization(
            user,
            recipient,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );
        vm.stopPrank();
    }

    function test_transferWithAuthorization_notYetValid_reverts() public {
        uint256 value = 1_000_000;
        uint256 validAfter = block.timestamp + 1 hours; // in the future
        uint256 validBefore = block.timestamp + 2 hours;
        bytes32 nonce = keccak256(
            abi.encodePacked("nonce-future", block.number, user)
        );

        bytes32 digest = _eip712Digest(
            token.DOMAIN_SEPARATOR(),
            _structHash(user, recipient, value, validAfter, validBefore, nonce)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);

        vm.startPrank(relayer);
        vm.expectRevert(); // not valid yet
        token.transferWithAuthorization(
            user,
            recipient,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );
        vm.stopPrank();
    }

    function _structHash(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
                    from,
                    to,
                    value,
                    validAfter,
                    validBefore,
                    nonce
                )
            );
    }

    function _eip712Digest(
        bytes32 domainSeparator,
        bytes32 structHash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", domainSeparator, structHash)
            );
    }
}
