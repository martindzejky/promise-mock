import { PromiseMock } from './promise-mock';

export type AsyncOrSync<TValue> = PromiseLike<TValue> | TValue;
export type Nullable<TValue> = TValue | null;

export type ResolvedCallback<TValue, TNewValue> = (
    value: TValue,
) => AsyncOrSync<TNewValue>;

export type RejectedCallback<TNewValue> = (
    reason: any,
) => AsyncOrSync<TNewValue>;

export type FinallyCallback = () => void;

export interface RegisteredCallback<
    TValue = unknown,
    TResolvedCallbackValue = unknown,
    TRejectedCallbackValue = unknown
> {
    then?: Nullable<ResolvedCallback<TValue, TResolvedCallbackValue>>;
    catch?: Nullable<RejectedCallback<TRejectedCallbackValue>>;

    nextPromise: PromiseMock<TResolvedCallbackValue | TRejectedCallbackValue>;
}

export interface RegisteredFinallyCallback<TValue = unknown> {
    finally?: Nullable<FinallyCallback>;

    nextPromise: PromiseMock<TValue>;
}
