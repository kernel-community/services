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

const RINKEBY_CHAIN_ID = 4
const API_ROLE = 50
const API_NICKNAME = 'apiServer'
const DEFAULT_GROUP_IDS = []

const now = () => Date.now()

const build = async ({ projectId, seed, serviceAccount, infuraId, faucetAmount, authMemberId, rpcEndpoint }) => {

  // TODO: move to separate service
  const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${infuraId}`, RINKEBY_CHAIN_ID)
  const wallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), provider)

  const newToken = async () => 
    jwtService.createJwt(wallet, jwtService.AUTH_JWT,
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

  const ethereumFaucet = async ({ iss, role }, { chainId }) => {
    if (chainId != RINKEBY_CHAIN_ID) {
      console.log('unsupported network', chainId)
      return
    }
    const member = await members.get(iss)
    const memberAddress = member.data.wallet
    const tx = await wallet.sendTransaction({
      to: memberAddress,
      value: ethers.utils.parseEther(faucetAmount)
    })

    return { tx }
  }

  return {
    sendEmail, emailMember, emailMembers, rsvpCalendarEvent, followProject, syncGroupMembers, voteProposal,
    ethereumFaucet
  }
}

const taskQueue = { build }

export default taskQueue
