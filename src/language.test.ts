import { getLanguageByCode, getLanguageOptions } from './language'

jest.mock('./config', () => ({
  config: {
    languages: [
      {
        code: '0033',
        name: 'french'
      },
      {
        code: '0034',
        name: 'spanish'
      }
    ]
  }
}))

const mockUser = {
  rawData: {}
}
jest.mock('./user', () => ({
  getUser: () => mockUser
}))

describe('language', () => {
  describe('getLanguageByCode', () => {
    it('should return the correct language', () => {
      const language = getLanguageByCode('0033')
      expect(language).toEqual({
        code: '0033',
        name: 'french'
      })
    })

    it('should return undefined if the language code is not found', () => {
      const language = getLanguageByCode('9999')
      expect(language).toBeUndefined()
    })
  })

  describe('getAvailableLanguages', () => {
    it('should return all languages if call_tag is not present', () => {
      const languages = getLanguageOptions()
      expect(languages).toEqual([
        { id: '0033', label: 'French' },
        { id: '0034', label: 'Spanish' }
      ])
    })

    it('should return the correct languages if call_tag is present', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?french'
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([{ id: '0033', label: 'French' }])
    })

    it('should return all languages if call_tag is present but empty', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?'
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([
        { id: '0033', label: 'French' },
        { id: '0034', label: 'Spanish' }
      ])
    })

    it('should return all languages if call_tag is present but does not match any language', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?german'
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([
        { id: '0033', label: 'French' },
        { id: '0034', label: 'Spanish' }
      ])
    })

    it('should return the correct languages if call_tag is present with multiple languages', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?french,german'
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([{ id: '0033', label: 'French' }])
    })

    it('should return the correct languages if call_tag is present with extra spaces', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?  french  ,  german  '
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([{ id: '0033', label: 'French' }])
    })

    it('should return the correct languages if call_tag is present with different casing', () => {
      mockUser.rawData = {
        call_tag: 'somevalue?FRENCH'
      }

      const languages = getLanguageOptions()

      expect(languages).toEqual([{ id: '0033', label: 'French' }])
    })
  })
})
