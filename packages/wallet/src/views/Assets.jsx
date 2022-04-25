/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Page from 'components/Page'

const WALLET_STORE_VERSION = '1'

const getItem = (k) => JSON.parse(localStorage.getItem(k))

const loadWallet = () => {
  const wallet = getItem('wallet')
  if (wallet.version !== WALLET_STORE_VERSION) {
    throw new Error('unsupported wallet')
  }
  return wallet
}

const portalCards = [
  {
    title: 'Claim',
    description: 'Get set up with some test ETH',
    url: '/claim'
  },
  {
    title: 'Explore',
    description: 'Understand how transactions work',
    url: '/explore'
  },
  {
    title: 'Deploy',
    description: 'Create your own token now',
    url: '/deploy'
  },
  {
    title: 'Mint',
    description: 'Create an NFT in one go',
    url: '/mint'
  },
  {
    title: 'Contact',
    description: 'Keep your friends\' addresses safe',
    url: '/contact'
  },
  {
    title: 'Contribute',
    description: 'Learn how to improve this with us',
    url: '/contribute'
  },
  {
    title: 'Interact',
    description: 'Explore all the best contracts',
    url: '/interact'
  },
  {
    title: 'Develop',
    description: 'Write your own code!',
    url: '/develop'
  }
]

const Assets = () => {
  const wallet = loadWallet()
  const [address] = useState(wallet.address)
  const [nickname] = useState(wallet.nickname)
  /* eslint-disable no-unused-vars */
  const [signer, setSigner] = useState(null)
  /* eslint-disable no-unused-vars */
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // TODO: pass in context
    const defaultProvider = new ethers.providers.CloudflareProvider()
    const voidSigner = new ethers.VoidSigner(address, defaultProvider)
    setSigner(voidSigner)
    voidSigner.getBalance().then((e) => setBalance(ethers.utils.formatEther(e)))
  }, [address])

  return (
    <Page>
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='text-4xl my-4'>
            Welcome, {nickname}.
          </div>
          <div className='text-2xl my-4'>
            You are already valuable, just as you are.
          </div>
          <div className='my-4'>
            This portal will help you learn how to realize some of that value in the
            world of web3. We're so happy you're with us.
          </div>
        </div>

        <div className='my-16 px-16 grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-8'>
          {portalCards.map((portalCard, index) => {
            return (
              <a key={index} href={portalCard.url}>
                <div className='bg-kernel-dark text-kernel-white p-5 rounded shadow-md'>
                  <div className='text-xl mb-2'>{portalCard.title}</div>
                  <div className='text-base mb-1'>{portalCard.description}</div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </Page>
  )
}

export default Assets
