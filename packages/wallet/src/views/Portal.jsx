/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useServices, linesVector, getUrl } from '@kernel/common'

import { loadWallet } from 'common'

import AppConfig from 'App.config'
import Page from 'components/Page'

const MEMBER_ROLE = 1000

const Portal = () => {
  const navigate = useNavigate()

  const { currentUser } = useServices()
  const user = currentUser()
  console.log('user', user)

  const applyLink = getUrl('apply')

  const [nickname, setNickname] = useState('')

  const wallet = loadWallet()

  useEffect(() => {
    if (!wallet) {
      return navigate('/register/create')
    }
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/login')
    }
    setNickname(wallet.nickname)
  }, [navigate, wallet, user])

  return (
    <Page>
      <div className='relative'>
        <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
        </div>
        <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
        </div>
      </div>
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
            Welcome, {nickname}.
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary'>
            You are already valuable, just as you are.
          </div>
        </div>

        <div className='my-4 px-4 grid grid-cols-1 md:grid-cols-2 md:my-16 md:px-16'>
          <div>
            <h3 className='text-center font-heading text-center text-3xl text-primary py-5'>Let me explore myself</h3>
            <div className='text-center m-8 p-5'>
              <Link to='/portal/overview' className='bg-kernel-dark text-kernel-white text-center w-full p-5 rounded shadow-md'>
                Go to Wallet
              </Link>
            </div>
            <p className='text-center m-4'>You do not need to join Kernel to use our tools. Start learning now...</p>
          </div>
          <div>
            <h3 className='text-center font-heading text-center text-3xl text-primary py-5'>Help me find the others</h3>
            <div className='text-center m-8 p-5'>
              {user.role > MEMBER_ROLE
                ? <a href={applyLink} className='bg-kernel-dark text-kernel-white text-center w-full p-5 rounded shadow-md'>Apply to Kernel</a>
                : <Link to='/portal/us' className='bg-kernel-dark text-kernel-white text-center w-full p-5 rounded shadow-md'>Explore Kernel</Link>}
            </div>
            <p className='text-center m-4'>If you enjoy learning with others, come and find us...</p>
          </div>
          <div />
          <div />
        </div>
      </div>
    </Page>
  )
}

export default Portal
