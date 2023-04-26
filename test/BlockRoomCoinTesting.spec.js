require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')
const { zero_address } = require('./helpers/zeroAddress')
describe('BLOCKROOMCOIN functionality in normal condition', function () {
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
  let BRCAmount = hre.ethers.utils.parseEther('1')
  let BRCAmountHalf = hre.ethers.utils.parseEther('0.5')
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

  it('should mint N amount and return the N amount as balance \n call to {BlockRoomCoin}', async function () {
    // minting a block
    await BlockRoomCoin.mint(ExampleBlocker, BRCAmount)
    // confirming that the block is added and known by the balanceof function for the ExampleBlokcer
    expect(await BlockRoomCoin.callStatic.balanceOf(ExampleBlocker)).to.eq(
      BRCAmount,
    )
  })
  it('should transfer N amount onhalf of the be ExampleBlocker to deployerAsBlocker and sync the balances \n call to {BlockRoomCoin}', async function () {
    // approving the deployer address to take care of spending the BRC
    await BlockRoomCoin.connect(ExampleBlockerSigner).approve(
      deployerAsBlocker,
      BRCAmountHalf,
    )

    // confirming that the deployer address is approved by the block owner to transfer the BRC
    expect(
      await BlockRoomCoin.callStatic.allowance(
        ExampleBlocker,
        deployerAsBlocker,
      ),
    ).to.eq(BRCAmountHalf)
    // transfering the block with amount to another blocker
    await BlockRoomCoin.transferFrom(
      ExampleBlocker,
      deployerAsBlocker,
      BRCAmountHalf,
    )

    // confirming that the receiver blocker has received the amount
    expect(await BlockRoomCoin.callStatic.balanceOf(deployerAsBlocker)).to.eq(
      BRCAmountHalf,
    )

    // confirming that the sender blocker balance is reduced
    expect(await BlockRoomCoin.callStatic.balanceOf(ExampleBlocker)).to.eq(
      BRCAmountHalf,
    )
  })
})
