/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'

const WALLET_STORE_VERSION = '1'

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const PROVIDER_ENDPOINT = process.env[`REACT_APP_PROVIDER_ENDPOINT_${env}`]
const AUTH_WALLET_ADDRESS = process.env[`REACT_APP_AUTH_WALLET_ADDRESS_${env}`]

const BLOCK_EXPLORER = {
  1: 'https://etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  5: 'https://goerli.etherscan.io'
}

const getItem = (k) => JSON.parse(localStorage.getItem(k))

const loadWallet = () => {
  try {
    const wallet = getItem('wallet')
    if (wallet.version !== WALLET_STORE_VERSION) {
      throw new Error('unsupported wallet')
    }
    return wallet
  } catch (error) {

  }
}

const provider = (chainId) => new ethers.providers.JsonRpcProvider(`${PROVIDER_ENDPOINT}/${chainId}`, chainId)
const defaultProvider = () => provider(4)

const voidSigner = (address, provider) => new ethers.VoidSigner(address, provider)

const DECIMAL_PLACES = 8
const humanizeEther = (bigNum) => {
  if (!ethers.BigNumber.isBigNumber(bigNum)) {
    return ''
  }
  const ether = ethers.utils.commify(ethers.utils.formatEther(bigNum))
  const dot = ether.indexOf('.')
  const end = dot > -1 ? (dot + 1 + DECIMAL_PLACES) : ether.length
  return ether.substring(0, end)
}

const humanizeGwei = (bigNum) => {
  if (!ethers.BigNumber.isBigNumber(bigNum)) {
    return ''
  }
  const gwei = ethers.utils.commify(ethers.utils.formatUnits(bigNum, 'gwei'))
  return gwei
}

const humanizeHash = (hash, n = 4) => hash ? `${hash.substr(0, n)}...${hash.substr(-n)}` : 'null'

const blockExplorer = (chainId, hash) => `${BLOCK_EXPLORER[chainId]}/tx/${hash}`

export {
  AUTH_WALLET_ADDRESS, loadWallet, defaultProvider, provider, voidSigner, humanizeEther, humanizeGwei, humanizeHash, blockExplorer
}
