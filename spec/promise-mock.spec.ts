import { PromiseMock } from '../src/promise-mock';
import { PromiseState } from '../src/promise-state';

describe('PromiseMock', () => {
    describe('@resolve', () => {
        it('should create a resolved promise', () => {
            const promise = PromiseMock.resolve();

            expect(promise.getState()).toEqual(PromiseState.Resolved);
        });
    });

    describe('@reject', () => {
        it('should create a rejected promise', () => {
            const promise = PromiseMock.reject();

            expect(promise.getState()).toEqual(PromiseState.Rejected);
        });
    });

    describe('#constructor', () => {
        it('should create a promise mock in pending state', () => {
            const promise = new PromiseMock<void>();

            expect(promise.getState()).toEqual(PromiseState.Pending);
        });
    });

    describe('#resolve', () => {
        const resolvedValue = 5;
        let promise: PromiseMock<number>;

        beforeEach(() => {
            promise = new PromiseMock<number>();
            promise.resolve(resolvedValue);
        });

        it('should set the correct state', () => {
            expect(promise.getState()).toEqual(PromiseState.Resolved);
        });

        it('should not be possible to call twice', () => {
            expect(promise.resolve.bind(promise)).toThrow(jasmine.any(Error));
        });

        it('should not allow to reject afterwards', () => {
            expect(promise.reject.bind(promise)).toThrow(jasmine.any(Error));
        });

        it('should call then callbacks', () => {
            const spy = jasmine.createSpy('thenCallback');
            promise.then(spy);

            expect(spy).toHaveBeenCalledWith(resolvedValue);
        });

        it('should call finally callbacks', () => {
            const spy = jasmine.createSpy('finallyCallback');
            promise.finally(spy);

            expect(spy).toHaveBeenCalledWith();
        });
    });

    describe('#reject', () => {
        const rejectReason = new Error();
        let promise: PromiseMock<void>;

        beforeEach(() => {
            promise = new PromiseMock<void>();
            promise.reject(rejectReason);
        });

        it('should set the correct state', () => {
            expect(promise.getState()).toEqual(PromiseState.Rejected);
        });

        it('should not be possible to call twice', () => {
            expect(promise.reject.bind(promise)).toThrow(jasmine.any(Error));
        });

        it('should not allow to resolve afterwards', () => {
            expect(promise.resolve.bind(promise)).toThrow(jasmine.any(Error));
        });

        it('should call catch callbacks', () => {
            const spy = jasmine.createSpy('catchCallback');
            promise.catch(spy);

            expect(spy).toHaveBeenCalledWith(rejectReason);
        });

        it('should call finally callbacks', () => {
            const spy = jasmine.createSpy('finallyCallback');
            promise.finally(spy);

            expect(spy).toHaveBeenCalledWith();
        });
    });
});
