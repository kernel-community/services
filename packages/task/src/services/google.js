/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { Impersonated } from 'google-auth-library'
import { google } from 'googleapis'

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify'
]
const DEFAULT_SUBJECT = 'hello@kernel.community'

const build = async ({ projectId, serviceAccount, scopes = DEFAULT_SCOPES, subject = DEFAULT_SUBJECT }) => {
  const auth = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes, subject)

  const calendar = google.calendar({version: 'v3', auth})
  const gmail = google.gmail({version: 'v1', auth})

  const listCalendar = () => {

  }

  const sendEmail = (raw) => {
    return gmail.users.messages.send({
      userId: subject,
      requestBody: { raw }
    })
  }

  return { sendEmail, listCalendar }
}

const service = { build }

export default service 
