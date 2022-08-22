/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { VM } from '@ethereumjs/vm'
import { Common, Chain } from '@ethereumjs/common'
import { Account, Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'

const init = async (opts = {}) => {
  const common = new Common({ chain: Chain.Goerli })
  const hardforkByBlockNumber = true
  const vm = new VM({ common, hardforkByBlockNumber })

  const accountPk = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
  const account = Account.fromAccountData({ nonce: 0, balance: window.BigInt(100) ** window.BigInt(18) })
  const accountAddress = Address.fromPrivateKey(accountPk)
  await vm.stateManager.putAccount(accountAddress, account)
  return { vm, accountPk, account, accountAddress, common }
}

const deploy = async ({ vm, common, account, accountPk }, object) => {
  const txData = {
    value: 0,
    gasLimit: 200_000_000_000,
    gasPrice: 10,
    data: '0x' + object,
    nounce: account.nonce
  }
  const tx = Transaction.fromTxData(txData, { common }).sign(accountPk)
  const deployment = await vm.runTx({ tx })
  console.log(deployment)
  return deployment
}

const call = async ({ vm, accountAddress }, contractAddress, sighash) => {
  const result = await vm.evm.runCall({
    to: contractAddress,
    caller: accountAddress,
    origin: accountAddress,
    data: Buffer.from(sighash.slice(2), 'hex')
  })
  console.log(result)
  return result
}

const evm = { init, deploy, call }

export default evm
