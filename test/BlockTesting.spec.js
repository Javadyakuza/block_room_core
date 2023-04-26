require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')
const { zero_address } = require('./helpers/zeroAddress')
describe('BLOCK functionality in normal condition', function () {
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let BlockTrading
  let BlockRoomCoin // used as ERC20 token to trade Blocks
  let nationalId = 1273906497
  let BlockId = 5617925367
  let component = 6
  let ExampleBlocker = process.env.EOA_SECOND_PUBLIC
  let ExampleBlockerSigner
  let deployerAsBlocker = process.env.EOA_FIRST_PUBLIC
  let deployerAsBlockerSigner
  let optionalData = hre.ethers.BigNumber.from('0')
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

  it('should mint N amount and return the N amount as balance \n call to {Block}', async function () {
    // minting a block
    await Block.mintBlock(ExampleBlocker, BlockId, component, optionalData)
    // confirming that the block is added and known by the balanceof function for the ExampleBlokcer
    expect(await Block.callStatic.balanceOf(ExampleBlocker, BlockId)).to.eq(
      component,
    )
  })
  it('should transfer N amount onhalf of the be ExampleBlocker to deployerAsBlocker and sync the balances \n call to {Block}', async function () {
    // approving the deployer address to take care of the transfering the block
    await Block.connect(ExampleBlockerSigner).setApprovalForAll(
      deployerAsBlocker,
      true,
    )

    // confirming that the deployer address is approved by the block owner to transfer the Block
    expect(
      await Block.callStatic.isApprovedForAll(
        ExampleBlocker,
        deployerAsBlocker,
      ),
    ).to.eq(true)

    // transfering the block with whole components to another blocker
    await Block.safeTransferFrom(
      ExampleBlocker,
      deployerAsBlocker,
      BlockId,
      component,
      optionalData,
    )

    // confirming that the receiver blocker has received the block
    expect(await Block.callStatic.balanceOf(deployerAsBlocker, BlockId)).to.eq(
      component,
    )

    // confirming that the ownership of the block is removed form the sender blocker
    expect(await Block.callStatic.balanceOf(ExampleBlocker, BlockId)).to.eq(0)
  })
  it('should trnasfer back half of amount and sync the balances \n call to {Block}', async function () {
    // transfering 3 blocks to the ExampleBlocker
    await Block.safeTransferFrom(
      deployerAsBlocker,
      ExampleBlocker,
      BlockId,
      3,
      optionalData,
    )
    // confirming that the receiver blocker has received 3 blocks
    expect(await Block.callStatic.balanceOf(ExampleBlocker, BlockId)).to.eq(3)
    // confirming that 3 blocks has been removed from the sender Blocker
    expect(await Block.callStatic.balanceOf(deployerAsBlocker, BlockId)).to.eq(
      3,
    )
  })
  describe('BLOCK functionality in abnormal condition', async function () {
    it('should revert in case of minting block with more than 6 components \n call to {Block}', async function () {
      try {
        // minting block with more thatn 6 components
        await Block.mintBlock(ExampleBlocker, BlockId, 7, optionalData)
      } catch (error) {
        // confirming that we get the expected error
        expect(error.reason.includes('component overflow !!')).to.eq(true)
      }
    })
    it('should revert in case of minting block with zero BlockId \n call to {Block}', async function () {
      try {
        // minting block with zero BlockId
        await Block.mintBlock(ExampleBlocker, 0, 6, optionalData)
      } catch (error) {
        // confirming that we get the expected error
        expect(error.reason.includes('blockId can not be zero !!')).to.eq(true)
      }
    })
    it('should revert in case of setApprovalforAll to zero-address \n call to {Block}', async function () {
      try {
        // set approval for addess zero
        await Block.setApprovalForAll(hre.ethers.constants.AddressZero, true)
      } catch (error) {
        // confirming that we get the expected error
        expect(error.reason.includes('zero address exception !!')).to.eq(true)
      }
    })
  })
})
