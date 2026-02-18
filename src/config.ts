import type { Language } from './types/Language'
import type { Role } from './types/Role'

interface Config {
  role: Role
  reusePin: boolean
  interpreter?: {
    allowChangeDirection: boolean
  }
  listener?: {
    mainFloorVolume: number
    speakToInterpretationRoom: boolean
  }
  languages: Language[]
}

const response = await fetch('./config.json')
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
const config: Config = (await response.json()) as Config

config.languages = config.languages.map((language) => ({
  ...language,
  name: language.name.trim().toLowerCase()
}))

export { config }
