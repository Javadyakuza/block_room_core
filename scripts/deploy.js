require('dotenv').config()
const hre = require('hardhat')
async function deploy() {
  // in this testing the deployer and the BlockFeed feeder are only the same accounts
  // rest of the operations like adding the blocker is done with other account
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let BlockTrading
  // let BlockRoomCoin // used as ERC20 token to trade Blocks // deploy for testing puposes
  let ExampleBlockerSigner
  let deployerAsBlockerSigner
  // making an signer from the SecondAccount and deployer account as a blocker
  // these accounts are the hardhat provided first and second account
  //----------/
  ExampleBlockerSigner = new hre.ethers.Wallet(
    process.env.EOA_SECOND,
    new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/'), // replace with your provider
  )
  deployerAsBlockerSigner = new hre.ethers.Wallet(
    process.env.EOA_FIRST,
    new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/'), // replace with your provider
  )
  //----------//
  // deploying BlockAddresses
  //-----------//
  const BlockAddressesContractRaw = await hre.ethers.getContractFactory(
    'BlockAddresses',
  )
  BlockAddresses = await BlockAddressesContractRaw.deploy()
  await BlockAddresses.deployed()
  console.log('BlockAddress deployed to ', BlockAddresses.address)
  //-----------//
  // deploying Block
  //----------//
  const BlockContractRaw = await hre.ethers.getContractFactory('Block')
  Block = await BlockContractRaw.deploy(BlockAddresses.address)
  await Block.deployed()
  console.log('Block deployed to ', Block.address)
  //-----------//
  // deploying BlockFeed
  //-----------//
  const BlockFeedContractRaw = await hre.ethers.getContractFactory('BlockFeed')
  BlockFeed = await BlockFeedContractRaw.deploy(
    process.env.EOA_FIRST_PUBLIC,
    BlockAddresses.address,
  )
  await BlockFeed.deployed()
  console.log('BlockFeed deployed to ', BlockFeed.address)
  //-----------//
  // deploying BlockStorage
  //-----------//
  const BlockStorageContractRaw = await hre.ethers.getContractFactory(
    'BlockStorage',
  )
  BlockStorage = await BlockStorageContractRaw.deploy(BlockAddresses.address)
  await BlockStorage.deployed()
  console.log('BlockStorage deployed to ', BlockStorage.address)
  //-----------//
  // deploying Blockers
  //-----------//
  const BlockersContractRaw = await hre.ethers.getContractFactory('Blockers')
  Blockers = await BlockersContractRaw.deploy(BlockFeed.address)
  await Blockers.deployed()
  console.log('Blockers deployed to ', Blockers.address)

  //-----------//
  // deploying BlockWrapper
  //-----------//
  const BlockWrapperContractRaw = await hre.ethers.getContractFactory(
    'BlockWrapper',
  )
  BlockWrapper = await BlockWrapperContractRaw.deploy(
    Block.address,
    Blockers.address,
    BlockFeed.address,
    BlockStorage.address,
    BlockAddresses.address,
  )
  await BlockWrapper.deployed()
  console.log('BlockWrapper deployed to ', BlockWrapper.address)
  //-----------//
  // deploying BlockTrading
  //----------//
  const BlockTradingContractRaw = await hre.ethers.getContractFactory(
    'BlockTrading',
  )
  BlockTrading = await BlockTradingContractRaw.deploy(
    Block.address,
    BlockStorage.address,
    BlockAddresses.address,
  )
  await BlockTrading.deployed()
  console.log('BlockTrading deployed to ', BlockTrading.address)
  //----------//
  // deploying BlockRoomCoin // deploy for testing puposes
  //----------//
  // const BlockRoomCoinContractRaw = await hre.ethers.getContractFactory(
  //   'BlockRoomCoin',
  // )
  // BlockRoomCoin = await BlockRoomCoinContractRaw.deploy()
  // await BlockRoomCoin.deployed()
  //----------//
}
deploy()
  .then(() => {
    console.log('all contracts delpoyed successfully ✅')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
