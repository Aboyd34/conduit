// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Aether
 * @notice Native token of the Conduit network.
 *
 * Supply breakdown (1,000,000,000 AETH total):
 *   50%  — Airdrop / Community (claimable via Merkle proof)
 *   20%  — Ecosystem / Platform rewards
 *   15%  — Team (vested 2 years, 6-month cliff)
 *   10%  — Liquidity
 *    5%  — Treasury
 *
 * Mechanics:
 *   - Recycle: burn AETH to re-amplify a post back to the top of the feed
 *   - Signal boost: burn AETH to weight a signal (future governance)
 *   - Token-gated rooms: hold >= GATE_THRESHOLD to enter #aether room
 */
contract Aether is ERC20, ERC20Burnable, ERC20Permit, Ownable {

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    uint256 public constant TOTAL_SUPPLY     = 1_000_000_000 * 1e18;
    uint256 public constant AIRDROP_SUPPLY   =   500_000_000 * 1e18; // 50%
    uint256 public constant ECOSYSTEM_SUPPLY =   200_000_000 * 1e18; // 20%
    uint256 public constant TEAM_SUPPLY      =   150_000_000 * 1e18; // 15%
    uint256 public constant LIQUIDITY_SUPPLY =   100_000_000 * 1e18; // 10%
    uint256 public constant TREASURY_SUPPLY  =    50_000_000 * 1e18; //  5%

    /// Minimum AETH to hold for token-gated room access
    uint256 public constant GATE_THRESHOLD   =   100 * 1e18;  // 100 AETH

    /// Cost to Recycle a post (burned permanently)
    uint256 public constant RECYCLE_COST     =    10 * 1e18;  // 10 AETH

    // -----------------------------------------------------------------------
    // Airdrop (Merkle)
    // -----------------------------------------------------------------------

    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimed;
    bool public airdropOpen;

    event AirdropClaimed(address indexed claimant, uint256 amount);
    event AirdropRootSet(bytes32 root);
    event AirdropToggled(bool open);

    // -----------------------------------------------------------------------
    // Recycle
    // -----------------------------------------------------------------------

    event Recycled(address indexed sender, string postId, uint256 burned);

    // -----------------------------------------------------------------------
    // Vesting (team)
    // -----------------------------------------------------------------------

    address public teamWallet;
    uint256 public vestingStart;
    uint256 public constant CLIFF       = 180 days;
    uint256 public constant VEST_PERIOD = 730 days; // 2 years
    uint256 public teamReleased;

    event TeamVestingReleased(uint256 amount);

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor(
        address _teamWallet,
        address _liquidityWallet,
        address _treasuryWallet,
        address _ecosystemWallet
    )
        ERC20("Aether", "AETH")
        ERC20Permit("Aether")
        Ownable(msg.sender)
    {
        require(_teamWallet      != address(0), "bad team");
        require(_liquidityWallet != address(0), "bad liquidity");
        require(_treasuryWallet  != address(0), "bad treasury");
        require(_ecosystemWallet != address(0), "bad ecosystem");

        teamWallet   = _teamWallet;
        vestingStart = block.timestamp;

        // Mint non-airdrop allocations immediately
        _mint(_ecosystemWallet, ECOSYSTEM_SUPPLY);
        _mint(_liquidityWallet, LIQUIDITY_SUPPLY);
        _mint(_treasuryWallet,  TREASURY_SUPPLY);
        // Team tokens held in contract until vested
        _mint(address(this),    TEAM_SUPPLY);
        // Airdrop pool held in contract until claimed
        _mint(address(this),    AIRDROP_SUPPLY);
    }

    // -----------------------------------------------------------------------
    // Airdrop
    // -----------------------------------------------------------------------

    /// @notice Owner sets the Merkle root for the airdrop snapshot
    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit AirdropRootSet(_root);
    }

    /// @notice Open or close airdrop claiming
    function setAirdropOpen(bool _open) external onlyOwner {
        airdropOpen = _open;
        emit AirdropToggled(_open);
    }

    /**
     * @notice Claim airdrop tokens.
     * @param amount   Amount of AETH to claim (in wei)
     * @param proof    Merkle proof
     */
    function claimAirdrop(uint256 amount, bytes32[] calldata proof) external {
        require(airdropOpen,              "Airdrop not open");
        require(!hasClaimed[msg.sender],  "Already claimed");
        require(merkleRoot != bytes32(0), "Root not set");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;
        _transfer(address(this), msg.sender, amount);
        emit AirdropClaimed(msg.sender, amount);
    }

    // -----------------------------------------------------------------------
    // Recycle mechanic
    // -----------------------------------------------------------------------

    /**
     * @notice Burn RECYCLE_COST AETH to recycle a post.
     *         The frontend listens for Recycled events and re-surfaces the post.
     * @param postId  Off-chain post ID (from Conduit DB)
     */
    function recycle(string calldata postId) external {
        _burn(msg.sender, RECYCLE_COST);
        emit Recycled(msg.sender, postId, RECYCLE_COST);
    }

    // -----------------------------------------------------------------------
    // Token-gate helper (read-only, used by frontend)
    // -----------------------------------------------------------------------

    /// @notice Returns true if `account` holds enough AETH to enter gated rooms
    function isGated(address account) external view returns (bool) {
        return balanceOf(account) >= GATE_THRESHOLD;
    }

    // -----------------------------------------------------------------------
    // Team vesting
    // -----------------------------------------------------------------------

    /// @notice Release vested team tokens (callable by anyone, sends to teamWallet)
    function releaseTeamVesting() external {
        uint256 elapsed = block.timestamp - vestingStart;
        require(elapsed >= CLIFF, "Cliff not reached");

        uint256 vested = (TEAM_SUPPLY * elapsed) / VEST_PERIOD;
        if (vested > TEAM_SUPPLY) vested = TEAM_SUPPLY;

        uint256 releasable = vested - teamReleased;
        require(releasable > 0, "Nothing to release");

        teamReleased += releasable;
        _transfer(address(this), teamWallet, releasable);
        emit TeamVestingReleased(releasable);
    }

    // -----------------------------------------------------------------------
    // Emergency: rescue unclaimed airdrop after 2 years
    // -----------------------------------------------------------------------

    function rescueAirdropRemainder(address to) external onlyOwner {
        uint256 elapsed = block.timestamp - vestingStart;
        require(elapsed >= 730 days, "Too early");
        uint256 remaining = balanceOf(address(this)) - (TEAM_SUPPLY - teamReleased);
        if (remaining > 0) _transfer(address(this), to, remaining);
    }
}
