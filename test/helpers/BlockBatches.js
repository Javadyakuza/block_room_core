const correctBlockOfParams = [
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 4,
    reducedOutside: false,
  },
  {
    blockId: 10987654321,
    nationalId: 1451451451,
    component: 5,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 6,
    reducedOutside: false,
  },
]
const correctBlockOfParamsCompelter = [
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 2,
    reducedOutside: false,
  },
  {
    blockId: 10987654321,
    nationalId: 1451451451,
    component: 1,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 0,
    reducedOutside: false,
  },
]
const correctBlockOfParamsReducer = [
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 2,
    reducedOutside: true,
  },
  {
    blockId: 10987654321,
    nationalId: 1451451451,
    component: 4,
    reducedOutside: true,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 3,
    reducedOutside: true,
  },
]
const wrongNationalIdBlockOfParams = [
  { blockId: 12345678910, nationalId: 0, component: 4, reducedOutside: false }, // must not be zero(0)
  {
    blockId: 10987654321,
    nationalId: 1451451451,
    component: 5,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 6,
    reducedOutside: false,
  },
]

const wrongComponentBlockOfParams = [
  {
    blockId: 10987654321,
    nationalId: 1451451451,
    component: 0,
    reducedOutside: false,
  }, // must be bigger thatn zero(0)
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 4,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 6,
    reducedOutside: false,
  },
]
const wrongComponent2BlockOfParams = [
  {
    blockId: 15987532461,
    nationalId: 2362362362,
    component: 7,
    reducedOutside: false,
  }, // >> must be lower than six(6)
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 4,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 6,
    reducedOutside: false,
  },
]
const wrongBlockIdBlockOfParams = [
  { blockId: 0, nationalId: 1451451451, component: 5, reducedOutside: false }, // >> must not be zero(0)
  {
    blockId: 12345678910,
    nationalId: 8548548548,
    component: 4,
    reducedOutside: false,
  },
  {
    blockId: 5617925367,
    nationalId: 1273906497,
    component: 6,
    reducedOutside: false,
  },
]

module.exports = {
  correctBlockOfParams,
  correctBlockOfParamsCompelter,
  correctBlockOfParamsReducer,
  wrongNationalIdBlockOfParams,
  wrongComponentBlockOfParams,
  wrongComponent2BlockOfParams,
  wrongBlockIdBlockOfParams,
}
