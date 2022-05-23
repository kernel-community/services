/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Footer, Navbar } from '@kernel/common'
import { linesVector } from '@kernel/common'
import AppConfig from 'App.config'

import eth_logo from 'assets/images/ethereum.png'
import ipfs_logo from 'assets/images/ipfs.png'
import uniswap_log from 'assets/images/uniswap.png'
import graph_logo from 'assets/images/the-graph.jpg'

const Wallet = () => {
  return (
    <div>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <main>
          <div className='hidden lg:block lg:absolute lg:-top-24 lg:-left-52 lg:z-0'>
            <img alt='kernel fingerprint' src={linesVector} width={383} height={412}/>
          </div>
          <div className='hidden lg:block lg:absolute lg:-top-12 lg:-right-52 lg:z-0'>
            <img alt='kernel fingerprint' src={linesVector} width={442} height={476}/>
          </div>
          <div className='lg:px-64 md:px-12 px-12 py-20'>
            <div className='font-heading lg:text-7xl text-5xl text-primary lg:py-5'>
              Portal.
            </div>
            <div className='font-secondary text-lg text-kernel pt-12'>
              <Link to='/register'>
                <span className='before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-highlight relative inline-block cursor-pointer'>
                  <span className='relative text-primary'>
                    <span className='underline decoration-dotted'>
                      Start your adventure
                    </span>
                  </span>
                </span>
              </Link>
              &nbsp;or&nbsp;
              <Link to='/assets'>
                <span className='before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-highlight relative inline-block cursor-pointer'>
                  <span className='relative text-primary'>
                    <span className='underline decoration-dotted'>
                      continue connecting
                    </span>.
                  </span>
                </span>
              </Link>
            </div>
            <div className='pt-40 font-secondary'>
              <div className='columns-1 md:columns-2'>
                <div className='p-10 border rounded-md border-kernel-dark float-left mb-10 md:mb-0'>
                  <h2 className='font-heading text-3xl text-primary pb-6'>Learn</h2>
                  <p>
                    What lies before you is a <strong>non-custodial wallet</strong>. Don't stress if you're not sure what that means. Kernel is an open source learning community, and we're here to help each other figure stuff like this out together.
                  </p>
                </div>
                <div className='p-10 border rounded-md border-kernel-dark float-left mb-10 md:mb-0'>
                  <h2 className='font-heading text-3xl text-primary pb-6'>Reimagine</h2>
                  <p>
                    We call this a <strong>portal</strong> because it can do so much more than hoard money. When we set out to learn together, rather than represent your "worth" with one number, we can discover much more wholesome ways of seeing and being.
                  </p>
                </div>
              </div>
              <div className='pt-20'>
                <h1 className='font-heading text-5xl text-primary pb-6'>Help Us Help Each Other</h1>
                <p className='pb-10'>
                  This <strong>portal</strong> will help you:
                </p>
                <ol className='list-decimal pl-10 pb-10 underline underline-offset-4 decoration-kernel-dark'>
                  <li className='p-2'>
                    <strong>connect</strong> with other humans worthy of your trust
                  </li>
                  <li className='p-2'>
                  <strong>understand</strong> why we call the protocols by which that happens "trustless"
                  </li>
                  <li className='p-2'>
                  <strong>find play</strong> money to help you experiment with more magical parts of our internet
                  </li>
                  <li className='p-2'>
                  <strong>decode</strong> transactions, write and deploy your own contracts, and mint your own tokens
                  </li>
                </ol>
                <p>
                  Finally, it will show you how to extend your quest and give back to the community who have made this gift possible.
                </p>
              </div>
              <div className='pt-20'>
                <h1 className='font-heading text-5xl text-primary pb-6'>Plural Goods</h1>
                <div className='font-secondary'>
                  <div className='columns-1 mb-20 md:columns-2'>
                    <div className='p-10 border rounded-md border-kernel-dark float-left mb-10 md:mb-0'>
                      <h2 className='font-heading text-3xl text-primary pb-6'>For Everyone</h2>
                      <p>
                        Anyone may use and extend this <strong>portal</strong>: it is a public gift. We wish to help demonstrate that "wallets" need not compromise your security, limit you to one network at a time, or sell your data to JP Morgan and friends.
                      </p>
                    </div>
                    <div className='p-10 border rounded-md border-kernel-dark float-left mb-10 md:mb-0'>
                      <h2 className='font-heading text-3xl text-primary pb-6'>For Kernel</h2>
                      <p>
                        If you're a Kernel Fellow, then this portal will take you to many more places. Your keys are used not just to sign transactions, but to grant you access to other Fellows, their adventures, and the various events unique to our community.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='pt-20'>
                <h1 className='font-heading text-5xl text-primary pb-6'>Supporting Supporters</h1>
                <div className='font-secondary'>
                  <div className='columns-1 mb-20 sm:columns-2 md:columns-3 lg:columns-4'>
                    <div className='py-10 float-left sm:pr-2'>
                      <img className='max-h-[100px]' alt="supporter-logo" src={eth_logo} />
                    </div>
                    <div className='py-10 float-left sm:pr-2'>
                      <img className='max-h-[100px]' alt="supporter-logo" src={ipfs_logo} />
                    </div>
                    <div className='py-10 float-left sm:pr-2'>
                      <img className='max-h-[100px]' alt="supporter-logo" src={uniswap_log} />
                    </div>
                    <div className='py-10 float-left sm:pr-2'>
                      <img className='max-h-[100px]' alt="supporter-logo" src={graph_logo} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </main>
      <Footer absolute />
    </div>
  )
}

export default Wallet

{/* <div
          className='relative pt-16 pb-32 flex content-center items-center justify-center'
          style={{
            minHeight: '75vh'
          }}
        >
          <div
            className='absolute top-0 w-full h-full bg-center bg-cover'
            style={{
              backgroundImage: `url(${bgImage})`
            }}
          >
            <span id='blackOverlay' className='w-full h-full absolute opacity-75 bg-black' />
          </div>
          <div className='container relative mx-auto'>
            <div className='items-center flex flex-wrap'>
              <div className='w-full lg:w-6/12 px-4 ml-auto mr-auto text-center'>
                <div className='pr-12'>
                  <h1 className='text-white font-semibold text-5xl'>
                    Kernel Wallet
                  </h1>
                  <p className='mt-4 text-lg text-gray-300'>
                    At Kernel we are on a Mission to better understand the Truth.
                    As part of this mission, we are excited to introduce our very own
                    non-custodial Wallet for all our members.
                  </p>
                </div>
              </div>

            </div>
          </div>
          <div
            className='top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden'
            style={{ height: '70px' }}
          >
            <svg
              className='absolute bottom-0 overflow-hidden'
              xmlns='http://www.w3.org/2000/svg'
              preserveAspectRatio='none'
              version='1.1'
              viewBox='0 0 2560 100'
              x='0'
              y='0'
            >
              <polygon
                className='text-gray-300 fill-current'
                points='2560 0 2560 100 0 100'
              />
            </svg>
          </div>
        </div>

        <section className='pb-20 bg-gray-300 -mt-24'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-wrap'>
              <div className='lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center'>
                <div className='relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg'>
                  <div className='px-4 py-5 flex-auto'>
                    <div className='text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400'>
                      <i className='fas fa-play' />
                    </div>
                    <h6 className='text-xl font-semibold'>Play</h6>
                    <p className='mt-2 mb-4 text-gray-600'>
                      A Wallet helping us learn about Magic Internet Money.
                    </p>
                  </div>
                </div>
              </div>

              <div className='w-full md:w-4/12 px-4 text-center'>
                <div className='relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg'>
                  <div className='px-4 py-5 flex-auto'>
                    <div className='text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400'>
                      <i className='fas fa-heart' />
                    </div>
                    <h6 className='text-xl font-semibold'>
                      Value
                    </h6>
                    <p className='mt-2 mb-4 text-gray-600'>
                      A Wallet helping us care for our Digits.
                    </p>
                  </div>
                </div>
              </div>

              <div className='pt-6 w-full md:w-4/12 px-4 text-center'>
                <div className='relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg'>
                  <div className='px-4 py-5 flex-auto'>
                    <div className='text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400'>
                      <i className='fas fa-bolt' />
                    </div>
                    <h6 className='text-xl font-semibold'>
                      Free
                    </h6>
                    <p className='mt-2 mb-4 text-gray-600'>
                      A Wallet teaching us how to free Money.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center mt-32'>
              <div className='w-full md:w-5/12 px-4 mr-auto ml-auto'>
                <div className='text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-gray-100'>
                  <i className='fas fa-user-friends text-xl' />
                </div>
                <h3 className='text-3xl mb-2 font-semibold leading-normal'>
                  Learning Together
                </h3>
                <p className='text-lg font-light leading-relaxed mt-4 mb-4 text-gray-700'>
                  Don't get lost or intimidated traveling by yourself. Join
                  a vibrant community of self-learners helping each other.
                </p>
                <p className='text-lg font-light leading-relaxed mt-0 mb-4 text-gray-700'>
                  Whether you are a seasoned veteran or new to the world of blockchains,
                  smart contracts, or non-custodial wallets, we'd be lucky to have you.
                </p>
                <a
                  href='https://apply.kernel-community.com'
                  className='font-bold text-gray-800 mt-8'
                >
                  Join the Kernel Community
                </a>
              </div>

              <div className='w-full md:w-4/12 px-4 mr-auto ml-auto'>
                <div className='relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg bg-pink-600'>
                  <img
                    alt='...'
                    src='https://kernel.community/images/fellows/Angela_GIlhotra.jpg'
                    className='w-full align-middle rounded-t-lg'
                  />
                  <blockquote className='relative p-8 mb-4'>
                    <svg
                      preserveAspectRatio='none'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 583 95'
                      className='absolute left-0 w-full block'
                      style={{
                        height: '95px',
                        top: '-94px'
                      }}
                    >
                      <polygon
                        points='-30,95 583,95 583,65'
                        className='text-pink-600 fill-current'
                      />
                    </svg>
                    <h4 className='text-xl font-bold text-white'>
                      A Community of Care
                    </h4>
                    <p className='text-md font-light mt-2 text-white'>
                      In a fast paced environment, we focus on intention and caring for each other.
                    </p>
                  </blockquote>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className='relative py-20'>
          <div
            className='bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20'
            style={{ height: '80px' }}
          >
            <svg
              className='absolute bottom-0 overflow-hidden'
              xmlns='http://www.w3.org/2000/svg'
              preserveAspectRatio='none'
              version='1.1'
              viewBox='0 0 2560 100'
              x='0'
              y='0'
            >
              <polygon
                className='text-white fill-current'
                points='2560 0 2560 100 0 100'
              />
            </svg>
          </div>

          <div className='container mx-auto px-4'>
            <div className='items-center flex flex-wrap'>
              <div className='w-full md:w-4/12 ml-auto mr-auto px-4'>
                <img
                  alt='...'
                  className='max-w-full rounded-lg shadow-lg'
                  src='https://kernel.community/images/fellows/sidcode.jpg'
                />
              </div>
              <div className='w-full md:w-5/12 ml-auto mr-auto px-4'>
                <div className='md:pr-12'>
                  <div className='text-pink-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-pink-300'>
                    <i className='fas fa-rocket text-xl' />
                  </div>
                  <h3 className='text-3xl font-semibold'>
                    A growing Movement
                  </h3>
                  <p className='mt-4 text-lg leading-relaxed text-gray-600'>
                    A Decleration of Interdependence, EPNS, Sherlock, Toucan. Our members are
                    building a better Web for tomorrow one project at a time.
                  </p>
                  <ul className='list-none mt-6'>
                    <li className='py-2'>
                      <div className='flex items-center'>
                        <div>
                          <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3'>
                            <i className='fas fa-fingerprint' />
                          </span>
                        </div>
                        <div>
                          <h4 className='text-gray-600'>
                            Carefully crafted tokenomics
                          </h4>
                        </div>
                      </div>
                    </li>
                    <li className='py-2'>
                      <div className='flex items-center'>
                        <div>
                          <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3'>
                            <i className='fab fa-html5' />
                          </span>
                        </div>
                        <div>
                          <h4 className='text-gray-600'>Amazing incentives</h4>
                        </div>
                      </div>
                    </li>
                    <li className='py-2'>
                      <div className='flex items-center'>
                        <div>
                          <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3'>
                            <i className='far fa-paper-plane' />
                          </span>
                        </div>
                        <div>
                          <h4 className='text-gray-600'>Dynamic governance</h4>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='pt-20 pb-48'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-wrap justify-center text-center mb-24'>
              <div className='w-full lg:w-6/12 px-4'>
                <h2 className='text-4xl font-semibold'>
                  Here are some of our Stewards
                </h2>
                <p className='text-lg leading-relaxed m-4 text-gray-600' />
              </div>
            </div>
            <div className='flex flex-wrap'>
              <div className='w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4'>
                <div className='px-6'>
                  <img
                    alt='...'
                    src='https://kernel.community/images/fellows/En_Canada.jpg'
                    className='shadow-lg rounded-full max-w-full mx-auto'
                    style={{ maxWidth: '120px' }}
                  />
                  <div className='pt-6 text-center'>
                    <h5 className='text-xl font-bold'>
                      En Canada
                    </h5>
                    <p className='mt-1 text-sm text-gray-500 uppercase font-semibold'>
                      Teacher
                    </p>
                    <div className='mt-6'>
                      <button
                        className='bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-twitter' />
                      </button>
                      <button
                        className='bg-blue-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-facebook-f' />
                      </button>
                      <button
                        className='bg-pink-500 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-dribbble' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4'>
                <div className='px-6'>
                  <img
                    alt='...'
                    src='https://kernel.community/images/fellows/Simona_Pop.jpg'
                    className='shadow-lg rounded-full max-w-full mx-auto'
                    style={{ maxWidth: '120px' }}
                  />
                  <div className='pt-6 text-center'>
                    <h5 className='text-xl font-bold'>
                      Simona Pop
                    </h5>
                    <p className='mt-1 text-sm text-gray-500 uppercase font-semibold'>
                      Head of Community
                    </p>
                    <div className='mt-6'>
                      <button
                        className='bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-google' />
                      </button>
                      <button
                        className='bg-blue-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-facebook-f' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4'>
                <div className='px-6'>
                  <img
                    alt='...'
                    src='https://kernel.community/images/fellows/Ben_Percifield.jpg'
                    className='shadow-lg rounded-full max-w-full mx-auto'
                    style={{ maxWidth: '120px' }}
                  />
                  <div className='pt-6 text-center'>
                    <h5 className='text-xl font-bold'>
                      Ben Percifield
                    </h5>
                    <p className='mt-1 text-sm text-gray-500 uppercase font-semibold'>
                      Marketing
                    </p>
                    <div className='mt-6'>
                      <button
                        className='bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-google' />
                      </button>
                      <button
                        className='bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-twitter' />
                      </button>
                      <button
                        className='bg-gray-800 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-instagram' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4'>
                <div className='px-6'>
                  <img
                    alt='...'
                    src='https://kernel.community/images/fellows/Michael_Keating.jpg'
                    className='shadow-lg rounded-full max-w-full mx-auto'
                    style={{ maxWidth: '120px' }}
                  />
                  <div className='pt-6 text-center'>
                    <h5 className='text-xl font-bold'>
                      Michael Keating
                    </h5>
                    <p className='mt-1 text-sm text-gray-500 uppercase font-semibold'>
                      Tokenomics
                    </p>
                    <div className='mt-6'>
                      <button
                        className='bg-pink-500 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-dribbble' />
                      </button>
                      <button
                        className='bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-google' />
                      </button>
                      <button
                        className='bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-twitter' />
                      </button>
                      <button
                        className='bg-gray-800 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                      >
                        <i className='fab fa-instagram' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='pb-20 relative block bg-gray-900'>
          <div
            className='bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20'
            style={{ height: '80px' }}
          >
            <svg
              className='absolute bottom-0 overflow-hidden'
              xmlns='http://www.w3.org/2000/svg'
              preserveAspectRatio='none'
              version='1.1'
              viewBox='0 0 2560 100'
              x='0'
              y='0'
            >
              <polygon
                className='text-gray-900 fill-current'
                points='2560 0 2560 100 0 100'
              />
            </svg>
          </div>

          <div className='container mx-auto px-4 lg:pt-24 lg:pb-64'>
            <div className='flex flex-wrap text-center justify-center'>
              <div className='w-full lg:w-6/12 px-4'>
                <h2 className='text-4xl font-semibold text-white'>
                  Buidl something
                </h2>
                <p className='text-lg leading-relaxed mt-4 mb-4 text-gray-500'>
                  We enjoy buidling together.
                </p>
              </div>
            </div>
            <div className='flex flex-wrap mt-12 justify-center'>
              <div className='w-full lg:w-3/12 px-4 text-center'>
                <div className='text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center'>
                  <i className='fas fa-medal text-xl' />
                </div>
                <h6 className='text-xl mt-5 font-semibold text-white'>
                  Community
                </h6>
                <p className='mt-2 mb-4 text-gray-500'>
                  Trust is not only transactional.
                </p>
              </div>
              <div className='w-full lg:w-3/12 px-4 text-center'>
                <div className='text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center'>
                  <i className='fas fa-poll text-xl' />
                </div>
                <h5 className='text-xl mt-5 font-semibold text-white'>
                  Care
                </h5>
                <p className='mt-2 mb-4 text-gray-500'>
                  Shared truths create value.
                </p>
              </div>
              <div className='w-full lg:w-3/12 px-4 text-center'>
                <div className='text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center'>
                  <i className='fas fa-lightbulb text-xl' />
                </div>
                <h5 className='text-xl mt-5 font-semibold text-white'>
                  Learn
                </h5>
                <p className='mt-2 mb-4 text-gray-500'>
                  Listen to and tell better stories.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className='relative block py-24 lg:pt-0 bg-gray-900'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-wrap justify-center lg:-mt-64 -mt-48'>
              <div className='w-full lg:w-6/12 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300'>
                  <div className='flex-auto p-5 lg:p-10'>
                    <h4 className='text-2xl font-semibold'>
                      Want to work with us?
                    </h4>
                    <p className='leading-relaxed mt-1 mb-4 text-gray-600'>
                      Complete this form and we will get back to you in 24 hours.
                    </p>
                    <div className='relative w-full mb-3 mt-8'>
                      <label
                        className='block uppercase text-gray-700 text-xs font-bold mb-2'
                        htmlFor='full-name'
                      >
                        Full Name
                      </label>
                      <input
                        type='text'
                        className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
                        placeholder='Full Name'
                        style={{ transition: 'all .15s ease' }}
                      />
                    </div>

                    <div className='relative w-full mb-3'>
                      <label
                        className='block uppercase text-gray-700 text-xs font-bold mb-2'
                        htmlFor='email'
                      >
                        Email
                      </label>
                      <input
                        type='email'
                        className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
                        placeholder='Email'
                        style={{ transition: 'all .15s ease' }}
                      />
                    </div>

                    <div className='relative w-full mb-3'>
                      <label
                        className='block uppercase text-gray-700 text-xs font-bold mb-2'
                        htmlFor='message'
                      >
                        Message
                      </label>
                      <textarea
                        rows='4'
                        cols='80'
                        className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
                        placeholder='Type a message...'
                      />
                    </div>
                    <div className='text-center mt-6'>
                      <button
                        className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                        type='button'
                        style={{ transition: 'all .15s ease' }}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        {/* </section> */}
