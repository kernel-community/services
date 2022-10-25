/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const AppIntro = ({ onLogin }) => {
  return (
    <>
      <p className='my-4'>
        This page will help you apply to Kernel: a custom educational community, made up by people from across the planet.
      </p>
      <p className='my-4'>
        Our goal is to <strong>learn together</strong>. Our principles are <strong>do no harm</strong> and <strong>play, infinitely</strong>.
        Our primary method of learning is conversation. Together, this enables us to cultivate a culture of care.
      </p>
      <p className='my-4'>
        There are a few steps to our application process. We encourage you to <strong>set aside ~20 minutes for this</strong>.
        Taking your time will help us get to know each other in a more wholesome way.
      </p>
      <p className='my-4'>
        If you have already gone through the process, you can check your status by <button className='text-blue-600 visited:text-purple-600 cursor-pointer' onClick={onLogin}>clicking here</button>.
      </p>
    </>
  )
}

export default AppIntro
