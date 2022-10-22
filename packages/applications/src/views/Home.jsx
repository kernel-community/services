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
        <section className='absolute w-full h-screen'>
          <div className='container mx-auto px-4 h-full'>
            <div className='flex content-center items-center justify-center h-screen'>
              <div className='w-full lg:w-3/4 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full mb-6'>
                  <p className='text-center text-4xl md:text-6xl my-6'>
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
                      There are a few steps to our application process. We encourage you to <strong>set aside ~30 minutes for this</strong>. Taking your time will help us get to know each other in a more wholesome way.
                    </p>
                    <ol className='list-decimal px-12'>
                      <li className='my-4'>
                        Create your keys. Keys are different to a username + password combination. Keys imply cryptography, which sounds complicated, but its really just here to help you. Being given control of your 'private key' in a safe, educational environment means you can start your learning journey right now.
                      </li>
                      <li className='my-4'>
                        It's OK if you don't understand what creating your own keys means, or how to keep them safe. We're here to <strong>learn together</strong>. Follow along as best you can, and continue to the application form when prompted. Though you are the only one who can see your keys, we can help you make new ones while keeping your data safe, private, and under your control.
                      </li>
                      <li className='my-4'>
                        Once you have created your keys, you will be redirected to an application form. Respond to the questions as best you can and click 'Submit' once you are happy.
                      </li>
                      <li className='my-4'>
                        Come back here whenever you like, login with your new account, and check your status. We review applications on a rolling basis and will update you here and via email about any changes.
                      </li>
                    </ol>
                    <p className='my-12'>
                      Even if you don't get in to Kernel immediately, you are free to read <a className='text-blue-600 visited:text-purple-600' href='https://kernel.community/en/learn/' target='_blank' rel='noreferrer'>the syllabus</a>, learn from<a className='text-blue-600 visited:text-purple-600' href='https://kernel.community/en/build' target='_blank' rel='noreferrer'> everything we build</a>, watch <a className='text-blue-600 visited:text-purple-600' href='https://www.youtube.com/channel/UC2kUaSgR0L-uzGkNsOxSxzw' target='_blank' rel='noreferrer'>all our recordings</a>, and use or adapt <a className='text-blue-600 visited:text-purple-600' href='https://github.com/kernel-community/' target='_blank' rel='noreferrer'>all our code </a>. Even better: creating your own, personal key-pair enables you to use many of our best tools right now. Your new account will help you learn how to mint tokens, deploy your own contracts, decode transactions on a blockchain and much more. You do not need our permission to use it, and you can start right now...
                    </p>
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
