// This is a home implementation of Argon2
// This was implemented by following https://datatracker.ietf.org/doc/html/rfc9106

// self reference
// a byte is a U8

class Argon2id {
    constructor(argon) {
        this.p = null; // password
        this.s = null; // salt
        //new 
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
        return this.BigIntToVarUint8Array(decimal, U8Length);
    }

    /**
     * Return the little endian of BigInt to U8 Array of variable length l
     * @param decimal{bigint}
     * @param l{number}
     * @returns {Uint8Array}
     * @constructor
     */
    static BigIntToVarUint8Array(decimal, l) {
        let array = new Uint8Array(l);
        for (let i = 0; i < l; i++) {
            array[i] = Number(decimal & 255n);
            decimal >>= 8n;
        }
        return array;
    }

    /**
     * Return the U64/U32 value from array of U8
     * @param uint8array{Uint8Array}
     * @returns {bigint}
     * @constructor
     */
    static Uint8ArrayToBigInt(uint8array) {
        let value = 0n;
        for (let i = uint8array.length - 1; i >= 0; i--) {
            value = BigInt(uint8array[i]) | value << 8n;
        }
        return value;
    }

    /**
     * Returns an P-byte zero string
     * @param P{number}
     * @returns {Uint8Array}
     * @constructor
     */
    static ZERO(P) {
        return new Uint8Array(P);
    }



    /**
     * decimal a converted to a byte string in little endian (for example, 123456 (decimal) is 40 E2 01 00)
     * @param a 32-bit integer
     * @constructor
     */
    static LE32(a) {
        return this.BigIntToVarUint8Array(a, 4)
    }

    /**
     *
     * @param a 64-bit integer
     * @returns {Uint8Array}
     * @constructor
     */
    static LE64(a) {
        return this.BigIntToVarUint8Array(a, 8)
    }

    static int32 = Argon2id.Uint8ArrayToBigInt;
    static int64 = Argon2id.Uint8ArrayToBigInt;


}

module.exports = Argon2id