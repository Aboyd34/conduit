// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ConduitToken (CDT)
/// @notice ERC20 token for the Conduit platform — production-ready with maxSupply cap
/// @dev Testnet: 0x719d3f3E01E365F9aa73374674499539fdD0f82E (Base Sepolia)
contract ConduitToken is ERC20, Ownable {
    /// @notice Hard cap — can never mint beyond this
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion CDT

    event MaxSupplyReached(uint256 totalSupply);

    constructor(address initialOwner)
        ERC20("ConduitToken", "CDT")
        Ownable(initialOwner)
    {
        // Initial mint: 1,000,000 CDT to owner
        _mintCapped(initialOwner, 1_000_000 * 10 ** decimals());
    }

    /// @notice Mint additional tokens (owner only, capped at MAX_SUPPLY)
    function mint(address to, uint256 amount) external onlyOwner {
        _mintCapped(to, amount);
    }

    /// @dev Internal mint that enforces the hard cap
    function _mintCapped(address to, uint256 amount) internal {
        require(totalSupply() + amount <= MAX_SUPPLY, "CDT: exceeds max supply");
        _mint(to, amount);
        if (totalSupply() == MAX_SUPPLY) {
            emit MaxSupplyReached(totalSupply());
        }
    }

    /// @notice Returns how many CDT can still be minted
    function mintableRemaining() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
