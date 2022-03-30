/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import jwtService from 'common/src/services/jwt.js'

import Navbar from './../components/Navbar.js'
import FooterSmall from './../components/FooterSmall.js'

import bgImage from './../assets/images/admin_bg.png'

const AUTH_URL = process.env.REACT_APP_AUTH_URL
const AUTH_MESSAGE_TYPE = 'kernel.auth'
const AUTH_TIMEOUT_MS = 1000 * 60
const ADMIN_ROLE = 'root'

const message = (event, payload) => { return {type: AUTH_MESSAGE_TYPE, event, payload} }
const reply = (source, target, event, payload) => source.postMessage(message(event, payload), target)

const Register = () => {

  const [token, setToken] = useState(null)
  const [source, setSource] = useState(null)
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState('')

  let lastEvent = null
  let jwt = null

  const navigate = useNavigate()

  const handleMessage = (messageEvent) => {
    console.log(messageEvent)
    const { data: {type, event, payload}, source, origin } = messageEvent
    if (!type || type !== AUTH_MESSAGE_TYPE) {
      return
    }
    setSource(source)
    setWebsite(origin)
    lastEvent = event
    switch (event) {
      case 'ping':
        reply(source, origin, 'pong', {})
        break;
      case 'pong':
        break;
      case 'jwt':
        jwt = payload
        break;
    }
  }

  const walletLogin = async () => {
    const auth = window.open(AUTH_URL, '_blank')
    window.addEventListener('message', handleMessage)
    try {
      const pong = await new Promise((resolve, reject) => {
        const ts = Date.now()
        const sync = () => {
          if (lastEvent && lastEvent === 'pong') {
            return resolve('synced')
          }
          if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
            console.log('timeout', Date.now(), ts)
            return reject('timeout')
          }
          reply(auth, AUTH_URL, 'ping', {})
          setTimeout(sync, 300)
        }
        setTimeout(sync, 300)
      })
      const authToken = await new Promise((resolve, reject) => {
        const ts = Date.now()
        const sync = () => {
          if (lastEvent && lastEvent === 'jwt') {
            return resolve('authed')
          }
          if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
            console.log('timeout', Date.now(), ts)
            return reject('timeout')
          }
          setTimeout(sync, 100)
        }
        setTimeout(sync, 100)
      })
      auth.close()
      setToken(jwt)
      const {header, payload: user, signature} = jwtService.decode(jwt)

      console.log(user, ADMIN_ROLE)
      window.user = user
      if (user.roles.includes(ADMIN_ROLE)) {
        return navigate('/dashboard', { state: { user, jwt} })
      }
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

	return (
    <div>
      <Navbar transparent />
        <main>
          <section className="relative md:pt-32 pb-32 pt-12">
            <div
              className="absolute top-0 w-full h-full bg-gray-900"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "100%",
                backgroundRepeat: "no-repeat"
              }}
            ></div>
            <div className="container mx-auto px-4 h-full">
              <div className="flex content-center items-center justify-center h-full">
                <div className="w-full lg:w-4/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0">
                    <div className="rounded-t mb-0 px-6 py-6">
                      <div className="text-center">
                        <button
                          className="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
                          onClick={ walletLogin }
                          type="button">
                          Login with Kernel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <FooterSmall absolute />
          </section>
        </main>
    </div>
  )
}

export default Register
