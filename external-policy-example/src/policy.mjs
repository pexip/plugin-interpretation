import { pexHash, pexTail } from './hash.mjs'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Regex that matches main-room aliases (e.g. 2-digit numbers).
const MAIN_ROOM_REGEX = /^\d{2}$/

// Regex that matches interpretation-room aliases (e.g. 6-digit numbers).
const INTERPRETATION_ROOM_REGEX = /^\d{6}$/

// Static PINs used when dynamic PIN generation is disabled.
const STATIC_PIN = '1234'
const STATIC_GUEST_PIN = '4321'

// Set to `true` to enable dynamic PIN generation based on call tags.
// When enabled the participant policy will generate a call_tag and the
// service configuration policy will derive PINs from it.
const DYNAMIC_PINS = true

// A shared secret used exclusively when DYNAMIC_PINS is enabled.
// Changing this value invalidates all previously generated call tags.
const SECRET = 'my_secret_value'

// ---------------------------------------------------------------------------
// Service configuration policy
// ---------------------------------------------------------------------------

/**
 * Handle the `/policy/v1/service/configuration` request.
 *
 * Determines how to route an incoming call based on its alias:
 *   - 2-digit alias  → main conference room.
 *   - 6-digit alias  → interpretation room (audio-only conference).
 *   - Otherwise      → continue and let the system handle it with default settings.
 *
 * @param {string} localAlias - The alias of the incoming call.
 * @returns {{ action: string, result: object }}
 */
export const handleServiceConfiguration = async (localAlias, remoteDisplayName, vendor) => {
  // --- Main room (2-digit alias) ---
  if (MAIN_ROOM_REGEX.test(localAlias)) {
    return {
      status: 'success',
      action: 'continue',
      result: {
        service_type: 'conference',
        name: localAlias,
        service_tag: 'pexip-interpreter',
        pin: STATIC_PIN,
        guest_pin: STATIC_GUEST_PIN,
        guests_can_present: true,
        allow_guests: true,
        view: 'four_mains_zero_pips'
      }
    }
  }

  // --- Interpretation room (6-digit alias) ---
  if (INTERPRETATION_ROOM_REGEX.test(localAlias)) {
    let pin = STATIC_PIN
    let guestPin = STATIC_GUEST_PIN

    if (DYNAMIC_PINS) {
      const mainRoomAlias = getMainRoomAlias(localAlias)
      const cleanDisplayName = getCleanDisplayName(
        remoteDisplayName ?? ''
      )
      const cleanVendor = getCleanVendor( vendor ?? '')

      const callTag = pexTail(
        await pexHash(SECRET + mainRoomAlias + cleanVendor + cleanDisplayName),
        20
      )
      pin = pexTail(await pexHash(callTag + 'interpreter'), 20)
      guestPin = pexTail(await pexHash(callTag + 'listener'), 20)
    }

    return {
      status: 'success',
      action: 'continue',
      result: {
        service_type: 'conference',
        name: localAlias,
        service_tag: 'pexip-interpreter',
        pin,
        guest_pin: guestPin,
        allow_guests: true
      }
    }
  }

  // --- Unknown alias format ---
  return {
    status: 'success',
    action: 'continue'
  }
}

// ---------------------------------------------------------------------------
// Participant policy
// ---------------------------------------------------------------------------

/**
 * Handle the `/policy/v1/participant/properties` request.
 *
 * For main-room participants it generates a deterministic `call_tag` that the
 * plugin later uses to derive the interpretation-room PIN.
 *
 * @param {string} localAlias - The alias of the incoming call.
 * @param {string} remoteDisplayName - The display name of the participant.
 * @param {string} vendor - The vendor string from the SIP User-Agent header.
 * @returns {{ status: string, action: string, result: object }}
 */
export const handleParticipantProperties = async (localAlias, remoteDisplayName, vendor) => {
  if (!DYNAMIC_PINS) {
    return { status: 'success', action: 'continue', result: {} }
  }

  if (MAIN_ROOM_REGEX.test(localAlias)) {
    const cleanVendor = getCleanVendor(vendor ?? '')
    const displayName = remoteDisplayName ?? ''

    let callTag = pexTail(
      await pexHash(SECRET + localAlias + cleanVendor + displayName),
      20
    )

    return {
      status: 'success',
      action: 'continue',
      result: { call_tag: callTag }
    }
  }

  return {
    status: 'success',
    action: 'continue'
  }
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the main-room alias from an interpretation-room alias.
 * e.g. "010033" → "01"
 */
const getMainRoomAlias = (alias) => alias.replace(/^(\d{2})\d{4}$/, '$1')

/**
 * Strip the " - Interpreter" / " - Listener" suffix from a display name.
 * e.g. "Alice - Interpreter" → "Alice"
 */
const getCleanDisplayName = (displayName) =>
  displayName.replace(/\s*-\s*(Interpreter|Listener)$/, '')

/**
 * Strip the Webapp3 version suffix from the vendor string.
 * e.g. "Pexip Webapp3/11.0.0+abc" → "Pexip"
 */
const getCleanVendor = (vendor) => vendor.replace(/\s*Webapp3.*$/, '')