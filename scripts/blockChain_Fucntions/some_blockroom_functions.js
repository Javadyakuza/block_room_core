import {
  oracle_abi,
  BR_ABI,
  BLOCKROOM_contract_addr,
  Qualifying_oracle_addr,
  BRSC_ABI,
  BRSC_ADDR,
} from '../backend/event_listener/contracts_creds'
import estimateSendResponsGas from '../blockchain/intract/gas_estimator'
import { ethers } from 'ethers'
import { encryptWithAES, decryptWithAES } from '../backend/logs_handler/E_D'
import { get_houseId_from_tx_hash } from '../backend/logs_handler/log_decoder'
import axios from 'axios'
// const provider = new ethers.providers.JsonRpcProvider(
//   'https://endpoints.omniatech.io/v1/bsc/testnet/public',
// )
const provider = new ethers.providers.JsonRpcProvider(
  // 'https://bsc-testnet.public.blastapi.io',
  'https://data-seed-prebsc-1-s3.binance.org:8545',
)
const wallet = new ethers.Wallet(
  '1b10b397817fda50b979252d0f1c981f2f7e88c42f49e3d85c8cf3acfe46b045',
)
// connect the wallet to the provider
const owner = wallet.connect(provider)

//// fucntions //////
// @notice it`s [VERY IMPOPRTANT] that the house id that is used for qualifiction , after qualofying will not be used anymore ,
//     >>the registerHouse will generate a new house id wich will be used as houseId to trade the house
//// ^^^^^^^^^ //////
async function user_approve_the_BR(signer) {
  // spender is a eth address of the BR_contractand
  // @param amount is a constant value which setted in blobk room
  // technacally we have to fetch is from blokcroom but i forgot to provide a function to fetch that
  // so we manually set it because i litreally am tired of deployimg this contract , peace
  const amount = 1000000 // means one BRSC because the decimals for the brsc is 6
  // @param BRSC = blockroom stable coin
  try {
    const BRSC_contract = await new ethers.Contract(BRSC_ADDR, BRSC_ABI, signer)
    console.log('the stable coincrated with this signer >>', signer)
    const static_approve_response = await BRSC_contract.callStatic.approve(
      BLOCKROOM_contract_addr,
      Number(amount),
    )
    console.log('this is the static response >>', static_approve_response)
    if (static_approve_response == true) {
      const approve_response = await BRSC_contract.approve(
        BLOCKROOM_contract_addr,
        Number(amount),
      )
      await approve_response.wait()
      return true
    } else {
      console.log('static response false >>', static_approve_response)
      return false
    }
  } catch (err) {
    console.log(
      'an error accured while asking user to approve , this is the error >> \n ',
      err,
    )
    return false
  }
}
async function check_user_existance(ETH_address) {
  console.log('entered housechecker')
  const BR_ADDRESS = BLOCKROOM_contract_addr
  const BR_CONTRACT = await new ethers.Contract(BR_ADDRESS, BR_ABI, owner)
  console.log('contract created with ', ETH_address)
  const existanceRes = await BR_CONTRACT.callStatic.addressToId(
    String(ETH_address),
  )

  return ethers.utils.formatUnits(existanceRes, 0)
}
///// registring a user //////////
async function register_a_user(BR_ABI, signer, national_id) {
  console.log('entered registerer')
  const BR_ADDRESS = BLOCKROOM_contract_addr
  try {
    const BR_CONTRACT = await new ethers.Contract(BR_ADDRESS, BR_ABI, signer)
    console.log('contract created ')
    const response = await BR_CONTRACT.callStatic.registerPerson(
      Number(national_id),
    )
    if (response === true) {
      try {
        let tx = await BR_CONTRACT.registerPerson(Number(national_id))
        await tx.wait()
        return true
      } catch (error) {
        return error
      }
    } else {
      return response
    }
  } catch (error) {
    return 'failed registering a user due to >>>', error
  }
}
//// request for registering a house /////////
async function request_for_house_registration(
  BR_ABI,
  signer,
  id,
  houseId,
  houseComponent,
) {
  const BR_ADDRESS = BLOCKROOM_contract_addr
  try {
    const BR_CONTRACT = await new ethers.Contract(BR_ADDRESS, BR_ABI, signer)
    console.log('contract created ')
    let payableFee = await estimateSendResponsGas(
      Number(id),
      Number(houseId),
      Number(houseComponent),
    )
    console.log('main', payableFee, 'for inout', Number(payableFee.toString()))
    let response = await BR_CONTRACT.callStatic.houseRegistrationRequest(
      Number(houseId),
      Number(houseComponent),
      Number(payableFee.toString()),
      { value: payableFee },
    )
    //   response = await response.wait()
    console.log('the response is ', response)
    if (response === true) {
      let tx = await BR_CONTRACT.houseRegistrationRequest(
        Number(houseId),
        Number(houseComponent),
        Number(payableFee.toString()),
        { value: payableFee },
      )
      await tx.wait()
      return true
    } else {
      return response
    }
  } catch (error) {
    console.log(error)
    return error
  }
}
//// the trusted API calling the "senResponse" function  at oracle smart contract
async function admin_send_response(id, houseId, components) {
  try {
    const oracle_contract = await new ethers.Contract(
      Qualifying_oracle_addr,
      oracle_abi,
      owner,
    )
    console.log('oracel contract created')
    let send_response_response_callstatic = await oracle_contract.callStatic.sendResponse(
      Number(id),
      Number(houseId),
      Number(components),
    )
    console.log('static response is this >>', send_response_response_callstatic)
    if (send_response_response_callstatic == true) {
      try {
        return await oracle_contract
          .sendResponse(Number(id), Number(houseId), Number(components))
          .then(async (tx) => {
            await tx.wait()
            return true
          })
          .catch((err) => {
            console.log('couldnt qualify in BR contract due to >>', err)
            return false
          })
      } catch (error) {
        console.log(
          'error while oracle sending the real time response !! the ERR>>>',
          error,
        )
        return error
      }
    } else {
      console.log('call static false response !!')
      return send_response_response_callstatic
    }
  } catch (error) {
    console.log('error while oracle sending response >>>', error)
  }
}
async function register_a_house(signer, houseid, components, hint) {
  // encrypting the hint to save to the blockchain
  // encrypting proccess will be done with the
  const BR_CONTRACT = await new ethers.Contract(
    BLOCKROOM_contract_addr,
    BR_ABI,
    signer,
  )
  // encrypting the house hint
  var hint_encrypted = encryptWithAES(String(hint))

  const approving_response = await user_approve_the_BR(signer)
  if (approving_response == true) {
    try {
      const registrationResStatic = await BR_CONTRACT.callStatic.registerHouse(
        Number(houseid),
        Number(components),
        String(hint_encrypted),
      )
      if (registrationResStatic == true) {
        const tx = await BR_CONTRACT.registerHouse(
          Number(houseid),
          Number(components),
          String(hint_encrypted),
        )
        let tx_recceipt = await tx.wait()
        // adding the house hint and the house id in the real world to the data base
        // then we can retrive it via the house id from the block room which is defferent from the real world's huose id
        let BK_houseId = await get_houseId_from_tx_hash(
          String(tx_recceipt.transactionHash),
        )
        await axios
          .get(
            `http://localhost:8080/setRowInBK_HOUSES?real_houseId=${houseid}&house_hint=${hint_encrypted}&BK_houseId=${BK_houseId} `,
          )
          .then((the__row_adding_respnse) => {
            if (the__row_adding_respnse.data == 200) {
              console.log('the data added to the data base ')
              return true
            } else {
              console.log(
                `adding the data to the database failed with this error >>${the__row_adding_respnse} `,
              )
              return false
            }
          })
      }
    } catch (error) {
      console.log('registering a house faced an issue >> ', error)
      return false
    }
  } else {
    console.log('user approving the br contract failed ')
    return false
  }
}
async function update_person_houses(signer, personId) {
  console.log('the updating house fucntion is called ')
  const BR_contract = new ethers.Contract(
    BLOCKROOM_contract_addr,
    BR_ABI,
    signer,
  )
  const BR_contract_gettingTheIds = new ethers.Contract(
    BLOCKROOM_contract_addr,
    BR_ABI,
    owner,
  )
  console.log('both contracts are created ')
  // fetching the person houses
  // the out put will contatain a array which every house id has
  // a seperate array inside of that containing houseId and component
  // instance = [[houseId , components][14814917429371 , 6]]
  var tmp_obj = {}
  var tmp_arr = []
  const person_houses = await BR_contract.callStatic.personHouses(
    Number(personId),
  )
  console.log('this is the person houses >>', person_houses)
  person_houses.map(async (item) => {
    let id_hint = await axios.get(
      `http://localhost:8080/getRealIdAndHintByBk_id?BK_houseId=${item[0]}`,
    )
    tmp_obj.houseId = id_hint[0].real_houseId
    tmp_obj.BK_houseId = item[0]
    tmp_obj.houseComponents = item[1]
    tmp_obj.ownerId = Number(personId)
    tmp_arr.push(tmp_obj)
  })
  // houseId and components are setted
  tmp_arr.map(async (obj, index) => {
    let hint = await BR_contract.callStatic.houseHintShow(Number(obj.houseId))
    let hint_decrypted = decryptWithAES(hint)
    obj.houseHint = hint_decrypted
    let house_addresses_array = await BR_contract.callStatic.whoOwnsTheHouse(
      Number(obj.houseId),
    )
    obj.otherOwner(house_addresses_array.length)
    let owners_ids = []
    house_addresses_array.map(async (addr) => {
      let tmp_id = await BR_contract_gettingTheIds.callStatic.addressToId(addr)
      owners_ids.push(tmp_id)
    })
    obj.otherOwnerId = owners_ids
    const events = await BR_contract_gettingTheIds.queryFilter('PurchaseSaved')
    const matchingEvents = events.filter((event) => {
      return event.args._houseId.toString() === obj.houseId
    })

    if (matchingEvents.length > 0) {
      const latestEvent = matchingEvents[matchingEvents.length - 1]
      obj.latestTradedPrice = latestEvent.args._price.toString()
      console.log('Latest event:')
    } else {
      obj.latestTradedPrice = 'no trades'
      console.log('No matching events found')
    }
    tmp_arr[index] = obj
  })
  let adding_person_houses_res = await axios.get(
    `http://localhost:8080/setPersonHouses?Person_houses=${tmp_arr}&person_id=${String(
      personId,
    )}`,
  )
  if (adding_person_houses_res.data == 200) {
    return true
  } else {
    return false
  }
}

// request_for_house_registration(BR_ABI, owner, '123', '123', '123').then(
//   (res) => {
//     console.log(res)
//   },
// )
export {
  check_user_existance,
  register_a_user,
  request_for_house_registration,
  admin_send_response,
  register_a_house,
  update_person_houses,
}
