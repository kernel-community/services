/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, Footer } from '@kernel/common'
import AppConfig from 'App.config'

import bgImage from '../assets/images/admin_bg.png'

const Login = () => {
  const navigate = useNavigate()
  const { walletLogin } = useServices()

  const handleLogin = async () => {
    const user = await walletLogin()
    if (user.role <= AppConfig.minRole) {
      const homeUrl = AppConfig.homeUrl || '/'
      return navigate(homeUrl)
    }
    navigate('/')
  }

  return (
    <div>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <main className='overflow-hidden'>
        <section className='absolute w-full h-screen'>
          <div
            className='absolute top-0 w-full h-screen bg-gray-900'
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundPosition: 'top 10px center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className='container mx-auto px-4 h-full'>
            <div className='flex content-center items-center justify-center h-screen'>
              <div className='w-full lg:w-5/12 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0'>
                  <div className='rounded-t mb-0 px-6 py-6'>
                    <div className='text-center'>
                      <button
                        className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                        onClick={handleLogin}
                        type='button'
                      >
                        Login with your Kernel Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer absolute />
        </section>
      </main>
    </div>
  )
}

export default Login
