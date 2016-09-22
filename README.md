# cycle_lessons
Step By Step Lesson on CycleJS for SitePoint

## Initial Setup & Hello World

* `npm init -y`
* `npm i -S xstream@5.3.6 @cycle/dom@12.1.0 @cycle/xstream-run@3.0.4`
* `npm i -D babel@6.5.2 babel-core@6.13.2 babel-loader@6.2.5 babel-preset-es2015@6.13.2 webpack@1.13.2 webpack-dev-server@1.14.1`
* Add webpack config: `webpack.config.js`
* Add dev command to `package.json` - `"dev": "webpack-dev-server"`
* Create `index.html`
    * Create app div
    * Include `bundle.js` script tag
* Create `index.js`
    * Add imports
    * Create main function - accept sources
    * Call run with main and setup dom driver
    * Add sinks w/ return to main
    * Add static hello world:

``` js
function main(sources) {
    const sinks = {
        DOM: xs.of('Hello World').map(txt => div([
            h1(txt)
        ]))
    }
    return sinks
}
```

* visit `http://localhost:8080`
* Add input and move static greeting into `state$`

``` js
function main(sources) {
    const state$ = xs.of('Hello World')
    const sinks = {
        DOM: state$.map(txt => div([
            input('.greeting', {props:{value:txt}}),
            h1(txt)
        ]))
    }
    return sinks
}
```

* visit `http://localhost:8080`
* Reference input change stream and factor it into the display

``` js
function main(sources) {
    const inputVal$ = sources.DOM.select('.greeting').events('input')
        .map(ev => ev.target.value)

    const state$ = xs.merge(xs.of('Hello World'), inputVal$)
    const sinks = {
        DOM: state$.map(txt => div([
            input('.greeting', {props:{value:txt}}),
            h1(txt)
        ]))
    }
    return sinks
}
```

* visit `http://localhost:8080`

## XStream Examples

* Create `xs_demo.js`
* Create a simple stream:

### Creating and Consuming Streams

``` js
'use strict'

const xs = require('xstream').default

const result$ = xs.of('Demo')
```

* Explain/Show need for subscriber (listener)

``` js
'use strict'

const xs = require('xstream').default

const result$ = xs.of('Demo')

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

* Show periodic

``` js
'use strict'

const xs = require('xstream').default

const result$ = xs.periodic(1000)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

### Marble Diagrams

``` js
'use strict'

const xs = require('xstream').default

// -1-2-3-4-5-6-7-8-9-10->
const result$ = xs.periodic(1000)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

### Transforming Streams

* Show filter

``` js
'use strict'

const xs = require('xstream').default

// -1-2-3-4-5-6-7-8-9-10->
//    filter(x => x%2)
// -1---3---5---7---9--->
const result$ = xs.periodic(1000)
    .filter(x => x%2)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})

```

* Add map

``` js
'use strict'

const xs = require('xstream').default

// -1-2-3-4-5-6-7-8-9-10->
//    filter(x => x%2)
// -1---3---5---7---9--->
//    map(x => x*100)
// -100---300---500---700->
const result$ = xs.periodic(1000)
    .filter(x => x%2)
    .map(x => x*100)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})

```

* Add take

``` js
'use strict'

const xs = require('xstream').default

// -1-2-3-4-5-6-7-8-9-10->
//    filter(x => x%2)
// -1---3---5---7---9--->
//    map(x => x*100)
// -100---300---500---700->
//    take(3)
// -100---300---500|
const result$ = xs.periodic(1000)
    .filter(x => x%2)
    .map(x => x*100)
    .take(3)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})

```

* Add startWith - emits startWith value to subscriber immediately... does NOT pass it through pipeline

``` js
'use strict'

const xs = require('xstream').default

// -1-2-3-4-5-6-7-8-9-10->
//    filter(x => x%2)
// -1---3---5---7---9--->
//    map(x => x*100)
// -100---300---500---700->
//    take(3)
// -100---300---500|
//    startWith(1)
// 1-100---300---500|
const result$ = xs.periodic(1000)
    .filter(x => x%2)
    .map(x => x*100)
    .take(3)
    .startWith(1)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

### Working with Multiple Streams

* Merging streams

``` js
'use strict'

const xs = require('xstream').default

const streamA$ = xs.periodic(1000).map(x => `A${x}`).take(5)
const streamB$ = xs.periodic(3000).map(x => `B${x}`).take(2)

// streamA$ -0-1-2-3-4-5|
// streamB$ -----0------1|
//      merge()
// result$ -A0-A1-(B0 A2)-A3-A4-B1|

const result$ = xs.merge(streamA$, streamB$)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

* Combining Streams

``` js
'use strict'

const xs = require('xstream').default

const streamA$ = xs.periodic(1000).map(x => `A${x}`).take(5)
const streamB$ = xs.periodic(3000).map(x => `B${x}`).take(2)

// streamA$ -0-1-2-3-4-|
// streamB$ -----0------1|
//      combine
// result$ ------A1B0-A2B0-A3B0-A4B0-A4B1|

const result$ = xs.combine(streamA$, streamB$)

result$.addListener({
    next: (val) => console.log(val),
    error: (err) => console.error(val),
    complete: () => console.log('Complete')
})
```

### Streams of Streams

* Mapping streamA to streamB and flattening

``` js
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
```
