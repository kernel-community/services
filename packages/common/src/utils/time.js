/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Credits: https://stackoverflow.com/a/68121710
const timeScalars = [1000, 60, 60, 24, 7, 52]
const timeUnits = ['ms', 'secs', 'min', 'hr', 'day', 'week', 'year']

const humanize = (ms, dp = 0) => {
  let timeScalarIndex = 0; let scaledTime = ms

  while (scaledTime > timeScalars[timeScalarIndex]) {
    scaledTime /= timeScalars[timeScalarIndex++]
  }

  const i = scaledTime.toFixed(dp)
  const unit = timeUnits[timeScalarIndex]
  const pluralize = i > 1 && unit.slice(-1) !== 's' ? 's' : ''
  return `${i} ${unit}${pluralize} ago`
}

export default { humanize }
