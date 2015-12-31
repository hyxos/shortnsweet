require(`babel-core/register`)

import express from 'express'
import shortid from 'shortid'
import bodyParser from 'body-parser'
import redis from 'redis'

const port = 3000
const base = `http://localhost:${port}`
const client = redis.createClient()
const app = express()
  .set(`views`, __dirname + `/views`)
  .use(express.static(__dirname + `/static`))
  .set(`view engine`, `jade`)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .get(`/`, (req, res) => res.render(`index`))
  .post(`/`, (req, res) => {
    let url = req.body.url
    let id = shortid.generate()
    client.set(id, url, () => res.render(`output`, {
      link: `${base}/${id}`
    }))
  })
  .get(`/:id`, (req, res) => {
    let id = req.params.id.trim()
    client.get(id, (err, reply) => {
      if(!err && reply) {
        res.status(301)
        res.set(`Location`, reply)
        res.send()
      } else {
        res.status(404)
        res.render(`error`)
      }
    })
  })
  .listen(port, () => console.log(`magic happens on ${port}`))
