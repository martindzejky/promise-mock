# promise-mock

Synchronous promise mock for tests. Implemented using Typescript so types are provided with the
library. Also, the mock class implements `Promise` interface so you can use it wherever a real
`Promise` is required.

Forked and inspired by [@slavik57's `promise-sync`](https://github.com/slavik57/promise-sync/).
I felt that his original implementation is a bit outdated and, more importanty, it does not
implement `Promise` interface so it is painful to use in places where a real promise is required.
(See [slavik57/promise-sync#15](https://github.com/slavik57/promise-sync/issues/15) for my original issue)

