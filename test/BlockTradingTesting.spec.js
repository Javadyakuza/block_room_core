require('dotenv').config()
const { expect } = require('chai')
const hre = require('hardhat')

describe('BlockTrading functionality in normal condition', async function () {
  // in this testing the deployer and the BlockFeed feeder are only the same accounts
  // rest of the operations like adding the blocker is done with other account
  let Block
  let BlockAddresses
  let BlockFeed
  let BlockStorage
  let Blockers
  let BlockWrapper
  let BlockTrading
  let BlockRoomCoin // used as ERC20 token to trade Blocks
  let BlockRoomCoin2 // used to test the token supportation
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
  it('should successfuly wrapp a block and add it to the platform and return revelant block owner \n call to {BlockWrapper, BlockStorage}', async function () {
    // wrapping the the block from its own account
    await BlockWrapper.connect(ExampleBlockerSigner).blockWrapper(
      BlockId,
      component,
    )
    // confirming that the block is wrapped succesfully from BlockStorage contract
    expect(
      await BlockStorage.callStatic.getBlockOwner(BlockId, ExampleBlocker),
    ).to.eq(component)
  })
  it('should succesfully return revelant blockers blocks \n call to {BlockStorage}', async function () {
    // confirming that the block is added to the BlockersBlocks
    const tempArray = await BlockStorage.callStatic.getBlockersBlocks(
      ExampleBlocker,
    )
    const returnedObject = {
      BlockId: tempArray[0].blockId.toString(),
      component: tempArray[0].component,
    }
    const expectedObject = {
      BlockId: BlockId.toString(),
      component: component,
    }
    expect(returnedObject.toString()).to.eq(expectedObject.toString())
  })
  it('should succesfully transfer a block  from a blocker to another blocker \n call to {BlockTrading, Block, BlockRoomCoin, BlockStorage}', async function () {
    // adding the BlockRoomCoin as a payment token in BlockTrading contract
    await BlockTrading.setPaymentTokens(BlockRoomCoin.address)
    // confirming that the coin has been added to BlockTrading contract
    expect(
      await BlockTrading.callStatic.paymnetTokens(BlockRoomCoin.address),
    ).to.eq(true)

    // approveinig the BlockTrading Contract to trasnfer te block on behalf of the Blocker
    await Block.connect(ExampleBlockerSigner).setApprovalForAll(
      BlockTrading.address,
      true,
    )
    // confirming that the BlockTrading is approved for transfering the Block on behalf of the Blocker
    expect(
      await Block.isApprovedForAll(ExampleBlocker, BlockTrading.address),
    ).to.eq(true)

    // open sales for a block and price it from the owner of the block
    await BlockTrading.connect(ExampleBlockerSigner).openSalesAndPriceTheBlock(
      BlockId,
      component,
      hre.ethers.utils.parseEther('1'),
      BlockRoomCoin.address,
    )

    // confirming that the block is setted well for sale
    const tempSaleStruct = await BlockTrading.getBlocksForSale(
      BlockId,
      ExampleBlocker,
    )
    expect(tempSaleStruct.saleStatus).to.eq(true)
    expect(tempSaleStruct.acceptingToken).to.eq(BlockRoomCoin.address)

    // --buying the Block--//
    // minting some BlockRoomCoin for the blocker
    await BlockRoomCoin.mint(
      deployerAsBlocker,
      hre.ethers.utils.parseEther('10'),
    )
    // confirming the balance of the BlockRoomCoin of the Blocker
    expect(await BlockRoomCoin.callStatic.balanceOf(deployerAsBlocker)).to.eq(
      hre.ethers.utils.parseEther('10'),
    ),
      // approving the BlockTrading for Block Spending from the Blocker account
      await BlockRoomCoin.connect(deployerAsBlockerSigner).approve(
        BlockTrading.address,
        hre.ethers.utils.parseEther('1'),
      )
    // confirming the BlockTrading contract has the sufficient allowance
    expect(
      await BlockRoomCoin.allowance(deployerAsBlocker, BlockTrading.address),
    ).to.eq(hre.ethers.utils.parseEther('1'))
    //buying the block
    await BlockTrading.connect(deployerAsBlockerSigner).buyBlock(
      BlockId,
      ExampleBlocker,
      BlockRoomCoin.address,
    )
    // confirming that the buyerBlocker has received the Block
    expect(await BlockStorage.getBlockOwner(BlockId, deployerAsBlocker)).to.eq(
      component,
    )
    // confirming that the sellerBlocker has receive his money (BlockRoomCoin)
    expect(await BlockRoomCoin.callStatic.balanceOf(ExampleBlocker)).to.eq(
      hre.ethers.utils.parseEther('0.99'),
    )
    // confirming block has been added to the buyerBlocker blockersBlocks
    const BlockerBlockS = await BlockStorage.callStatic.getBlockersBlocks(
      deployerAsBlocker,
    )
    const returnedObject = {
      BlockId: BlockerBlockS[0].blockId.toString(),
      component: BlockerBlockS[0].component,
    }
    const expectedObject = {
      BlockId: BlockId.toString(),
      component: component,
    }
    expect(returnedObject.toString()).to.eq(expectedObject.toString())
    // confirming that the sales are closed for that blockId

    expect(
      await BlockTrading.callStatic
        .getBlocksForSale(BlockId, deployerAsBlocker)
        .then((res) => {
          return res.saleStatus
        }),
    ).to.eq(false)
  })
  // describe('BlockTrading functionality in abnormal condition', async function () {
  //   /// @NOTICE @dev for noraml functinality uncomment the above it and comment this describe and videversa
  //   it('shoud revert if we wanted to openAndPriceABlock when the BlockTrading contract is not approved for the Block', async function () {
  //     // adding the BlockRoomCoin as a payment token in BlockTrading contract
  //     await BlockTrading.setPaymentTokens(BlockRoomCoin.address)

  //     // confirming that the coin has been added to BlockTrading contract
  //     expect(
  //       await BlockTrading.callStatic.paymnetTokens(BlockRoomCoin.address),
  //     ).to.eq(true)

  //     try {
  //       // sending the tx with the price with the BlockTrdinf not approved
  //       await BlockTrading.connect(
  //         ExampleBlockerSigner,
  //       ).openSalesAndPriceTheBlock(
  //         BlockId,
  //         component,
  //         hre.ethers.utils.parseEther('1'),
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       // confirming that we get the expected error
  //       expect(
  //         error.error.reason.includes('BlockTrading contract not approved !!'),
  //       ).to.eq(true)
  //       // confirming that the Blocksalesis not true(opened) and is reerted succesfully
  //       expect(
  //         await BlockTrading.getBlocksForSale(BlockId, ExampleBlocker).then(
  //           (res) => {
  //             return res.saleStatus
  //           },
  //         ),
  //       ).to.eq(false)
  //     }
  //   })
  //   it('shoud revert if we wanted to openAndPriceABlock with a under `1` price', async function () {
  //     // payment token must be added already

  //     // confirming that the coin has been added to BlockTrading contract
  //     expect(
  //       await BlockTrading.callStatic.paymnetTokens(BlockRoomCoin.address),
  //     ).to.eq(true)

  //     // approveinig the BlockTrading Contract to trasnfer te block on behalf of the Blocker
  //     await Block.connect(ExampleBlockerSigner).setApprovalForAll(
  //       BlockTrading.address,
  //       true,
  //     )
  //     // confirming that the BlockTrading is approved for transfering the Block on behalf of the Blocker
  //     expect(
  //       await Block.isApprovedForAll(ExampleBlocker, BlockTrading.address),
  //     ).to.eq(true)
  //     try {
  //       // sending the tx with the price that is under 1
  //       await BlockTrading.connect(
  //         ExampleBlockerSigner,
  //       ).openSalesAndPriceTheBlock(
  //         BlockId,
  //         component,
  //         hre.ethers.utils.parseEther('0.9'),
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       // confirming that we get the expected error
  //       expect(
  //         error.error.reason.includes('price must be more than 1 unit'),
  //       ).to.eq(true)
  //       // confirming that the Blocksalesis not true(opened) and is reerted succesfully
  //       expect(
  //         await BlockTrading.getBlocksForSale(BlockId, ExampleBlocker).then(
  //           (res) => {
  //             return res.saleStatus
  //           },
  //         ),
  //       ).to.eq(false)
  //     }
  //   })
  //   it('shoud revert if we wanted to openAndPriceABlock with existing sale condition', async function () {
  //     // payment token must be added till now
  //     // confirming that the coin has been added to BlockTrading contract
  //     expect(
  //       await BlockTrading.callStatic.paymnetTokens(BlockRoomCoin.address),
  //     ).to.eq(true)

  //     // has been approved in last test
  //     // confirming that the BlockTrading is approved for transfering the Block on behalf of the Blocker
  //     expect(
  //       await Block.isApprovedForAll(ExampleBlocker, BlockTrading.address),
  //     ).to.eq(true)
  //     // sending the tx to open a sale for a block
  //     await BlockTrading.connect(
  //       ExampleBlockerSigner,
  //     ).openSalesAndPriceTheBlock(
  //       BlockId,
  //       component,
  //       hre.ethers.utils.parseEther('1'),
  //       BlockRoomCoin.address,
  //     )
  //     // confirming that the block is setted well for sale
  //     const tempSaleStruct = await BlockTrading.getBlocksForSale(
  //       BlockId,
  //       ExampleBlocker,
  //     )
  //     expect(tempSaleStruct.saleStatus).to.eq(true)
  //     expect(tempSaleStruct.acceptingToken).to.eq(BlockRoomCoin.address)
  //     // want to change the blockSales args with the same data as existing data
  //     try {
  //       await BlockTrading.connect(
  //         ExampleBlockerSigner,
  //       ).openSalesAndPriceTheBlock(
  //         BlockId,
  //         component,
  //         hre.ethers.utils.parseEther('1'),
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       expect(error.error.reason.includes('condition already exists')).to.eq(
  //         true,
  //       )
  //     }
  //   })
  //   it('shoud revert if we wanted to closeBlockSales or buyBlock for a BlockId that is already closed for sale ', async function () {
  //     // sending the tx with the price that is under 1
  //     await BlockTrading.connect(ExampleBlockerSigner).closeBlockSales(
  //       ExampleBlocker,
  //       BlockId,
  //       component,
  //     )
  //     // confirming that blocksales are closeBlockSalesd for the blockId
  //     expect(
  //       await BlockTrading.getBlocksForSale(BlockId, ExampleBlocker).then(
  //         (res) => {
  //           return res.saleStatus
  //         },
  //       ),
  //     ).to.eq(false)
  //     // want to change the blockSales args with the same data as existing data
  //     try {
  //       await BlockTrading.connect(ExampleBlockerSigner).closeBlockSales(
  //         ExampleBlocker,
  //         BlockId,
  //         component,
  //       )
  //     } catch (error) {
  //       expect(
  //         error.error.reason.includes('block sales closed already !!'),
  //       ).to.eq(true)
  //     }
  //     // trying to buy a block with when we are not approved
  //     try {
  //       await BlockTrading.buyBlock(
  //         BlockId,
  //         ExampleBlocker,
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       expect(
  //         error.reason.includes('block sales are closed for this blockId !!'),
  //       ).to.eq(true)
  //     }
  //   })
  //   it('shoud revert if we wanted to buyBlock when the BlockTrading contract is not approved for spending BRC', async function () {
  //     // paymnet toke added already

  //     // confirming that the coin has been added to BlockTrading contract
  //     expect(
  //       await BlockTrading.callStatic.paymnetTokens(BlockRoomCoin.address),
  //     ).to.eq(true)

  //     // approveinig the BlockTrading Contract to trasnfer te block on behalf of the Blocker
  //     await Block.connect(ExampleBlockerSigner).setApprovalForAll(
  //       BlockTrading.address,
  //       true,
  //     )
  //     // confirming that the BlockTrading is approved for transfering the Block on behalf of the Blocker
  //     expect(
  //       await Block.isApprovedForAll(ExampleBlocker, BlockTrading.address),
  //     ).to.eq(true)
  //     // reopeneing the blockSales
  //     await BlockTrading.connect(
  //       ExampleBlockerSigner,
  //     ).openSalesAndPriceTheBlock(
  //       BlockId,
  //       component,
  //       hre.ethers.utils.parseEther('1'),
  //       BlockRoomCoin.address,
  //     )
  //     // confirming that the block is setted well for sale(setted in the last tests)
  //     const tempSaleStruct = await BlockTrading.getBlocksForSale(
  //       BlockId,
  //       ExampleBlocker,
  //     )
  //     expect(tempSaleStruct.saleStatus).to.eq(true)
  //     expect(tempSaleStruct.acceptingToken).to.eq(BlockRoomCoin.address)
  //     // trying to buy a block with when we are not approved
  //     try {
  //       await BlockTrading.buyBlock(
  //         BlockId,
  //         ExampleBlocker,
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       expect(
  //         error.reason.includes('BlockTrading contract not approved !!'),
  //       ).to.eq(true)
  //     }
  //   })
  //   it('shoud revert if we wanted to buyBlock with addressZero as the seller', async function () {
  //     //   // minting some BlockRoomCoin for the blocker
  //     await BlockRoomCoin.mint(
  //       deployerAsBlocker,
  //       hre.ethers.utils.parseEther('10'),
  //     )
  //     // confirming the balance of the BlockRoomCoin of the Blocker
  //     expect(await BlockRoomCoin.callStatic.balanceOf(deployerAsBlocker)).to.eq(
  //       hre.ethers.utils.parseEther('10'),
  //     ),
  //       // approving the BlockTrading for Block Spending from the Blocker account
  //       await BlockRoomCoin.connect(deployerAsBlockerSigner).approve(
  //         BlockTrading.address,
  //         hre.ethers.utils.parseEther('1'),
  //       )
  //     // confirming the BlockTrading contract has the sufficient allowance
  //     expect(
  //       await BlockRoomCoin.allowance(deployerAsBlocker, BlockTrading.address),
  //     ).to.eq(hre.ethers.utils.parseEther('1'))
  //     //buying the block
  //     // trying to buy a block with when we are not approved
  //     try {
  //       await BlockTrading.buyBlock(
  //         BlockId,
  //         hre.ethers.constants.AddressZero,
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       expect(error.reason.includes('zero address exception !!')).to.eq(true)
  //     }
  //   })
  //   it('shoud revert if we wanted to buyBlock with a ERC20 token that is not supported or not accepted by the sellerBlocker', async function () {
  //     // unsetting the BlockRoomCoin an trying to buy the block
  //     await BlockTrading.unsetPaymentTokens(BlockRoomCoin.address)
  //     // confirming that the payment token is cancelled
  //     expect(await BlockTrading.paymnetTokens(BlockRoomCoin.address)).to.eq(
  //       false,
  //     )
  //     // trying to buy a block with a toke that is not supported by the BlockRoom
  //     try {
  //       await BlockTrading.buyBlock(
  //         BlockId,
  //         ExampleBlocker,
  //         BlockRoomCoin.address,
  //       )
  //     } catch (error) {
  //       expect(error.reason.includes('payment token not supported !!')).to.eq(
  //         true,
  //       )
  //     }
  //     // reseting the Blockroom coin '
  //     // unsetting the BlockRoomCoin an trying to buy the block
  //     await BlockTrading.setPaymentTokens(BlockRoomCoin.address)
  //     // confirming that the payment token is cancelled
  //     expect(await BlockTrading.paymnetTokens(BlockRoomCoin.address)).to.eq(
  //       true,
  //     )
  //     // minting some BlockRoomCoin for the blocker
  //     await BlockRoomCoin2.mint(
  //       deployerAsBlocker,
  //       hre.ethers.utils.parseEther('10'),
  //     )
  //     // confirming the balance of the BlockRoomCoin2 of the Blocker
  //     expect(
  //       await BlockRoomCoin2.callStatic.balanceOf(deployerAsBlocker),
  //     ).to.eq(hre.ethers.utils.parseEther('10')),
  //       // approving the BlockTrading for Block Spending from the Blocker account
  //       await BlockRoomCoin2.connect(deployerAsBlockerSigner).approve(
  //         BlockTrading.address,
  //         hre.ethers.utils.parseEther('1'),
  //       )
  //     // confirming the BlockTrading contract has the sufficient allowance
  //     expect(
  //       await BlockRoomCoin2.allowance(deployerAsBlocker, BlockTrading.address),
  //     ).to.eq(hre.ethers.utils.parseEther('1'))
  //     // trying to buy a block with a toke that is not supported by the seller Blocker
  //     try {
  //       await BlockTrading.buyBlock(
  //         BlockId,
  //         ExampleBlocker,
  //         BlockRoomCoin2.address, // usdt address
  //       )
  //     } catch (error) {
  //       expect(error.reason.includes('payment token not supported !!')).to.eq(
  //         true,
  //       )
  //     }
  //   })
  // })
})
