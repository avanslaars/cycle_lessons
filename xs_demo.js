'use strict'

const xs = require('xstream').default

const streamA$ = xs.periodic(1000).map(x => `A${x}`).take(5)
const streamB$ = xs.periodic(3000).map(x => `B${x}`).take(2)

// streamA$ -0-1-2-3-4-|
//      map(streamB$)
// streamB$ -----0------1|
//                \
//                 ---(A2 and B0)---(A4 and B1)
//      flatten()
// result$ ------(A2 and B0)---(A4 and B1)|

const result$ = streamA$.map(aval => streamB$.map(bval => `${aval} and ${bval}`)).flatten()

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
