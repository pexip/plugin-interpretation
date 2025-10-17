import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import { logger } from './logger'

export const initI18n = async (): Promise<void> => {
  await i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json'
      }
    })
}

initI18n().catch((error: unknown) => {
  logger.error(error)
})

export default i18n
