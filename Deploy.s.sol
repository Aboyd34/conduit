// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AethToken.sol";
import "../src/MerkleAirdrop.sol";

contract Deploy is Script {
    function run() external {
        // Load your private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AethToken
        AethToken token = new AethToken();
        console.log("AethToken deployed at:", address(token));

        // 2. Your REAL Merkle Root
        bytes32 merkleRoot = 0xabc1b9a93df207939281f7a0b0510febd6f4fe3883c41a1f1dd22dcb5a9550d4;

        // 3. Deploy MerkleAirdrop
        MerkleAirdrop airdrop = new MerkleAirdrop(address(token), merkleRoot);
        console.log("MerkleAirdrop deployed at:", address(airdrop));

        vm.stopBroadcast();
    }
}
