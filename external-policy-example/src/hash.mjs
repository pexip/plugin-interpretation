/**
 * Replicate the Pexip `pex_hash` function using the Web Crypto API.
 *
 * @param {string} input - The input string to hash.
 * @returns {Promise<string|undefined>} - The decimal string representation of the hash, or `undefined` if an error occurs.
 */
export const pexHash = async (input) => {
  try {
    const hexRadix = 16
    const decRadix = 10
    const pad = 2

    // Convert to byte
    const encoder = new TextEncoder()
    const data = encoder.encode(input)

    // Use crypto of navigator
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(hexRadix).padStart(pad, '0'))
      .join('')

    // Convert to dec
    const decimal = BigInt('0x' + hashHex).toString(decRadix)

    return decimal
  } catch (error) {
    console.error(error)
    return undefined
  }
}

/**
 * Take the last `n` characters of a string.
 * Replicates the Pexip `pex_tail` filter.
 *
 * @param {string} value - The input string.
 * @param {number} n - Number of trailing characters to return.
 * @returns {string}
 */
export const pexTail = (value, n) => {
  return value.slice(-n)
}
