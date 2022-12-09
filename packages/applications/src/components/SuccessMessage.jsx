/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getUrl } from '@kernel/common'

const SuccessMessage = () => {
  const walletLink = `${getUrl('wallet') + '/portal/overview'}`
  return (
    <div className='mb-auto mt-10 py-20 px-20 sm:px-40 lg:px-80'>
      <h3 className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
        Success! You have submitted.
      </h3>
      <p className='my-8'>
        Thank you so much for submitting an application. You should get an email from us shortly confirming receipt.
      </p>
      <p className='my-8'>
        We do reviews on a rolling basis, and how long your review takes can therefore vary, depending on the time of year and how many
        current fellows are available to review new applicants. We will communicate the status of your application both here and via email. Feel
        free to log back into this app whenever you like to check your current status.
      </p>
      <p className='my-8'>
        That said, you do not need to wait for a review in order to begin learning. All our tools are free and open source. You can
        <a className='text-blue-600 visited:text-purple-600' href={walletLink}> return to the wallet</a> to begin learning by doing.
        You can read<a className='text-blue-600 visited:text-purple-600' href='https://kernel.community/en/learn/' target='_blank' rel='noreferrer'> the syllabus</a>,
        learn from <a className='text-blue-600 visited:text-purple-600' href='https://kernel.community/en/build' target='_blank' rel='noreferrer'>everything we build</a>,
        watch <a className='text-blue-600 visited:text-purple-600' href='https://www.youtube.com/channel/UC2kUaSgR0L-uzGkNsOxSxzw' target='_blank' rel='noreferrer'>all our recordings</a>,
        and use or adapt <a className='text-blue-600 visited:text-purple-600' href='https://github.com/kernel-community/' target='_blank' rel='noreferrer'>all our code </a>.
        Even better: creating your own keys enables you to use many of our best tools right now. Your new account will help you learn how to mint tokens,
        deploy your own contracts, decode transactions on a blockchain and much more. You do not need our permission to use it, and you can start right now...
      </p>
    </div>
  )
}

export default SuccessMessage
