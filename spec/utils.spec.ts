import { isPromiseLike } from '../src/utils';

describe('isPromiseLike', () => {
    it('should return true for objects with then method', () => {
        const obj = {
            then() {},
        };

        expect(isPromiseLike(obj)).toBe(true);
    });

    it('should return false for objects with missing then method', () => {
        const obj = {
            hello: 'typescript',
        };

        expect(isPromiseLike(obj)).toBe(false);
    });

    it('should return false for objects with null then method', () => {
        const obj = {
            then: null,
        };

        expect(isPromiseLike(obj)).toBe(false);
    });
});
