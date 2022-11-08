/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Paragraph = ({ children }) =>
  <p className='py-4'>{children}</p>

const Intro = () => (
  <>
    <h1 className='py-4 text-4xl'>KERNEL Community Application</h1>
    <div className='columns-1 md:break-after-column'>
      <Paragraph>This application is the start of your Kernel Unprofile. Rather than project what you think others want to hear, we ask that you speak the truth with love. This is what serves our core goal, which is to <strong>learn together</strong>.</Paragraph>
      <Paragraph>What you write here will be visible to current fellows. We value honesty, sincerity, simplicity, and a diversity of skills and interests. <a className='text-blue-600 visited:text-purple-600' href='https://www.kernel.community/en/start/principled-people/' target='_blank' rel='noreferrer'>Our principles</a> are <strong>do no harm</strong> and <strong>play, infinitely</strong>.</Paragraph>
      <Paragraph>The purpose of this form is to take care when getting to know each other, but we know that these forms can be stressful. We hope that you feel invited to explore and push the boundaries of your capabilities in Kernel in an authentic way. Stay true to yourself, and speak your truth with love. You are valuable just as you are.</Paragraph>
      <Paragraph>You can save your application and submit it whenever you are ready.</Paragraph>
    </div>
  </>
)

export default Intro
