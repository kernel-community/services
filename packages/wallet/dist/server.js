import http from 'http'

const host = '0.0.0.0'
const port = process.env.PORT || 3000

const HEADERS = { 'Content-Type': 'text/plain' }
const RESPONSE = JSON.stringify({'status':'ok'})

const dummy = (req, res) => {
  res.writeHead(200, HEADERS)
  res.end(RESPONSE)
}

const server = http.createServer(dummy)
server.listen(port, host, () => console.log(`listening on ${host}:${port}`))
