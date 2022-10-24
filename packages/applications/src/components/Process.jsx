/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Process = () => (
    <>
      <h1 className='py-4 text-4xl'>The Process</h1>
      <div className='columns-1 md:break-after-column'>
        <ol className='list-decimal px-12'>
            <li className='my-4'>
            Create your keys. Keys are different to a username + password combination. Keys imply cryptography, which sounds complicated, but its really here to help you. Being given control of your 'private key' in a safe, educational environment means you can start your learning journey right now.
            </li>
            <li className='my-4'>
            It's OK if you don't understand what creating your own keys means, or how to keep them safe. We're here to <strong>learn together</strong>. Follow along as best you can, and continue to the application form when prompted. Though you are the only one who can see your keys, we can help you make new ones while keeping your data safe, private, and under your control.
            </li>
            <li className='my-4'>
            Once you have created your keys, you will be redirected to an application form. Respond to the questions as best you can and click 'Submit' once you are happy.
            </li>
            <li className='my-4'>
            Come back here whenever you like, login, and check your status. We review applications on a rolling basis and will update you here and via email about any changes.
            </li>
        </ol>
      </div>
    </>
  )
  
export default Process