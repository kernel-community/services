/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, linesVector } from '@kernel/common'

import AppConfig from 'App.config'
import AppIntro from 'components/AppIntro'
import Process from 'components/Process'
import Assurance from 'components/Assurance'

const HOMESTATE = Object.freeze({
  INTRO: 0, 
  PROCESS: 1, 
  ASSURANCE: 2
})

const Home = () => {
  const navigate = useNavigate()
  const { walletLogin } = useServices()

  const [homeState, setHomeState] = useState(HOMESTATE.INTRO)

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
                    <div key={homeState} className='opacity-0'>
                      { homeState === HOMESTATE.INTRO && <AppIntro onLogin={handleLogin} /> }  
                      { homeState === HOMESTATE.PROCESS && <Process /> }
                      { homeState === HOMESTATE.ASSURANCE && <Assurance /> }
                    </div>
                    {/** Navigation Buttons */}
                    <div className='flex flex-row flex-end justify-center align-center'>
                      {homeState > HOMESTATE.INTRO && <button
                        className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                        onClick={() => setHomeState(homeState-1)}
                      >
                        Back
                      </button>}
                      {homeState < HOMESTATE.ASSURANCE && <button
                        className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                        onClick={() => setHomeState(homeState+1)}
                      >
                        { homeState === HOMESTATE.INTRO ? "Begin" : "Next" }
                      </button>}
                      {/** Create Your Keys CTA */}
                      { 
                        homeState === HOMESTATE.ASSURANCE && 
                          <button
                            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                            onClick={handleLogin}
                            type='button'
                          >
                            Create your keys
                          </button>
                      } 
                    </div>
                    
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
