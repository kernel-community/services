/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Paragraph = ({ children }) =>
  <p className='p-4'>{children}</p>

const Intro = () => (
  <>
    <h1 className='py-4 text-4xl'>KERNEL Community Application</h1>
    <div className='columns-1 md:break-after-column'>
      <Paragraph>This application is the start of your Kernel Unprofile.</Paragraph>
      <Paragraph>What you write here will be visible to a group of current fellows who review applications.</Paragraph>
      <Paragraph>If you are accepted, you’ll be able to update it continuously. It is your data and you are in control. This also means you are responsible for how it appears. The interplay of control and responsibility is one of the <a className='text-blue-600 visited:text-purple-600' href='https://www.kernel.community/en/learn/module-0/play-of-pattern/' target='_blank' rel='noreferrer'>complementary opposites</a> on which Kernel is based.</Paragraph>
    </div>
  </>
)

export default Intro
