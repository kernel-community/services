/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useServices, Navbar } from '@kernel/common'

import AppConfig from 'App.config'
import Sidebar from 'components/Sidebar.js'

const Button = ({ text, handler }) => (
  <button
    onClick={handler}
    className='bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1'
  >
    {text}
  </button>)

const emailMember = async (service, setError, member, subject, template, e) => {
  e.preventDefault()
  setError('')
  if (!member.length || !subject.length || !template.length) {
    return setError('missing fields')
  }
  try {
    await service.emailMember({ id: member, subject, template })
  } catch (error) {
    setError(error.message)
  }
}

const emailMembers = async (service, setError, subject, template, e) => {
  e.preventDefault()
  setError('')
  if (!subject.length || !template.length) {
    return setError('missing fields')
  }
  try {
    await service.emailMembers({ subject, template })
  } catch (error) {
    setError(error.message)
  }
}

const Page = () => {
  const navigate = useNavigate()
  const { services, currentUser } = useServices()
  const user = currentUser()

  const [service, setService] = useState()
  const [error, setError] = useState('')
  const [member, setMember] = useState('')
  const [subject, setSubject] = useState('')
  const [template, setTemplate] = useState('')

  global.setError = setError
  useEffect(() => {
    // TODO: expired token
    if (!user || user.role > AppConfig.adminRole) {
      return navigate('/')
    }

    (async () => {
      const { taskService } = await services()
      setService(taskService)
    })()
  }, [navigate, services, user])

  return (
    <>
      <Sidebar />
      <div className='relative md:ml-64 bg-blueGray-100'>
        <Navbar title={AppConfig.appTitle} />
        {/* Header */}
        <div className='relative bg-amber-200 md:pt-32 pb-32 pt-12'>
          <div className='px-4 md:px-10 mx-auto w-full' />
        </div>
        <div className='px-4 md:px-10 mx-auto w-full'>
          <div className='block w-full overflow-x-auto'>
            <div className='items-center w-full'>
              <form>
                <label>Member ID</label>
                <input className='border border-black outline outline-1 w-full' value={member} onChange={(e) => setMember(e.target.value)} />
                <label>Subject</label>
                <input className='border border-black outline outline-1 w-full' value={subject} onChange={(e) => setSubject(e.target.value)} />
                <label>Email Template</label>
                <textarea rows='15' className='border border-black outline outline-1 w-full' value={template} onChange={(e) => setTemplate(e.target.value)} />
                <Button text='Send' handler={emailMember.bind(null, service, setError, member, subject, template)} />
                <Button text='Send All' handler={emailMembers.bind(null, service, setError, subject, template)} />
                {error &&
                  <p className='border-0 px-3 py-3 placeholder-gray-400 text-red-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
                    {error}
                  </p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
