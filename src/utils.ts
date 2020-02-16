export function isPromiseLike(object: any): object is PromiseLike<unknown> {
    return (
        'then' in object &&
        typeof (object as PromiseLike<unknown>).then === 'function'
    );
}
