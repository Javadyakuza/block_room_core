# BlockRoom

Welcome to BlockRoom, a decentralized platform on top of the Binance Smart Chain for trading and verifying the ownership of houses in a secure and fast manner through ERC-1155 NFTs.

## Overview

BlockRoom is a decentralized platform that allows users (called "Blockers") to securely trade houses through the use of ERC-1155 NFTs. Before registering on the platform, users must first authenticate their existence. Once verified, they will be able to register and become a Blocker. The ownership of the houses will be verified by an oracle to ensure authenticity.

This project was built using Hardhat, a development environment to compile, test, and deploy smart contracts. The solidity code has been tested with Solhint, Slither, and Mythril which all completed successfully.

## Getting Started

Before you begin, please ensure that you have the following prerequisites installed:

- Node.js
- Git

### Installation

1. Clone the repository: `git clone https://github.com/yourusername/blockroom.git`
2. Navigate to the root directory of the project
3. Install the dependencies: `npm install`

### Usage

1. Compile the Solidity contracts: `npx hardhat compile`
2. Run tests: `npx hardhat test` " developer suggestion: audit them first 😜"
3. Deploy to a local blockchain: `npx hardhat node` then `npx hardhat run scripts/deploy.js --network localhost`

### Security

The solidity code has been tested using Solhint, Slither, and Mythril to ensure security and correctness.
Solhint has been used for linting the Solidity code.
Slither has been used to detect potential security issues.
Mythril has been used for symbolic execution to detect vulnerabilities.

## Roadmap

Here are some possible features for future updates:

- Addition of a web interface to make it easier for users to interact with the platform
- Integration with additional blockchains
- Integration with other decentralized finance (DeFi) platforms

## Contributors

ME

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
