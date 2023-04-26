require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')

describe('BlockWrapper functionality in normal condition', async function () {
  // in this testing the deployer and the BlockFeed feeder are only the same accounts
  // rest of the operations like adding the blocker is done with other account
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let nationalId = 1273906497
  let BlockId = 5617925367
  let component = 6
  let ExampleBlocker = process.env.EOA_SECOND_PUBLIC
  let ExampleBlockerSigner
  let deployerAsBlocker = process.env.EOA_FIRST_PUBLIC
  let deployerAsBlockerSigner
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
    // deploying BlockRoomCoinn
    //----------//
    const BlockRoomCoinContractRaw = await hre.ethers.getContractFactory(
      'BlockRoomCoin',
    )
    BlockRoomCoin = await BlockRoomCoinContractRaw.deploy()
    await BlockRoomCoin.deployed()
    const BlockRoomCoin2ContractRaw = await hre.ethers.getContractFactory(
      'BlockRoomCoin',
    )
    BlockRoomCoin2 = await BlockRoomCoin2ContractRaw.deploy()
    await BlockRoomCoin2.deployed()
    //----------//
  })

  it('should successfuly add a blokcer to the BlockRoom \n call to {BlockFeed, Blockers}', async function () {
    // add the nationalId to the feed
    await BlockFeed.setBlockerAddress(nationalId, ExampleBlocker)
    // confirming that the blocker is added to the BlockFeed smart contract
    expect(await BlockFeed.callStatic.getBlockerAddress(nationalId)).to.eq(
      ExampleBlocker,
    )
    // adding the blocker to the Blockers contract from the its own account
    await Blockers.connect(ExampleBlockerSigner).addBlocker(nationalId)
    // confirming that the blocker is added to the blockers contract
    expect(await Blockers.callStatic._isBlocker(ExampleBlocker)).to.eq(true)
  })
  it('should successfuly add a block for the blocker in BlockFeed \n call to {BlockFeed}', async function () {
    // adding a block to the blockFeed
    await BlockFeed.setBlockOf([
      { blockId: BlockId, nationalId: nationalId, component: component },
    ])
    // confirming that blockId is added to the blockFeed
    expect(
      await BlockFeed.callStatic.getBlockOf(BlockId, nationalId, component),
    ).to.eq(true)
  })
  // it('should successfuly wrapp a block and add it to the platform and return revelant block owner \n call to {BlockWrapper, BlockStorage}', async function () {
  //   // wrapping the the block from its own account
  //   await BlockWrapper.connect(ExampleBlockerSigner).blockWrapper(
  //     BlockId,
  //     component,
  //   )
  //   // confirming that the block is wrapped succesfully from BlockStorage contract
  //   expect(
  //     await BlockStorage.callStatic.getBlockOwner(BlockId, ExampleBlocker),
  //   ).to.eq(component)
  // })
  // it('should succesfully return revelant blockers blocks \n call to {BlockStorage}', async function () {
  //   // confirming that the block is added to the BlockersBlocks
  //   const tempArray = await BlockStorage.callStatic.getBlockersBlocks(
  //     ExampleBlocker,
  //   )
  //   const returnedObject = {
  //     BlockId: tempArray[0].blockId.toString(),
  //     component: tempArray[0].component,
  //   }
  //   const expectedObject = {
  //     BlockId: BlockId.toString(),
  //     component: component,
  //   }
  //   expect(returnedObject.toString()).to.eq(expectedObject.toString())
  // })
  describe('BlockWrapper functionality in abnormal condition', async function () {
    /// @NOTICE @DEV in oreder to run noraml functionality comment this describe and uncomment the commented last describe it and videversa
    it('should revert if we wanted wrap a block with a nonBlocker or nonOwner address \n call to {BlockWrapper, BlockStorage}', async function () {
      try {
        // wrapping the the block from its own account
        await BlockWrapper.connect(deployerAsBlockerSigner).blockWrapper(
          BlockId,
          component,
        )
      } catch (error) {
        expect(error.error.reason.includes('user must be blocker !!')).to.eq(
          true,
        )
      }
      // making the nonBlocker address to a blocker
      // add the nationalId to the feed
      await BlockFeed.setBlockerAddress(1451451451, deployerAsBlocker)
      // confirming that the blocker is added to the BlockFeed smart contract
      expect(await BlockFeed.callStatic.getBlockerAddress(1451451451)).to.eq(
        deployerAsBlocker,
      )
      // adding the blocker to the Blockers contract from the its own account
      await Blockers.connect(deployerAsBlockerSigner).addBlocker(1451451451)
      // confirming that the blocker is added to the blockers contract
      expect(await Blockers.callStatic._isBlocker(deployerAsBlocker)).to.eq(
        true,
      )
      // retrying while we dont own the house
      try {
        // wrapping the the block from its own account
        await BlockWrapper.connect(deployerAsBlockerSigner).blockWrapper(
          BlockId,
          component,
        )
      } catch (error) {
        expect(
          error.error.reason.includes('only Block owner can wrap it !!'),
        ).to.eq(true)
      }
    })
  })
})
