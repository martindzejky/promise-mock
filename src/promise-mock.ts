import { PromiseState } from './promise-state';
import {
    FinallyCallback,
    Nullable,
    RegisteredCallback,
    RegisteredFinallyCallback,
    RejectedCallback,
    ResolvedCallback,
} from './types';
import { isPromiseLike } from './utils';

export class PromiseMock<TValue> implements Promise<TValue> {
    private static assertionExceptionTypes: any[] = [];

    private state: PromiseState = PromiseState.Pending;
    private callbacks: Array<
        RegisteredCallback | RegisteredFinallyCallback
    > = [];
    private resolvedValue?: TValue;
    private rejectedReason?: any;

    static setAssertionExceptionTypes(types: any[]): void {
        this.assertionExceptionTypes = [...types];
    }

    static resolve<TValue>(value?: TValue): PromiseMock<TValue> {
        const promise = new PromiseMock<TValue>();
        promise.resolve(value);

        return promise;
    }

    static reject(reason?: any): PromiseMock<never> {
        const promise = new PromiseMock<never>();
        promise.reject(reason);

        return promise;
    }

    resolve(value?: TValue): void {
        if (this.state !== PromiseState.Pending) {
            throw new Error('Cannot resolve a promise that is not pending');
        }

        this.resolvedValue = value;
        this.state = PromiseState.Resolved;

        this.resolveAllCallbacks();
    }

    reject(reason?: any): void {
        if (this.state !== PromiseState.Pending) {
            throw new Error('Cannot reject a promise that is not pending');
        }

        this.rejectedReason = reason;
        this.state = PromiseState.Rejected;

        this.rejectAllCallbacks();
    }

    then<TResolvedCallbackValue = TValue, TRejectedCallbackValue = never>(
        resolvedCallback?: Nullable<
            ResolvedCallback<TValue, TResolvedCallbackValue>
        >,
        rejectedCallback?: Nullable<RejectedCallback<TRejectedCallbackValue>>,
    ): Promise<TResolvedCallbackValue | TRejectedCallbackValue> {
        const callback: RegisteredCallback<
            TValue,
            TResolvedCallbackValue,
            TRejectedCallbackValue
        > = {
            then: resolvedCallback,
            catch: rejectedCallback,
            nextPromise: new PromiseMock<
                TResolvedCallbackValue | TRejectedCallbackValue
            >(),
        };

        this.callbacks.push(callback);
        this.handleIfNotPending();

        return callback.nextPromise;
    }

    catch<TRejectedCallbackValue = never>(
        rejectedCallback?: Nullable<RejectedCallback<TRejectedCallbackValue>>,
    ): Promise<TValue | TRejectedCallbackValue> {
        const callback: RegisteredCallback<
            TValue,
            never,
            TRejectedCallbackValue
        > = {
            catch: rejectedCallback,
            nextPromise: new PromiseMock<TRejectedCallbackValue>(),
        };

        this.callbacks.push(callback);
        this.handleIfNotPending();

        return callback.nextPromise;
    }

    finally(finallyCallback?: Nullable<FinallyCallback>): Promise<TValue> {
        const callback: RegisteredFinallyCallback<TValue> = {
            finally: finallyCallback,
            nextPromise: new PromiseMock<TValue>(),
        };

        this.callbacks.push(callback);
        this.handleIfNotPending();

        return callback.nextPromise;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
     */
    get [Symbol.toStringTag](): string {
        return `PromiseMock in ${this.state} state with ${this.callbacks.length} registered callbacks`;
    }

    getState(): PromiseState {
        return this.state;
    }

    private handleIfNotPending(): void {
        if (this.state === PromiseState.Resolved) {
            this.resolveAllCallbacks();
        } else if (this.state === PromiseState.Rejected) {
            this.rejectAllCallbacks();
        }
    }

    private resolveAllCallbacks(): void {
        this.callbacks.forEach(callback => {
            if ('finally' in callback && callback.finally) {
                this.callFinallyCallback(callback);
                callback.nextPromise.resolve(this.resolvedValue);
                return;
            }

            if (!('then' in callback) || !callback.then) {
                callback.nextPromise.resolve(this.resolvedValue);
                return;
            }

            let nextValue: unknown;
            try {
                nextValue = callback.then(this.resolvedValue);
            } catch (e) {
                this.throwIfAssertionExceptionType(e);
                callback.nextPromise.reject(e);
                return;
            }

            if (isPromiseLike(nextValue)) {
                nextValue.then(
                    value => callback.nextPromise.resolve(value),
                    reason => callback.nextPromise.reject(reason),
                );
            } else {
                callback.nextPromise.resolve(nextValue);
            }
        });

        this.callbacks = [];
    }

    private rejectAllCallbacks(): void {
        this.callbacks.forEach(callback => {
            if ('finally' in callback && callback.finally) {
                this.callFinallyCallback(callback);
                callback.nextPromise.reject(this.rejectedReason);
                return;
            }

            if (!('catch' in callback) || !callback.catch) {
                callback.nextPromise.reject(this.rejectedReason);
                return;
            }

            let nextValue: unknown;
            try {
                nextValue = callback.catch(this.rejectedReason);
            } catch (e) {
                this.throwIfAssertionExceptionType(e);
                callback.nextPromise.reject(e);
                return;
            }

            if (isPromiseLike(nextValue)) {
                nextValue.then(
                    value => callback.nextPromise.resolve(value),
                    reason => callback.nextPromise.reject(reason),
                );
            } else {
                callback.nextPromise.resolve(nextValue);
            }
        });

        this.callbacks = [];
    }

    private callFinallyCallback(callback: RegisteredFinallyCallback): void {
        if (!callback.finally) {
            return;
        }

        try {
            callback.finally();
        } catch (e) {
            this.throwIfAssertionExceptionType(e);
            callback.nextPromise.reject(e);
            return;
        }
    }

    private throwIfAssertionExceptionType(error: any): void | never {
        PromiseMock.assertionExceptionTypes.forEach(type => {
            if (error instanceof type) {
                throw error;
            }
        });
    }
}
