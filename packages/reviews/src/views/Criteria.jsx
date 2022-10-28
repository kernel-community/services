/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Page from 'components/Page'

const H1 = ({ children }) =>
  <h1 className='py-4 text-4xl text-center'>{children}</h1>
const H2 = ({ children }) =>
  <h2 className='py-4 text-2xl'>{children}</h2>
const Paragraph = ({ children }) =>
  <p className='py-4'>{children}</p>

const Criteria = () => {
  return (
    <Page>
      <div className='px-2 sm:px-8 lg:px-16 lg:w-3/4 lg:mx-auto'>
        <H1>
          “How do we find the others?”
        </H1>
        <div className='columns-1 md:break-after-column'>
          <Paragraph>
            First and foremost: this is all about <strong>you</strong>. The simplest lens is most powerful and, for each application, begin with just one question:
          </Paragraph>
          <Paragraph>
            <strong>“Is this someone I’d like to share time with?”</strong>
          </Paragraph>
          <Paragraph>
            We want the process to be simple, while still encouraging some reflection. As such, we ask that you simply give a thumbs up or thumbs down, but under three different categories: <strong>Sincerity, Skillfulness, Interest</strong>. These are intentionally broad: does skillfulness mean the actual skills someone has, or the manner in which they respond? Does interest mean they are interesting, or you are interested in them? We leave you to decide this.
          </Paragraph>
          <H2>
            The Golden Mean
          </H2>
          <Paragraph>
            Reviews are all about the middle way. This process is how we practice and learn more about how dynamic the middle really is. We’re looking for people who are:
          </Paragraph>
          <ol className='list-decimal px-12'>
            <li className='my-4'>
              <strong>honest</strong> without being overly explicit and burdensome;
            </li>
            <li className='my-4'>
              <strong>simple</strong> without being short, dismissive, or lazy;
            </li>
            <li className='my-4'>
              <strong>passionate and enthusiastic</strong> without being naive;
            </li>
            <li className='my-4'>
              <strong>kind and caring</strong> without expecting to be acknowledged for it;
            </li>
            <li className='my-4'>
              <strong>sincere and intentional</strong> without making you feel like they’re trying too hard.
            </li>
          </ol>
          <Paragraph>
            This middle way of being is critical. For instance, we don’t really care about professional backgrounds, but they can be helpful in figuring out how likely someone is to make the most of their time in Kernel and contribute back to the community. Just don’t be blinded and automatically mark anyone who’s worked at Google as interesting, or - on the flip side - write them off as someone who will never understand the benefits of distributed systems.
          </Paragraph>
          <H2>
            Via Negativa
          </H2>
          <Paragraph>
            Rather than defining further, and therefore limiting, what makes a “good” application, let’s look at some anti-patterns: red flags that suggest an applicant may not be a good fit.
          </Paragraph>
          <ol className='list-decimal px-12'>
            <li className='my-4'>
              Lots of buzzwords used to obscure meaning, rather than to illuminate it.
            </li>
            <li className='my-4'>
              Appeals to authority and name-dropping: “I know so-and-so”, “I worked on xyz in 2015”, “I knew about Bitcoin before anyone else did”, “I come from McKinsey” etc. We are not as interested in who pays you as in finding out what makes you come alive.
            </li>
            <li className='my-4'>
              Short answers that feel ill-considered and rushed. You know this when you feel:
              <ul className='px-12 list-disc'>
                <li className='my-4'>
                  This person didn’t read or understand the question or
                </li>
                <li className='my-4'>
                  You learnt nothing meaningful about them from their answer
                </li>
              </ul>
            </li>
            <li className='my-4'>
              Long answers that feel bloated and irrelevant. You know this when you find yourself:
              <ul className='px-12 list-disc'>
                <li className='my-4'>
                  skimming over the answer
                </li>
                <li className='my-4'>
                  getting distracted by other tabs and wandering off
                </li>
              </ul>
            </li>
            <li className='my-4'>
              Unironic “tech-bro” language. We care about diversity, and people who are in it to make a quick buck (without a nuanced understanding of what making money can now mean) tend not to fit well with our culture of care.
            </li>
          </ol>
          <Paragraph>
            We are looking for carefully considered and crafted answers. After a while, you’ll know them when you see them. They feel like mountains carved down to pebbles. Such answers are aware of context and are well informed, without being stuffed full of buzzwords and hot air. They make you want to read each word, because it feels weighty. It feels like it really matters to this person, not like they wrote it between meetings on a single moment’s thought.
          </Paragraph>
          <Paragraph>
            That said, there is also something spontaneous, natural, and joyful about good answers. They are mysteriously revealing. They combine humour with sincerity, irony with insight. As a general rule of thumb, more detail is indicative of greater effort, intention, and care. However, we don’t value needless verbosity: sometimes great answers are a single sentence long.
          </Paragraph>
          <Paragraph>
            Finally, if you do find yourself distracted, wandering off, or frustrated, remember that reviews are a practice. Notice yourself in these moments: it is neither good nor bad. Just notice how you are and use this as another opportunity to engage in self-enquiry and a reflective, well-examined life. Feel free to take a break whenever and come back when you are once again ready to look carefully into all the other mirrors in this infinite, living hall.
          </Paragraph>
          <H2>
            Harmonising Notes
          </H2>
          <Paragraph>
            We expect these criteria to remain fairly stable, though their application will change continuously. Remember: this is all about the middle way and the middle way is dynamic. Reviews are all about you and who you want to share your time with as we play increasingly infinite games with each other, always recognising that we are each other’s environment.
          </Paragraph>
          <Paragraph>
            As the community grows and changes based on this process, the way people interpret these guidelines will also change. That is wonderful and something we should all welcome so that discussing them and how we apply such criteria is done in an open, convivial, and equally continuous fashion.
          </Paragraph>
        </div>
      </div>
    </Page>
  )
}

export default Criteria
