// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ConduitToken (CDT)
/// @notice ERC20 token for the Conduit platform
/// @dev Deployed on Base Sepolia: 0x719d3f3E01E365F9aa73374674499539fdD0f82E
contract ConduitToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("ConduitToken", "CDT")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    /// @notice Mint additional tokens (owner only)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
