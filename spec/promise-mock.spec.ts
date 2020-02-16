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

    describe('#then', () => {
        let callback: jasmine.Spy;
        let promise: PromiseMock<number>;
        let thenPromise: PromiseMock<number>;

        beforeEach(() => {
            callback = jasmine.createSpy('thenCallback');
            promise = new PromiseMock<number>();
            thenPromise = promise.then(callback);
        });

        it('should call the registered callback when the promise is resolved', () => {
            promise.resolve(2);
            expect(callback).toHaveBeenCalledWith(2);
        });

        it('should return a chainable promise', () => {
            expect(thenPromise).toBeDefined();
            expect(thenPromise).toEqual(
                jasmine.objectContaining({
                    then: jasmine.any(Function),
                    catch: jasmine.any(Function),
                    finally: jasmine.any(Function),
                }),
            );
        });

        it('should resolve the chained promise with the value from callback', () => {
            const thenSpy = jasmine.createSpy('thenCallback2');
            const catchSpy = jasmine.createSpy('catchCallback2');
            thenPromise.then(thenSpy);
            thenPromise.catch(catchSpy);
            callback.and.returnValue(5);
            promise.resolve(2);

            expect(thenSpy).toHaveBeenCalledWith(5);
            expect(catchSpy).not.toHaveBeenCalled();
        });

        it('should reject the chained promise with the error from callback', () => {
            const thenSpy = jasmine.createSpy('thenCallback2');
            const catchSpy = jasmine.createSpy('catchCallback2');
            thenPromise.then(thenSpy);
            thenPromise.catch(catchSpy);
            callback.and.throwError('callback error');
            promise.resolve(2);

            expect(thenSpy).not.toHaveBeenCalled();
            expect(catchSpy).toHaveBeenCalledWith(jasmine.any(Error));
        });
    });

    describe('#catch', () => {
        let callback: jasmine.Spy;
        let promise: PromiseMock<number>;
        let catchPromise: PromiseMock<number>;

        beforeEach(() => {
            callback = jasmine.createSpy('catchCallback');
            promise = new PromiseMock<number>();
            catchPromise = promise.catch(callback);
        });

        it('should call the registered callback when the promise is rejected', () => {
            promise.reject(2);
            expect(callback).toHaveBeenCalledWith(2);
        });

        it('should return a chainable promise', () => {
            expect(catchPromise).toBeDefined();
            expect(catchPromise).toEqual(
                jasmine.objectContaining({
                    then: jasmine.any(Function),
                    catch: jasmine.any(Function),
                    finally: jasmine.any(Function),
                }),
            );
        });

        it('should resolve the chained promise with the value from callback', () => {
            const thenSpy = jasmine.createSpy('thenCallback2');
            const catchSpy = jasmine.createSpy('catchCallback2');
            catchPromise.then(thenSpy);
            catchPromise.catch(catchSpy);
            callback.and.returnValue(5);
            promise.reject(new Error());

            expect(thenSpy).toHaveBeenCalledWith(5);
            expect(catchSpy).not.toHaveBeenCalled();
        });

        it('should reject the chained promise with the error from callback', () => {
            const thenSpy = jasmine.createSpy('thenCallback2');
            const catchSpy = jasmine.createSpy('catchCallback2');
            catchPromise.then(thenSpy);
            catchPromise.catch(catchSpy);
            callback.and.throwError('callback error');
            promise.reject(new Error());

            expect(thenSpy).not.toHaveBeenCalled();
            expect(catchSpy).toHaveBeenCalledWith(jasmine.any(Error));
        });
    });
});
