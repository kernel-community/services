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
      <main>
        <div class="relative">
          <div class="hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0">
            <img alt="kernel fingerprint" src="/static/media/lines.751bbe2cb37a19445646.png" width="383" height="412" />
          </div>
          <div class="hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0">
            <img alt="kernel fingerprint" src="/static/media/lines.751bbe2cb37a19445646.png" width="442" height="476" />
          </div>
        </div>
        <section className='absolute md:pt-32 pb-32 w-full h-full'>
         <div className='container mx-auto px-4 h-full'>
            <div className='flex content-center items-center justify-center h-full'>
              <div className='w-full lg:w-4/12 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0'>
                  <div className='rounded-t mb-0 px-6 py-6'>
                    <div className='text-center'>
                      <button
                        className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                        onClick={handleLogin}
                        type='button'
                      >
                        Login with your Kernel account
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
