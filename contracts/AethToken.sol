// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AETH — Aether Token (Conduit)
contract AethToken is ERC20, Ownable {
    constructor(address treasury) ERC20("Aether", "AETH") Ownable(msg.sender) {
        // Mint 500 million AETH to treasury (claim contract)
        _mint(treasury, 500_000_000 * 10 ** decimals());
    }
}
