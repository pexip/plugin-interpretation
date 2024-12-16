import type { Language } from './types/Language'
import type { Role } from './types/Role'

interface Config {
  role: Role
  reusePin: boolean
  interpreter: {
    allowChangeDirection: boolean
  }
  listener: {
    mainFloorVolume: number
    speakToInterpretationRoom: boolean
  }
  languages: Language[]
}

const response = await fetch('./config.json')
const config: Config = await response.json()

export { config }
