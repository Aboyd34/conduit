// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MerkleAirdrop — Conduit AETH Claim Contract
/// @notice Users submit a merkle proof to claim their AETH allocation
contract MerkleAirdrop is Ownable {
    IERC20 public immutable token;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed claimant, uint256 amount);
    event MerkleRootUpdated(bytes32 newRoot);

    error AlreadyClaimed();
    error InvalidProof();
    error TransferFailed();

    constructor(address _token, bytes32 _merkleRoot) Ownable(msg.sender) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    /// @notice Claim AETH with a valid merkle proof
    /// @param amount  The allocation amount (must match leaf)
    /// @param proof   Merkle proof array
    function claim(uint256 amount, bytes32[] calldata proof) external {
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        // Leaf = keccak256(abi.encodePacked(address, amount))
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        if (!MerkleProof.verify(proof, merkleRoot, leaf)) revert InvalidProof();

        hasClaimed[msg.sender] = true;
        if (!token.transfer(msg.sender, amount)) revert TransferFailed();

        emit Claimed(msg.sender, amount);
    }

    /// @notice Owner can update the merkle root (new snapshot)
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    /// @notice Owner can recover leftover tokens after airdrop
    function recoverTokens(address to, uint256 amount) external onlyOwner {
        token.transfer(to, amount);
    }
}
