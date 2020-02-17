# promise-mock

![GitHub tag](https://img.shields.io/github/v/tag/martindzejky/promise-mock?style=flat-square)
![npm](https://img.shields.io/npm/v/@martindzejky/promise-mock?style=flat-square)
![Tests](https://img.shields.io/github/workflow/status/martindzejky/promise-mock/Run%20tests?label=tests&style=flat-square)

Synchronous promise mock for tests. Implemented using Typescript so types are provided with the
library. Also, the mock class implements `Promise` interface so you can use it wherever a real
`Promise` is required.

Forked and inspired by [@slavik57's `promise-sync`](https://github.com/slavik57/promise-sync/).
I felt that his original implementation is a bit outdated and, more importanty, it does not
implement `Promise` interface so it is painful to use in places where a real promise is required.
(See [slavik57/promise-sync#15](https://github.com/slavik57/promise-sync/issues/15) for my original issue)

