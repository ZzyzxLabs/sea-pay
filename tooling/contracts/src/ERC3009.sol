// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Token.sol";

/// @notice ERC20 with ERC-3009 transferWithAuthorization (EIP-712 based).
contract ERC3009 is ERC20Token {
    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f;

    // keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")
    bytes32 private constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        0xf30dba93fb94d7c673aa6009a29435318f7458c7a4a1a91cf77e3f3db0f7b2f6;

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(bytes32 => bool) public authorizationState; // true if used or canceled

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20Token(name_, symbol_, decimals_, initialSupply) {
        DOMAIN_SEPARATOR = _buildDomainSeparator();
    }

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
    ) external {
        require(block.timestamp > validAfter, "AUTH_NOT_YET_VALID");
        require(block.timestamp < validBefore, "AUTH_EXPIRED");
        require(!authorizationState[nonce], "AUTH_ALREADY_USED");

        bytes32 structHash = keccak256(
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

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recovered = ecrecover(digest, v, r, s);
        require(
            recovered != address(0) && recovered == from,
            "INVALID_SIGNATURE"
        );

        authorizationState[nonce] = true;
        emit AuthorizationUsed(from, nonce);

        _transfer(from, to, value);
    }

    function _buildDomainSeparator() private view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712_DOMAIN_TYPEHASH,
                    keccak256(bytes(name)),
                    keccak256(bytes("1")),
                    block.chainid,
                    address(this)
                )
            );
    }
}
