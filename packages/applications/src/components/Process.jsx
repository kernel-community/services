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
        <li className='my-4 underline'>
          <strong>You have already created a wallet</strong>
        </li>
        <ul>
          <li className='mx-8 my-2'>
            If you haven't, it's not a problem. This page still applies to you, and you will be prompted to create a wallet when you begin.
          </li>
          <li className='mx-8 my-2'>
            Wallets do not work like usernames and passwords: they work with "keys". Keys are special secrets: a unique string of letters
            and numbers which give you access to your wallet. These keys are in the "json" file you downloaded when creating your wallet,
            though you can't see them directly, because we encrypt that file with your password to provide an extra layer of security for you.
          </li>
          <li className='mx-8 my-2'>
            It's OK if you don't understand what creating your own keys means, or how to keep them safe.
            We're here to <strong>learn together</strong>. Follow along as best you can, and continue to
            the application form when prompted. Though only you see your keys, we can help you make new ones
            while keeping your data safe, private, and under your control.
          </li>
        </ul>
        <li className='my-4 underline'>
          <strong>Respond to the questions as best you can</strong>
        </li>
        <ul>
          <li className='mx-8 my-2'>
            In the next step, you will be taken to our application form. When you click the "Apply Now" button, you will be signed into the
            application form with your new wallet, and you can respond to each of the questions.
          </li>
        </ul>
        <li className='my-4 underline'>
          <strong>Begin learning now!</strong>
        </li>
        <ul>
          <li className='mx-8 my-2'>
            All of our work, tools, and resources are free and open source. You do not need to wait for your application to be reviewed
            in order to start learning. We'll provide the best links we can after you submit your application. You can also use all the tools
            in the wallet you created right now: you do not need our permission.
          </li>
        </ul>
        <li className='my-4 underline'>
          <strong>Check your status</strong>
        </li>
        <ul>
          <li className='mx-8 my-2'>
            Come back here whenever you like, sign in, and see where your application is. We review applications on a
            rolling basis and will update you here and via email about any changes.
          </li>
        </ul>
      </ol>
    </div>
  </>
)

export default Process
