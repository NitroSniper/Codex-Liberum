// This is a home implementation of Argon2
// This was implemented by following https://datatracker.ietf.org/doc/html/rfc9106

class Argon2id {
    constructor(argon) {
        this.mm = new Uint
    }

    /**
     * Return the little endian of BigInt to U8 Array
     * @param decimal{bigint}
     * @returns {Uint8Array}
     * @constructor
     */
    static BigIntToUint8Array(decimal) {
        const bitLength = Math.floor(Math.log2(Number(decimal)) + 1);
        const U8Length = Math.floor(bitLength / 8);
        let array = new Uint8Array(U8Length);
        for (let i = 0; i < U8Length; i++) {
            array[i] = Number(decimal & 255n);
            decimal >>= 8n;
        }
        return array;
    }

    static Uint8ArrayToBigInt(uint8array) {
        let value = 0n;
        for (let i = uint8array.length - 1; i >= 0; i--) {
            value = BigInt(uint8array[i]) | value << 8n;
        }
        return value;
    }

    /**
     * LE32(a)
     * a converted to a byte string in little endian (for example, 123456 (decimal) is 40 E2 01 00)
     * @param a 32-bit integer
     * @constructor
     */
    static LE32(a) {

    }
}

module.exports = Argon2id