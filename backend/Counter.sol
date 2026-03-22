// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Counter — VoidWallet educational demo contract
/// @notice Deployed on Ethereum Sepolia testnet.
///         Anyone can increment. Only the deployer can reset.
contract Counter {
    uint256 public count;
    address public owner;

    event Incremented(address indexed by, uint256 newCount);
    event Reset(address indexed by);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Increment the counter by 1
    function increment() public {
        count += 1;
        emit Incremented(msg.sender, count);
    }

    /// @notice Reset the counter to 0 (owner only)
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
        emit Reset(msg.sender);
    }

    /// @notice Read the current count (same as the public `count` variable)
    function getCount() public view returns (uint256) {
        return count;
    }
}
