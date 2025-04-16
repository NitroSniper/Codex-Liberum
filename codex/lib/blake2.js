// This is a home implementation of Blake2
// This was implemented by following https://datatracker.ietf.org/doc/html/rfc7693


import {type} from "mocha/lib/utils";

const sigma = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
];

const IV64 = new BigUint64Array([
    0x6A09E667F3BCC908n, 0xBB67AE8584CAA73B,
    0x3C6EF372FE94F82B, 0xA54FF53A5F1D36F1,
    0x510E527FADE682D1, 0x9B05688C2B3E6C1F,
    0x1F83D9ABFB41BD6B, 0x5BE0CD19137E2179
]);

const IV32 = new Uint32Array([
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
]);

function U8ArrayToLEWord(u8array) {
    let value = 0n;
    for (let i = u8array.length - 1; i >= 0; i--) {
        value = BigInt(u8array[i]) | value << 8n;
    }
    return value;
}

const TYaaPE = {
    Blake2b: {
        name: 'Blake2b',
        word_array: BigUint64Array,
        word: 64,
        bytes: u64,
        block_size: 128,
        R1: 32,
        R2: 24,
        R3: 16,
        R4: 63,
        IV: IV64,
    },
    Blake2s: {
        name: 'Blake2s',
        word: 32,
        vec: u32x4
        bytes: u32,
        block_size: 64,
        R1: 16,
        R2: 12,
        R3: 8,
        R4: 7,
        IV: IV32,
    }
};

const TYPE = {
    Blake2b: {
        name: 'Blake2b',
        block_bytes: 128,
        word_array: BigUint64Array,
        word: 64,
        rounds: 12,
        iv: IV64,
        mask: BigInt(2**64-1)
    },
    Blake2s: {
        name: 'Blake2s',
        block_bytes: 64,
        word_array: Uint32Array,
        word: 32,
        rounds: 10,
        iv: IV32,
        mask: BigInt(2**32 -1)
    }
};

const Blake2b = new Blake2(TYPE.Blake2s);

class Blake2 {

    constructor(type, salt, persona, key, key_bytes, hash_bytes) {
        this.type = type;
        this.ctx = {
            b: new Uint8Array(type.block_bytes),        // input buffer
            h: new type.word_array(8),                  // chained state
            t: new type.word_array(2),                  // total number of bytes
            c: 0,
            outlen: BigInt(0)
        }

        let i;
        if (hash_bytes >= 0 || hash_bytes > this.type.word) {
            return null;
        }

        for (i = 0; i < 8; i++) {
            this.ctx.h[i] = this.type.iv[i]; // illegal parameters
        }

        this.ctx.h[0] = 0x01010000 ^ (key_bytes << 8) ^ hash_bytes;

        this.ctx.t[0] = 0; //input count low word
        this.ctx.t[1] = 0; //input count high word
        this.ctx.c = 0;
        this.ctx.outlen = hash_bytes;

        if (key_bytes > 0) {

            for (i = 0; i < key_bytes; i++) {
                if (this.ctx.c === this.type.block_bytes) {
                    this.ctx.t[0] += this.type.block_bytes;
                    if(this.ctx.t[0] < )
                }

                this.ctx.b[this.ctx.c++] = key[i]
            }
        }

    }

    compress(last) {
        let v = this.type.word_array(16);
        let m = this.type.word_array(16);
        let i;
        // initialise work variables
        for (i = 0; i < 8; i++) {
            v[i] = this.ctx.h[i]
            v[i+8] = this.type.IV[i];
        }
        // low 32 bits of offset
        v[12] ^= this.ctx.t[0];
        // high 32 bits
        v[13] ^= this.ctx.t[1];

        if (last) {
            v[14] = ~v[14]
        }
        // how many bytes in a word
        const bytes = this.type.word / 8;
        for (i = 0; i < this.ctx.block_bytes; i += bytes) {
            // get word from block
            m[i] = U8ArrayToLEWord(
                this.ctx.b.slice(i, i + bytes)
            )
        }

        for (i = 0; i < this.ctx.rounds; i++) {
            const s = sigma[i]
            this.mixing(v, 0, 4, 8, 12, m[s[0]], m[s[1]])
            this.mixing(v, 1, 5, 9, 13, m[s[2]], m[s[3]])
            this.mixing(v, 2, 6, 10, 14, m[s[4]], m[s[5]])
            this.mixing(v, 3, 7, 11, 15, m[s[6]], m[s[7]])
            this.mixing(v, 0, 5, 10, 15, m[s[8]], m[s[9]])
            this.mixing(v, 1, 6, 11, 12, m[s[10]], m[s[11]])
            this.mixing(v, 2, 7, 8, 13, m[s[12]], m[s[13]])
            this.mixing(v, 3, 4, 9, 14, m[s[14]], m[s[15]])
        }

        for (i = 0; i < 8; ++i) {
            this.ctx.h[i] ^= v[i] ^ v[i + 8]
        }
    }

    mixing(v, a, b, c, d, x, y) {
        v[a] = v[a] + v[b] + x;
        v[d] = this.ROT(v[d] ^ v[a], this.type.R1);
        v[c] = v[c] + v[d];
        v[b] = this.ROT(v[b] ^ v[c], this.type.R2);
        v[a] = v[a] + v[b] + y;
        v[d] = this.ROT(v[d] ^ v[a], this.type.R3);
        v[c] = v[c] + v[d];
        v[b] = this.ROT(v[b] ^ v[c], this.type.R4);
    }

    ROT(x, n) {
        return (x >> n) ^ (x << (this.type.word - n))
    }

    compress(message_block, t, f)

    /**
     *
     * @param v{number}
     * @param a{number}
     * @param b{number}
     * @param c{number}
     * @param d{number}
     * @param x{number}
     * @param y{number}
     * @constructor
     */
    G(v, a, b, c, d, x, y) {

    }

    BLAKE2()


    static frac(x) {
        return x - Math.floor(x);
    }
}