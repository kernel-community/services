/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

// an experience around Devcon IV in Prague
const GENESIS = 1541272500000

const build = async ({
	epoch = BigInt(GENESIS),
	workerId = 0n, 
	workerIdBits = 5n,
	datacenterId = 0n,
	datacenterIdBits = 5n,
	sequenceBits = 12n
	} = {}) => {

    let lastTimestamp = -1n
    let sequence = 0n

    const maxWorkerId = -1n ^ (-1n << workerIdBits)
    if (workerId < 0 || workerId > maxWorkerId) {
      throw {
        name: 'SnowflakeError',
        message: `With ${workerIdBits} bits, worker id can't be greater than ${maxWorkerId} or less than 0`
      }
    }

    const maxDatacenterId = -1n ^ (-1n << datacenterIdBits)
    if (datacenterId > maxDatacenterId || datacenterId < 0) {
      throw {
        name: 'SnowflakeError',
        message: `With ${datacenterIdBits} bits, datacenter id can't be greater than ${maxDatacenterId} or less than 0`
      }
    }

    const sequenceMask = -1n ^ (-1n << sequenceBits)
    const workerIdShift = sequenceBits
    const datacenterIdShift = sequenceBits + workerIdBits
    const timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits

    const now = () => BigInt(Date.now())

    const tilNextMillis = (lastTimestamp) => {
      let timestamp

      do {
        timestamp = now()
      } while (timestamp <= lastTimestamp)

      return timestamp
    }

    const nextId = () => {
      let timestamp = now()

      if (timestamp < lastTimestamp) {
        throw { 
          name: 'SnowflakeError',
          message: `Clock moved backwards. Can't generate new ID for ${lastTimestamp - timestamp}ms`
        }
      }

      if (timestamp === lastTimestamp) {
        sequence = (sequence + 1n) & sequenceMask
        if (sequence === 0n) {
          timestamp = tilNextMillis(lastTimestamp)
        }
      } else {
        sequence = 0n
      }

      lastTimestamp = timestamp

      return (
        ((timestamp - epoch) << timestampLeftShift) |
        (datacenterId << datacenterIdShift) |
        (workerId << workerIdShift) |
        sequence
      )
    }

    return { nextId }
}

const snowflake = { build }

export default snowflake
