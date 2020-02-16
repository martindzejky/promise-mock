export function isPromiseLike(object: any): object is PromiseLike<unknown> {
    return (
        (typeof object === 'object' || typeof object === 'function') &&
        object !== null &&
        'then' in object &&
        typeof (object as PromiseLike<unknown>).then === 'function'
    );
}
