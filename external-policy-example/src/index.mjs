import express from 'express'
import {
  handleServiceConfiguration,
  handleParticipantProperties
} from './policy.mjs'

const HOST = process.env.HOST ?? '0.0.0.0'
const PORT = process.env.PORT ?? 3000

const app = express()
app.use(express.json())

app.get('/policy/v1/service/configuration', async (req, res) => {
  const { local_alias: localAlias, remote_display_name: remoteDisplayName, vendor } = req.query

  const response = await handleServiceConfiguration(localAlias, remoteDisplayName, vendor)

  console.log(
    `[service-config] local_alias=${localAlias} → action=${response.action}, result=${JSON.stringify(response.result)}`
  )

  return res.json(response)
})

app.get('/policy/v1/participant/properties', async (req, res) => {
  const {local_alias: localAlias, remote_display_name: remoteDisplayName, vendor } = req.query

  const response = await handleParticipantProperties(localAlias, remoteDisplayName, vendor)

  console.log(
    `[participant] local_alias=${localAlias} remote_display_name=${remoteDisplayName ?? ''} → call_tag=${response.result.call_tag ?? '(none)'}`


  )

  return res.json(response)
})

app.listen(PORT, HOST, () => {
  console.log(`External-policy server listening on http://${HOST}:${PORT}`)
})
