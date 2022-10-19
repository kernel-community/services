/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { ethers } from 'ethers'

import google from './google.js'
import jwtService from './../../../auth/src/services/jwt.js'
import entityBuilder from './../../../auth/src/services/entity.js'
import rpcClientBuilder from './../../../auth/src/services/rpcClient.js'

const EXTERNAL_ROLE = 2000
const MEMBER_ROLE = 1000

const RINKEBY_CHAIN_ID = 4
const GOERLI_CHAIN_ID = 5
const API_ROLE = 50
const API_NICKNAME = 'apiServer'
const DEFAULT_GROUP_IDS = []

const NONCE_PADDING = 12
const CHAINID_PADDING = 12
const HEIGHT_PADDING = 12
const INDEX_PADDING = 6

const now = () => Date.now()

const build = async ({ projectId, seed, serviceAccount, infuraId, faucetAmount, authMemberId, rpcEndpoint }) => {

  // TODO: move to separate service
  const rinkebyProvider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${infuraId}`, RINKEBY_CHAIN_ID)
  const rinkebyWallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), rinkebyProvider)
  const goerliProvider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${infuraId}`, GOERLI_CHAIN_ID)
  const goerliWallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), goerliProvider)

  const wallets = {
    [RINKEBY_CHAIN_ID]: rinkebyWallet,
    [GOERLI_CHAIN_ID]: goerliWallet
  }

  const newToken = async () => 
    jwtService.createJwt(rinkebyWallet, jwtService.AUTH_JWT,
      jwtService.authPayload({ iss: authMemberId, nickname: API_NICKNAME, role: API_ROLE, groupIds: DEFAULT_GROUP_IDS }))
  let jwtToken = await newToken()
  const jwtFn = async () => {
    const {payload: { exp } } = jwtService.decode(jwtToken)
    if (exp - now() < 1000 * 60 * 5) {
      jwtToken = await newToken()
    }
    return jwtToken
  }
  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn })
  const entityClient = entityBuilder.build.bind(null, { rpcClient })

  // entities
  const members = await entityClient({ resource: 'member' })
  const projects = await entityClient({ resource: 'project' })
  const profiles = await entityClient({ resource: 'profile' })
  const groups = await entityClient({ resource: 'group' })
  const proposals = await entityClient({ resource: 'proposal' })
  const transactions = await entityClient({ resource: 'transaction' })
  const applications = await entityClient({ resource: 'application' })
  const reviews = await entityClient({ resource: 'review' })

  // google services
  const googleServices = await google.build({ projectId, serviceAccount })

  // TODO: move
  const generateEmail = (to, subject, message) => {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      `${message}`
    ].join('\n')
    return Buffer.from(email).toString('base64url')
  }

  const sendEmail = async ({ iss, role }, { to, subject, message }) => {
    const raw = generateEmail(to, subject, message)
    const result = await googleServices.sendEmail(raw)
    return result
  }

  const emailMember = async ({ iss, role }, { id, subject, template }) => {
    const { data: {profileId} } = await members.get(id)
    if (!profileId) {
      return `no profile for member ${id}`
    }
    const profile = await profiles.get(profileId)
    const { consent, email, name, pronouns, city } = profile.data
    if (consent) {
      // TODO: find better solution 
      const populatedSubject = eval('`' + subject + '`')
      const populatedMessage = eval('`' + template + '`')
      const raw = generateEmail(email, populatedSubject, populatedMessage)
      const result = await googleServices.sendEmail(raw)
      return result
    }
    return `not allowed to email member ${id}`
  }

  const emailMembers = async ({ iss, role }, { subject, template }) => {
    let i = 0
    const allProfiles = await profiles.getAll()
    for (const profile of allProfiles) {
      const { consent, email, name, pronouns, city } = profile.data
      if (consent) {
        i++
        // TODO: find better solution
        const populatedSubject = eval('`' + subject + '`')
        const populatedMessage = eval('`' + template + '`')
        const raw = generateEmail(email, populatedSubject, populatedMessage)
        await googleServices.sendEmail(raw)
      }
    }
    return `emailed ${i} members`
  }

  const rsvpCalendarEvent = async ({ iss, role }, { calendarId, eventId }) => {
    const { email } = await profiles.get(iss)
    const patchedEvent = await googleServices.patchCalendarEvent(calendarId, eventId, {
      attendees: [{ email, responseStatus: 'accepted' }]
    })
    return patchedEvent
  }

  const followProject = async ({ iss, role }, id) => {
    const updated = await projects.patch(id, { followerIds: [iss] })
    // TODO: should we have a tasks resource and record a return value?
    return updated
  }

  // basic set operations
  const superset = (set, subset) => [...subset].reduce((acc, e) => acc && set.has(e), true)
  const difference = (a, b) => [...a].reduce((acc, e) => b.has(e) ? acc : [...acc, e], [])
  const intersection = (a, b) => [...a].reduce((acc, e) => b.has(e) ? [...acc, e] : acc, [])

  const syncGroupMembers = async ({ iss, role }, { groupId, memberIds }) => {
    const group = await groups.get(groupId)
    const existingIds = new Set(group.data.memberIds)
    const newIds = new Set(memberIds)

    const removeIds = difference(existingIds, newIds)
    const addIds = difference(newIds, existingIds)
    const unchangedIds = intersection(newIds, existingIds)
    console.log('groups', groupId, removeIds, addIds, unchangedIds)

    for (const memberId of removeIds) {
      const member = await members.get(memberId)
      const groupIds = member.data.groupIds ?
        member.data.groupIds.filter((e) => e !== groupId) : []
      const data = {...member.data, groupIds}
      await members.update(memberId, data)
    }
    for (const memberId of addIds) {
      await members.patch(memberId, { groupIds: [groupId] })
    }

    const data = {...group.data, memberIds }
    const updatedGroup = await groups.update(groupId, data) 

    return { groupId, removeIds, addIds, existingIds, updatedGroup } 
  }

  const voteProposal = async ({ iss, role }, { proposalId, choice }) => {
    const proposal = await proposals.patch(proposalId, { votes: { [iss]: choice }})
    return { proposal }
  }

  // TODO: DRY
  const CHOICES = [
    { emoji: 'unicorn', code: '129412', weight: 5 },
    { emoji: 'ok_hand', code: '128076', weight: 4 },
    { emoji: 'clap', code: '128079', weight: 3 },
    { emoji: 'thumbs up', code: '128077', weight: 2 },
    { emoji: 'thumbs down', code: '128078', weight: 1 }
  ]

  const WEIGHTS = CHOICES.reduce((acc, { code, weight }) => ({ ...acc, [code]: weight }), {})

  const MIN_SCORE = 15

  const promote = (votes) => {
    const init = CHOICES.reduce((acc, { code, weight }) => ({ ...acc, [code]: 0 }), {})
    const sum = !votes
      ? init
      : Object.values(votes).reduce((acc, e) => {
        return { ...acc, [e]: (acc[e] + 1) }
      }, init)
    const score = Object.entries(sum)
      .reduce((acc, [code, cnt]) => acc + WEIGHTS[code] * cnt, 0)
    return score >= MIN_SCORE ? true : false
  }

  const voteReview = async ({ iss, role }, { reviewId, choice }) => {
    const review = await reviews.patch(reviewId, { votes: { [iss]: choice }})
    if (!promote(review.data.votes)) {
      return { review }
    }
    // upgrade to member status
    await reviews.patch(reviewId, { status: 'accepted' })
    const { owner, data: { email, name }} = await applications.get(review.data.applicationId)
    await members.patch(owner, { role: MEMBER_ROLE })

    // send email
    if (email) {
      const subject = `${name}, welcome to the Kernel Community`
      const message = `The family of Kernel apps are now available through your Kernel Wallet.`
      await googleServices.sendEmail(generateEmail(email, subject, message))
    }
    return { review }
  }

  // External
  const submitApplication = async ({ iss, role }, { data }) => {
    if (role < EXTERNAL_ROLE) {
      console.debug(`Already a member ${iss}, ${role}`)
      return
    }
    const { data: { applicationId } } = await members.get(iss)
    if (applicationId) {
      const patched = await applications.patch(applicationId, data)
      return { application: patched }
    }
    const application = await applications.create(data, { owner: iss })
    const review = await reviews.create({ applicationId: application.id, status: 'new' })
    const member = await members.patch(iss, { applicationId: application.id })

    return { application }
  }

  const ethereumFaucet = async ({ iss, role }, { chainId }) => {
    const wallet = wallets[chainId]
    if (!wallet) {
      console.log('unsupported network', chainId)
      return {}
    }
    const member = await members.get(iss)
    const memberAddress = member.data.wallet
    const transaction = await wallet.sendTransaction({
      to: memberAddress,
      value: ethers.utils.parseEther(faucetAmount)
    })

    const { nonce, value } = transaction
    console.log('waiting for transaction receipt', transaction)
    const receipt = await transaction.wait()

    Object.assign(receipt, { nonce, chainId, value })
    const { to, from, blockNumber, transactionIndex } = receipt
    const paddedHeight = blockNumber.toString().padStart(HEIGHT_PADDING, '0')
    const paddedIndex = transactionIndex.toString().padStart(INDEX_PADDING, '0')
    const paddedNonce = nonce.toString().padStart(NONCE_PADDING, '0')
    const paddedChainId = chainId.toString().padStart(CHAINID_PADDING, '0')

    const fromId = `from/${from}/${paddedChainId}-${paddedNonce}`
    const toId = `to/${to}/${paddedChainId}-${paddedHeight}-${paddedIndex}`

    await transactions.create({...receipt, id: toId}, {id: toId})
    const savedTx = await transactions.create({...receipt, id: fromId}, {id: fromId})
    return { savedTx }
  }

  return {
    sendEmail, emailMember, emailMembers, rsvpCalendarEvent, followProject, syncGroupMembers, voteProposal,
    submitApplication, voteReview, ethereumFaucet
  }
}

const taskQueue = { build }

export default taskQueue
