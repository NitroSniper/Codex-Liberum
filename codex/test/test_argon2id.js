const assert = require('assert');
const argon2id = require('../lib/argon2id');
describe('Argon2id', function () {
    describe('#BigIntToUint8Array', function () {
        it('Convert a U64 to Array of U8', function () {
            const actual = argon2id.BigIntToUint8Array(BigInt.asUintN(64, 15328648718273213555n));
            const expected = new Uint8Array([
                115,
                244,
                107,
                107,
                203,
                76,
                186,
                212
            ]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('Uint8ArrayToBigInt', function () {
        it('Convert a U64 to Array of U8', function () {

            const actual = argon2id.Uint8ArrayToBigInt(new Uint8Array([
                115,
                244,
                107,
                107,
                203,
                76,
                186,
                212
            ]));
            const expected = BigInt.asUintN(64, 15328648718273213555n)
            assert.equal(actual, expected);
        });
    });
    describe('#BigIntToUint8Array & Uint8ArrayToBigInt', function () {
        it('Convert a U64 to Array of U8 and then back to U64', function () {
            const expected = BigInt.asUintN(64, 15328648718273213555n);
            const uint8array = argon2id.BigIntToUint8Array(expected);
            const actual = argon2id.Uint8ArrayToBigInt(uint8array);
            assert.equal(actual, expected);
        });
    });
    describe('#LE32', function () {
        it('Convert 123456 as a 32 bit integer to bytes', function () {
            const value = BigInt.asUintN(32, 123456n);
            const actual = argon2id.LE32(value);
            const expected = new Uint8Array([
                64,
                226,
                1,
                0
            ]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('#LE32', function () {
        it('Convert 123456 as a 32 bit integer to bytes', function () {
            const value = BigInt.asUintN(32, 123456n);
            const actual = argon2id.LE64(value);
            const expected = new Uint8Array([
                64,
                226,
                1,
                0,
                0,
                0,
                0,
                0
            ]);
            assert.deepEqual(actual, expected);
        });
    });
});