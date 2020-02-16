export function isPromiseLike(object: any): object is PromiseLike<unknown> {
    return (
        !!object &&
        'then' in object &&
        typeof (object as PromiseLike<unknown>).then === 'function'
    );
}
