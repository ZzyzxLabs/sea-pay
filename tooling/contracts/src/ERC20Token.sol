// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal ERC20 patterned after OpenZeppelin semantics (no hooks).
contract ERC20Token {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) {
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= value, "ERC20: insufficient allowance");
        unchecked {
            _approve(from, msg.sender, currentAllowance - value);
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "ERC20: transfer to zero");
        uint256 fromBal = balanceOf[from];
        require(fromBal >= value, "ERC20: insufficient balance");
        unchecked {
            balanceOf[from] = fromBal - value;
        }
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "ERC20: mint to zero");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from zero");
        require(spender != address(0), "ERC20: approve to zero");
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
}
