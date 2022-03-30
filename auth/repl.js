//
// .load repl.js
//
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/services/jwt.js').then((e) => global.jwtService = e.default),
  import('./src/services/auth.js').then((e) => global.authService = e.default),
  import('./src/services/entity.js').then((e) => global.entityService = e.default),
  import('./src/services/rpcClient.js').then((e) => global.rpcClient = e.default)
]).then((e) => {
  global.wallet = ethers.Wallet.createRandom()
  global.clientJwt = async () => jwtService.createJwt(wallet,
    jwtService.CLIENT_JWT, jwtService.clientPayload({ iss: wallet.address, nickname: 'foo' }))
  global.authClient = async (jwtFn) => rpcClient.build({ rpcEndpoint: 'http://localhost:3000/auth/rpc', jwtFn })
  global.storageClient = async (jwtFn) => rpcClient.build({ rpcEndpoint: 'http://localhost:3000/storage/rpc', jwtFn })
})

