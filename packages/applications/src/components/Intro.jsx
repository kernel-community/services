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
    <h1 className='py-4 text-4xl'>KERNEL Application | Block 7, September 2022</h1>
    <div className='columns-1 md:break-after-column'>
      <Paragraph>Thank you for your interest in applying to the KERNEL Fellowship. We're excited to learn more about you.</Paragraph>
      <Paragraph>KERNEL is a curated, global community of talented individuals interested in building relationships, internet gardens, and projects in web3 — the frontier of web3.</Paragraph>
      <Paragraph>Each KERNEL Block comprises 300 individuals, 8 weeks, and 16 modules - laying the groundwork for a unique experience to introduce you to the heart of KERNEL.</Paragraph>
      <Paragraph>A note to consider:</Paragraph>
      <Paragraph>Fellows who felt most fulfilled entered the KERNEL Block with an intention or question they explored through the lens of KERNEL; dedicated ~5 hours to activities each week; and attended one IRL event with their Co-Fellows.</Paragraph>
      <Paragraph>Application Deadline: June 15, 2022</Paragraph>
      <Paragraph>Kickoff: September 9, 2022</Paragraph>
    </div>
  </>
)

export default Intro
