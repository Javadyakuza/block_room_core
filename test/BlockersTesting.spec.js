require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')
describe('Blockers functionality in noraml condition', async () => {
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let BlockTrading
  let BlockRoomCoin // used as ERC20 token to trade Blocks
  let nationalId = 1273906497
  let unVerifiedNationalId = 5254545878
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
    // deploying BlockTrading
    //----------//
    const BlockRoomCoinContractRaw = await hre.ethers.getContractFactory(
      'BlockRoomCoin',
    )
    BlockRoomCoin = await BlockRoomCoinContractRaw.deploy()
    await BlockRoomCoin.deployed()
    //----------//
  })
  it('should succesfully set the ethereum address for a national id in the BlockFeed \n call to {BlockFeed}', async function () {
    // adding the blockernationalId and its ETH_address to the blockFeed
    await BlockFeed.setBlockerAddress(nationalId, ExampleBlocker)
    // confirming that the Blocker is set well ins the BLockFeed contract
    expect(await BlockFeed.callStatic.getBlockerAddress(nationalId)).to.equal(
      ExampleBlocker,
    )
  })
  it('should succesfully add a blocker ethereum addresss and returns the associated nationalId and true if blocker \n call to {Blockers}', async function () {
    // adding the blocekr to the Blockers contract
    await Blockers.connect(ExampleBlockerSigner).addBlocker(nationalId)
    // confirming that the Blockeris added to the Blockers contract
    expect(await Blockers.callStatic._nationalIdOf(ExampleBlocker)).to.equal(
      nationalId,
    )
    // confirming that the blocker is known as a Blocekr "XD" in BlockRoom
    expect(await Blockers.callStatic._isBlocker(ExampleBlocker)).to.equal(true)
  })
  describe('Blockers functionality in abnoraml condition', async function () {
    it('should revert if we wanted to add a unverified nationalId \n call to {Blockers }', async function () {
      // adding a blocker that is not vevrifierd from the BolockFeed contract
      try {
        await Blockers.connect(deployerAsBlockerSigner).addBlocker(
          unVerifiedNationalId,
        )
      } catch (error) {
        expect(String(error).includes('user not athenticated !!')).to.eq(true)
      }
    })
    it('should revert if we wanted to add a addresse that is already a Blocker \n call to {Blockers }', async function () {
      // adding a blocker that is already a blocker with a nationalId
      try {
        await Blockers.connect(ExampleBlockerSigner).addBlocker(
          unVerifiedNationalId,
        )
      } catch (error) {
        expect(String(error).includes('address is already a Blocker !!')).to.eq(
          true,
        )
      }
    })
    it('should revert if we wanted to add a existing nationalId with another address \n call to {Blockers }', async function () {
      // adding the blockernationalId and its ETH_address to the blockFeed
      await BlockFeed.setBlockerAddress(unVerifiedNationalId, deployerAsBlocker)
      // confirming that the Blocker is set well ins the BLockFeed contract
      expect(
        await BlockFeed.callStatic.getBlockerAddress(unVerifiedNationalId),
      ).to.equal(deployerAsBlocker)
      // adding a nationalId with a address that already exist with another address
      try {
        await Blockers.connect(deployerAsBlockerSigner).addBlocker(nationalId)
      } catch (error) {
        expect(String(error).includes('user not athenticated !!')).to.eq(true)
      }
    })
  })
})
