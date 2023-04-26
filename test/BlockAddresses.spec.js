require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')

describe('BlockAddresses functionality in expected condition ', async function () {
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let BlockTrading
  let BlockRoomCoin // used as ERC20 token to trade Blocks

  before(async function () {
    // making an signer from the SecondAccount and deployer account as a blocker
    //----------/
    ExampleBlockerSigner = new hre.ethers.Wallet(
      process.env.EOA_SECOND,
      new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/'),
    )
    deployerAsBlockerSigner = new hre.ethers.Wallet(
      process.env.EOA_FIRST,
      new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/'),
    )
    //----------//
    // deploying BlockAddresses
    //-----------//
    const BlockAddressesContractRaw = await hre.ethers.getContractFactory(
      'BlockAddresses',
    )
    BlockAddresses = await BlockAddressesContractRaw.deploy()
    await BlockAddresses.deployed()
    //-----------//
    // deploying Block
    //----------//
    const BlockContractRaw = await hre.ethers.getContractFactory('Block')
    Block = await BlockContractRaw.deploy(BlockAddresses.address)
    await Block.deployed()
    //-----------//
    // deploying BlockFeed
    //-----------//
    const BlockFeedContractRaw = await hre.ethers.getContractFactory(
      'BlockFeed',
    )
    BlockFeed = await BlockFeedContractRaw.deploy(
      process.env.EOA_FIRST_PUBLIC,
      BlockAddresses.address,
    )
    await BlockFeed.deployed()
    //-----------//
    // deploying BlockStorage
    //-----------//
    const BlockStorageContractRaw = await hre.ethers.getContractFactory(
      'BlockStorage',
    )
    BlockStorage = await BlockStorageContractRaw.deploy(BlockAddresses.address)
    await BlockStorage.deployed()
    //-----------//
    // deploying Blockers
    //-----------//
    const BlockersContractRaw = await hre.ethers.getContractFactory('Blockers')
    Blockers = await BlockersContractRaw.deploy(BlockFeed.address)
    await Blockers.deployed()
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
    //----------//
    // deploying BlockTrading
    //----------//
    const BlockRoomCoinContractRaw = await hre.ethers.getContractFactory(
      'BlockRoomCoin',
    )
    BlockRoomCoin = await BlockRoomCoinContractRaw.deploy()
    await BlockRoomCoin.deployed()
    //----------//
  })
  it('should succesfully return the BlockWrapper deployed address \n call to {BlockAddresses}', async function () {
    // confirming that the blockWrapper address is set well
    expect(
      await BlockAddresses.modifierIsBlockWrapper(BlockWrapper.address),
    ).to.eq(true)
  })
  it('should succesfully return the BlockTrading deployed address \n call to {BlockAddresses}', async function () {
    // confirming that the BlockTrading address is set well
    expect(
      await BlockAddresses.modifierIsBlockTrading(BlockTrading.address),
    ).to.eq(true)
  })
  describe('BlockAddresses functionality in unexpected condition', async function () {
    it('should revert if we wanted to redeploy of the BlockWrapper contract \n call to {BlockWrapper, BlockAddresses}', async function () {
      // redeploying BlockWrapper
      //-----------//
      try {
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
      } catch (error) {
        expect(error.reason.includes('already setted !!')).to.eq(true)
      }
      //-----------//
    })
    it('should revert if we wanted to redeploy of the BlockTrading contract \n call to {BlockWrapper, BlockAddresses}', async function () {
      // redeploying BlockTrading
      //-----------//
      try {
        const BlockTradingContractRaw = await hre.ethers.getContractFactory(
          'BlockTrading',
        )
        BlockTrading = await BlockTradingContractRaw.deploy(
          Block.address,
          BlockStorage.address,
          BlockAddresses.address,
        )
        await BlockTrading.deployed()
      } catch (error) {
        expect(error.reason.includes('already setted !!')).to.eq(true)
      }
      //-----------//
    })
  })
})
