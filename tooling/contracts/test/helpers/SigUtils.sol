// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library SigUtils {
    bytes32 internal constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256(
            "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
        );

    function getStructHash(
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

    function getTypedDataHash(
        bytes32 domainSeparator,
        bytes32 structHash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", domainSeparator, structHash)
            );
    }
}
