/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, linesVector } from '@kernel/common'

import AppConfig from 'App.config'
import Process from 'components/Process'
import Assurance from 'components/Assurance'

const Home = () => {
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
        <div className='relative'>
          <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
            <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
          </div>
          <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
            <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
          </div>
        </div>
        <section className='absolute w-full'>
          <div className='container mx-auto px-4'>
            <div className='flex content-center items-center justify-center'>
              <div className='w-full lg:w-3/4 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full my-20'>
                  <p className='text-center text-4xl md:text-6xl my-10'>
                    You found us! Welcome.
                  </p>
                  <div className='text-lg'>
                    <p className='my-4'>
                      This page will help you apply to Kernel: a custom educational community, made up by people from across the planet.
                    </p>
                    <p className='my-4'>
                      Our goal is to <strong>learn together</strong>. Our principles are <strong>do no harm</strong> and <strong>play, infinitely</strong>. Our primary method of learning is conversation. Together, this enables us to cultivate a culture of care.
                    </p>
                    <p className='my-4'>
                      There are a few steps to our application process. We encourage you to <strong>set aside ~20 minutes for this</strong>. Taking your time will help us get to know each other in a more wholesome way.
                    </p>
                    <p className='my-4'>
                      If you have already gone through the process, you can check your status by <button className='text-blue-600 visited:text-purple-600 cursor-pointer' onClick={handleLogin}>clicking here</button>.
                    </p>
                    <Process />
                    <Assurance />
                  </div>
                  <div className='text-center mx-auto shadow-lg rounded-lg bg-gray-300 border-0 lg:w-80'>
                    <button
                      className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                      onClick={handleLogin}
                      type='button'
                    >
                      Create your keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
