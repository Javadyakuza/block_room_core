const { expect } = require('chai')
const hre = require('hardhat')
const {
  correctBlockOfParams,
  correctBlockOfParamsCompelter,
  correctBlockOfParamsReducer,
  wrongNationalIdBlockOfParams,
  wrongComponentBlockOfParams,
  wrongComponent2BlockOfParams,
  wrongBlockIdBlockOfParams,
} = require('./helpers/BlockBatches.js')
const {
  findTheIndex,
} = require('./helpers/BlockFeedWrongBlockBatchIndexFinder.js')
describe('BlockFeed functionality in noraml condition', async function () {
  // in this testing the deployer and the BlockFeed feeder are only the same accounts
  // rest of the operations like adding the blocker is done with other account
  /// @NOTICE @dev see the {./notes/BlockFeedErrorCodes.md}
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

  it('the returned addresses must be equal to initialed addresses \n call to {BlockFeed}', async function () {
    // confirming that the feeder is setted as intialed
    expect(await BlockFeed.callStatic.feeder()).to.equal(deployerAsBlocker) // deployer is the feeder
  })
  it('should succesfully set and return the ethereum address for a national id \n call to {BlockFeed}', async function () {
    // adding the blocker to the BlockFeed contract with nationalId and a address
    await BlockFeed.setBlockerAddress(nationalId, ExampleBlocker)
    // confirming that the Blocker is succesfully added to the BlockFeed
    expect(await BlockFeed.callStatic.getBlockerAddress(nationalId)).to.equal(
      ExampleBlocker,
    )
  })
  it('should succesfully setBlockOf array of structs and return the correct test query \n call to {BlockFeed}', async function () {
    // adding a blockId for a blocker in the blockFeed
    await BlockFeed.setBlockOf(correctBlockOfParams)
    // confirming that the block inforamation is added succesfully to tha BlockFeed
    expect(
      await BlockFeed.callStatic.getBlockOf(BlockId, nationalId, component),
    ).to.equal(true)
  })
  it('should succesfully add components to the setBlockOf array of structs unwrapped items \n call to {BlockFeed}', async function () {
    //checking that the components are not complete
    expect(
      await BlockFeed.callStatic.getBlockOf(10987654321, 1451451451, 5),
    ).to.equal(true)
    // adding a blockId for a blocker in the blockFeed with compelter components
    await BlockFeed.setBlockOf([correctBlockOfParamsCompelter[1]])
    // confirming that the block inforamation is added succesfully to tha BlockFeed
    expect(
      await BlockFeed.callStatic.getBlockOf(10987654321, 1451451451, 6),
    ).to.equal(true)
  })
  it('should succesfully wrap a block, add components, rewrap the block and sync the balance \n call to {BlockFeed}', async function () {
    // nationalId = 8548548548, BlockId = 12345678910, statringComp = 1 + 1 from last it, addingComp = 4
    // adding a new user to the BlockFeed
    await BlockFeed.setBlockerAddress(8548548548, deployerAsBlocker)
    // confirming
    expect(await BlockFeed.getBlockerAddress(8548548548)).to.eq(
      deployerAsBlocker,
    )
    // adding the blocker to the blockerscontract
    await Blockers.connect(deployerAsBlockerSigner).addBlocker(8548548548)
    // confirming the the Blopcker is addded
    expect(await Blockers._isBlocker(deployerAsBlocker)).to.eq(true)
    // wrapping a block
    await BlockWrapper.connect(deployerAsBlockerSigner).blockWrapper(
      12345678910,
      4,
    )
    // confirming that the Block is wrapped
    expect(
      await BlockStorage.getBlockOwner(12345678910, deployerAsBlocker),
    ).to.eq(4)
    // adding a blockId for a blocker in the blockFeed with compelter components
    await BlockFeed.setBlockOf([correctBlockOfParamsCompelter[0]])

    // confirming that the block inforamation is added succesfully to tha BlockFeed
    expect(
      await BlockFeed.callStatic.getBlockOf(12345678910, 8548548548, 2),
    ).to.equal(true)
    // trying to wrap newly added components
    // wrapping a block
    await BlockWrapper.connect(deployerAsBlockerSigner).blockWrapper(
      12345678910,
      2,
    )
    // confirming that the Block is wrapped
    expect(
      await BlockStorage.callStatic.getBlockOwner(
        12345678910,
        deployerAsBlocker,
      ),
    ).to.eq(6)
  })
  it('should succesfully reduce the the components of a unverified block \n call to {BlockFeed}', async function () {
    //checking that the components are compelte
    expect(
      await BlockFeed.callStatic.getBlockOf(5617925367, 1273906497, 6),
    ).to.equal(true)
    // reduce 3 comonents of the user
    await BlockFeed.setBlockOf([correctBlockOfParamsReducer[2]])
    // confirming that the block components are reduced to 3
    expect(
      await BlockFeed.callStatic.getBlockOf(5617925367, 1273906497, 3),
    ).to.equal(true)
    // reduce 3 more comonents of the user, trying with zero this time
    await BlockFeed.setBlockOf([
      {
        blockId: 5617925367,
        nationalId: 1273906497,
        component: 0,
        reducedOutside: true,
      },
    ])
    // confirming that the block components are reduced to 0
    expect(
      await BlockFeed.callStatic.getBlockOf(5617925367, 1273906497, 0),
    ).to.equal(true)
    // readding it for the rest of the test
    await BlockFeed.setBlockOf([correctBlockOfParams[2]])
    // confirming that the block inforamation is added succesfully to tha BlockFeed
    expect(
      await BlockFeed.callStatic.getBlockOf(BlockId, nationalId, component),
    ).to.equal(true)
  })
  it('should return changed feeder ethereum address \n call to {BlockFeed}', async function () {
    const newfeeder = ExampleBlocker
    // confirming that the new feeder is not the current blockFeed feeder
    expect(await BlockFeed.callStatic.feeder()).to.not.equal(newfeeder)
    // chaning the blockFeed feeder
    await BlockFeed.changeFeeder(newfeeder)
    // confirming that blockFeed feeder is changed succesfully
    expect(await BlockFeed.callStatic.feeder()).to.equal(newfeeder)
  })
  describe('BlockFeed functionality in abnormal functionality', async function () {
    /// @NOTICE >> until here we have added a address and aa nationaId as a blocker and a block for that blocker and we changed the feeder
    it('shuold change the feeder to the old one \n call to {BlockFeed}', async function () {
      // changing the feeder back to the old feeder
      await BlockFeed.changeFeeder(deployerAsBlocker)
      // confirming that blockFeed feeder is changed succesfully
      expect(await BlockFeed.callStatic.feeder()).to.equal(deployerAsBlocker)
    })
    it('shuold revert when sending a blockBatch with existing full-component unwrapped Block \n call to {BlockFeed}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      try {
        // setting the BlockBatch with existing params
        await BlockFeed.setBlockOf([correctBlockOfParams[2]])
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason)) // 0 due to our array contains one item
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 02 >> index'),
        ).to.eq(true)
      }
    })
    it('shuold revert when sending a blockBatch with existing full-component wrapped Block \n call to {BlockFeed, Blockers, BlockWrapper, BlockStorage}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      // blcoker is added to BlockFeed already with "nationalId" and the "components"
      // addin the blocker into the blockers contract
      await Blockers.connect(ExampleBlockerSigner).addBlocker(nationalId)
      // confirming that the blocker is added succesfully to he blocker contract(
      expect(await Blockers._isBlocker(ExampleBlocker)).to.eq(true)
      // wrapping the the block from its own account
      await BlockWrapper.connect(ExampleBlockerSigner).blockWrapper(
        BlockId,
        component,
      )
      // confirming that the block is wrapped succesfully from BlockStorage contract
      expect(
        await BlockStorage.callStatic.getBlockOwner(BlockId, ExampleBlocker),
      ).to.eq(component)

      try {
        // setting the BlockBatch with existing blockId and full components
        await BlockFeed.setBlockOf([correctBlockOfParams[2]])
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason))
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 02 >> index'),
        ).to.eq(true)
      }
    })
    it('shuold revert when sending a blockBatch with zero nationalId \n call to {BlockFeed}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      try {
        // setting the BlockBatch with wrong nationalId(zero)
        await BlockFeed.setBlockOf(wrongNationalIdBlockOfParams)
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason))
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 01 >> index'),
        ).to.eq(true)
      }
    })
    it('shuold revert when sending a blockBatch with zero components\n call to {BlockFeed}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      try {
        // setting the BlockBatch with wrong component(zero)
        await BlockFeed.setBlockOf(wrongComponentBlockOfParams)
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason))
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 01 >> index'),
        ).to.eq(true)
      }
    })
    it('shuold revert when sending a blockBatch with component more than 6\n call to {BlockFeed}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      try {
        // setting the BlockBatch with wrong component(more than 6)
        await BlockFeed.setBlockOf(wrongComponent2BlockOfParams)
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason))
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 02 >> index'),
        ).to.eq(true)
      }
    })
    it('shuold revert when sending a blockBatch with zero BlockId\n call to {BlockFeed}', async function () {
      /// @NOTICE blockBatches are sent as an array containing three items or "objects" or in other hands ""structs""
      try {
        // setting the BlockBatch with wrong blockId(zero)
        await BlockFeed.setBlockOf(wrongBlockIdBlockOfParams)
      } catch (error) {
        console.log('wrong index', findTheIndex(error.reason))
        // confirming to get the expected error code
        expect(
          error.reason.includes('wrong blockBatch Error: 01 >> index'),
        ).to.eq(true)
      }
    })
  })
})
