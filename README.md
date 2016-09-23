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

## Starting the Color app

* Replace Hello World with Basic Slider
    * Add label to imports for dom
    * make state simple xs.of number
    * map to num =>

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label} from '@cycle/dom'

function main(sources) {
    const state$ = xs.of(200)
    const sinks = {
        DOM: state$.map(num => div([
            label('Choose A Number:'),
            input('.slider', {attrs:{type:'range', min:0, max:255}, props:{value:num}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Slider renders, but doesn't do anything...
* Add output for value

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label} from '@cycle/dom'

function main(sources) {
    const state$ = xs.of(200)
    const sinks = {
        DOM: state$.map(num => div([
            label('Choose A Number:'),
            input('.slider', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            h1(`Value: ${num}`)
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Now get value and use it

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label} from '@cycle/dom'

function main(sources) {
    const slider$ = sources.DOM.select('.slider').events('change')
        .map(ev => ev.target.value)

    const state$ = slider$
    const sinks = {
        DOM: state$.map(num => div([
            label('Choose A Number:'),
            input('.slider', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            h1(`Value: ${num}`)
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* This renders nothing!
* Since the number comes from the slider and the rendering is dependent on that, there is no slider to provide a value... We need top start the stream with a value

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label} from '@cycle/dom'

function main(sources) {
    const slider$ = sources.DOM.select('.slider').events('change')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = slider$
    const sinks = {
        DOM: state$.map(num => div([
            label('Choose A Number:'),
            input('.slider', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            h1(`Value: ${num}`)
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Moving the slider updates the value (once we stop)
* Let's make it happen in real time (change 'change' event to 'input' event)

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label} from '@cycle/dom'

function main(sources) {
    const slider$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = slider$
    const sinks = {
        DOM: state$.map(num => div([
            label('Choose A Number:'),
            input('.slider', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            h1(`Value: ${num}`)
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

### Using Multiple Sliders to Control Color

* Reconfigure the view to show 3 sliders

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function main(sources) {
    const slider$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = slider$
    const sinks = {
        DOM: state$.map(num => div([
            h1('Current Color'),
            label('Red:'),
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            br(),
            label('Green:'),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            br(),
            label('Blue:'),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:num}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Now I can read values from all 3 sliders, but the page won't render

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function main(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = slider$
    const sinks = {
        DOM: state$.map(num => div([
            h1('Current Color'),
            label('Red:'),
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            br(),
            label('Green:'),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:num}}),
            br(),
            label('Blue:'),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:num}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Use combine to get all 3 color values
* Pass 3 values into view Mapping
* Display numeric value next to label

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function main(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = xs.combine(red$, green$, blue$)
    const sinks = {
        DOM: state$.map(([red, green, blue]) => div([
            h1('Current Color'),
            label(`Red:(${red})`),
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:red}}),
            br(),
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Apply color values to heading

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function main(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const state$ = xs.combine(red$, green$, blue$)
    const sinks = {
        DOM: state$.map(([red, green, blue]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            label(`Red:(${red})`),
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:red}}),
            br(),
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

## Refactor to Components

* Make a simple component with no real functionality
* Instantiate a sample component
* Add its DOM prop to the merge for state$ (this is DOM, not really state.. fix that later)
* Reference it in the render mapping

``` js
function LabeledSlider() {
    const sinks = {
        DOM: xs.of(label('slider goes here...'))
    }

    return sinks
}

function main(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const sampleSlider = LabeledSlider()

    const state$ = xs.combine(red$, green$, blue$, sampleSlider.DOM)
    const sinks = {
        DOM: state$.map(([red, green, blue, sample]) => div([
            sample,
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            label(`Red:(${red})`),
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:red}}),
            br(),
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Replace the Red slider with the new component...
    * This will break rendering because red as a value doesn't exist...
    * We can fix that temporarily by replacing `${red}` in heading with a `0`
    * Doing that allows it to render and slide, but that one won't change the color

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const sinks = {
        DOM: red$.map(red => div([
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:red}}),
            label(`Red:(${red})`)
        ]))
    }

    return sinks
}

function main(sources) {
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const redSlider = LabeledSlider(sources)
    const redDom$ = redSlider.DOM

    const state$ = xs.combine(redDom$, green$, blue$)
    const sinks = {
        DOM: state$.map(([redDom, green, blue]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            redDom,
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Our component needs to also supply a value
* We can return value as a sink

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const red$ = sources.DOM.select('.red').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const sinks = {
        DOM: red$.map(red => div([
            input('.red', {attrs:{type:'range', min:0, max:255}, props:{value:red}}),
            label(`Red:(${red})`)
        ])),
        VALUE: red$
    }

    return sinks
}

function main(sources) {
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const redSlider = LabeledSlider(sources)
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const state$ = xs.combine(red$, redDom$, green$, blue$)
    const sinks = {
        DOM: state$.map(([red, redDom, green, blue]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            redDom,
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Our slider is still focused on being Red and it needs to be reusable/generic
* Let's pass in props to set some values on the specific instance
    * Break out sources in DOM and PROPS
    * Pass `xs.of` to props with name, min and max properties
* Let's make the "red" references a little more generic too
    * Change `.red` to `.slider`
    * Update `red$` and `red` (inside map) to `value$` and `value` respectively

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const sinks = {
        DOM: xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ])),
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const green$ = sources.DOM.select('.green').events('input')
        .map(ev => ev.target.value)
        .startWith(0)
    const blue$ = sources.DOM.select('.blue').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const redSlider = LabeledSlider({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const state$ = xs.combine(red$, redDom$, green$, blue$)
    const sinks = {
        DOM: state$.map(([red, redDom, green, blue]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            redDom,
            label(`Green:(${green})`),
            input('.green', {attrs:{type:'range', min:0, max:255}, props:{value:green}}),
            br(),
            label(`Blue:(${blue})`),
            input('.blue', {attrs:{type:'range', min:0, max:255}, props:{value:blue}})
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})

```

* Now that it's a reusable component, let's reuse it

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const sinks = {
        DOM: xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ])),
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const redSlider = LabeledSlider({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = LabeledSlider({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = LabeledSlider({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const state$ = xs.combine(red$, redDom$, green$, greenDom$, blue$, blueDom$)
    const sinks = {
        DOM: state$.map(([red, redDom, green, greenDom, blue, blueDom]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            redDom,
            greenDom,
            blueDom
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* This **looks** right, but moving one slider, moves the rest...
    * This is because our selector is using the `.slider` class.
    * Cycle provides a util that will help solve this: Isolate
* Install isolate - `npm i -S @cycle/isolate@1.4.0`
* Import Isolate and apply it:

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const sinks = {
        DOM: xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ])),
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const state$ = xs.combine(red$, redDom$, green$, greenDom$, blue$, blueDom$)
    const sinks = {
        DOM: state$.map(([red, redDom, green, greenDom, blue, blueDom]) => div([
            h1({attrs:{style:`color:rgb(${red}, ${green}, ${blue})`}},'Current Color'),
            redDom,
            greenDom,
            blueDom
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})

```

* Let's Refactor the main a bit
* First let's separate the external dom from the external state
    * Define a `dom$` and make that an object with the latest dom values from the 3 component instances
    * Define a `state$` that will replces the existing one - object with the component values
    * render the view by combining state and external dom
* Move render code out into a `view$` to clean up a bit, both in main and in the component


``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeDOMDriver, h1, div, input, label, br} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const view$ = xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ]))

    const sinks = {
        DOM: view$,
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const state$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
            h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
            dom.red,
            dom.green,
            dom.blue
        ]))

    const sinks = {
        DOM: view$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

## Saving Values to a List of Colors

* Add a button
    * Add `button` to imports for dom
    * get rid of `br` import
* Create a stream from the click event (at the top of the function)
* Add output for a static array of colors (to demonstrate)

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeDOMDriver, h1, div, input, label, button, ul, li} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const view$ = xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ]))

    const sinks = {
        DOM: view$,
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const saveClick$ = sources.DOM.select('.save').events('click')

    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const initialColors$ = xs.of([{red:255, green:0, blue:0}, {red:0, green:255, blue:0}, {red:0, green:0, blue:255}])

    const colorList$ = initialColors$

    const state$ = xs.combine(currentColor$, colorList$).map(([currentColor, colors]) => ({...currentColor, colors}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
            div('#colorControls', [
                h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
                dom.red,
                dom.green,
                dom.blue,
                button('.save', 'Save Color')
            ]),
            div('#colorList', [
                ul(
                    state.colors.map(c => li(
                        {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}}
                    ))
                )
            ])
        ]))

    const sinks = {
        DOM: view$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

* Set new color by mapping currentColor to button click
    * `const newColor$ = currentColor$.map(color => saveClick$.map(() => color)).flatten()`
* Merge streams for newColor$ and initialColors$ using `fold`
    * `const colorList$ = xs.merge(initialColors$, newColor$).fold((acc, c) => acc.concat(c), [])`

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeDOMDriver, h1, div, input, label, button, ul, li} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const view$ = xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ]))

    const sinks = {
        DOM: view$,
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const saveClick$ = sources.DOM.select('.save').events('click')

    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const initialColors$ = xs.of([{red:255, green:0, blue:0}, {red:0, green:255, blue:0}, {red:0, green:0, blue:255}])

    const newColor$ = currentColor$.map(color => saveClick$.map(() => color)).flatten()
    const colorList$ = xs.merge(initialColors$, newColor$).fold((acc, c) => acc.concat(c), [])

    const state$ = xs.combine(currentColor$, colorList$).map(([currentColor, colors]) => ({...currentColor, colors}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
            div('#colorControls', [
                h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
                dom.red,
                dom.green,
                dom.blue,
                button('.save', 'Save Color')
            ]),
            div('#colorList', [
                ul(
                    state.colors.map(c => li(
                        {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}}
                    ))
                )
            ])
        ]))

    const sinks = {
        DOM: view$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```

## Making HTTP Calls to Get and Save colors

* install http driver `npm i -S @cycle/http@11.0.1`
* Add `db.json` file

``` json
{
    "colors": [
        {"id":1 ,"red":255, "green":0, "blue":0},
        {"id":2 ,"red":0, "green":255, "blue":0},
        {"id":3 ,"red":0, "green":0, "blue":255}
    ]
}
```

* Run json-server: `json-server --watch db.json`
* Add import to file `import {makeHTTPDriver} from '@cycle/http'`
* Update run to include HTTP driver

``` js
run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
})
```

* empty out initial colors & demo (so it's obvious when loading from the server works)
* Add a request for colors (toward top of function)
* assign that request (getInitialColors$) to `request$` (for merging later)
* add HTTP property to sinks with `request$` as value
* add `colorResponse$` to get initialColors
    * `const colorResponse$ = sources.HTTP.select('colors').flatten()`
    * And map body to `initialColors$` - `const initialColors$ = colorResponse$.map(res => res.body)`

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeHTTPDriver} from '@cycle/http'
import {makeDOMDriver, h1, div, input, label, button, ul, li} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const view$ = xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ]))

    const sinks = {
        DOM: view$,
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const saveClick$ = sources.DOM.select('.save').events('click')
    const getInitialColors$ = xs.of({
      url: 'http://localhost:3000/colors',
      category: 'colors'
    })

    const request$ = getInitialColors$
    const colorResponse$ = sources.HTTP.select('colors').flatten()

    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const initialColors$ = colorResponse$.map(res => res.body)

    const newColor$ = currentColor$.map(color => saveClick$.map(() => color)).flatten()
    const colorList$ = xs.merge(initialColors$, newColor$).fold((acc, c) => acc.concat(c), [])

    const state$ = xs.combine(currentColor$, colorList$).map(([currentColor, colors]) => ({...currentColor, colors}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
            div('#colorControls', [
                h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
                dom.red,
                dom.green,
                dom.blue,
                button('.save', 'Save Color')
            ]),
            div('#colorList', [
                ul(
                    state.colors.map(c => li(
                        {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}}
                    ))
                )
            ])
        ]))

    const sinks = {
        DOM: view$,
        HTTP: request$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
})
```

* Let's save to the server with an HTTP Post
* Add post request right after (and based on) newColor$

``` js
const postColor$ = newColor$.map(c => ({
        url: 'http://localhost:3000/colors',
        method: 'POST',
        category: 'save',
        type: 'application/json',
        send: c
    }))
```

* Move `const request$ = getInitialColors$` down, just before state$
* Update `request$` to be `const request$ = xs.merge(getInitialColors$, postColor$)`
* Saving now will send to the server!
* Make the link addition wait for the post response
    * This will work with the SAME response as the initial color load...
    * having the same category and the way the fold uses concat means that an array of objects or a single object (which is what the post returns) will both just work


``` js
const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
const colors$ = colorResponse$.map(res => res.body)

const postColor$ = currentColor$
    .map(color => saveClick$.map(() => color))
    .flatten().map(c => ({
        url: 'http://localhost:3000/colors',
        method: 'POST',
        category: 'colors',
        type: 'application/json',
        send: c
    }))
```

* The whole thing at this point:

``` js
'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeHTTPDriver} from '@cycle/http'
import {makeDOMDriver, h1, div, input, label, button, ul, li} from '@cycle/dom'

function LabeledSlider(sources) {
    const value$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
        .startWith(0)

    const props$ = sources.PROPS

    const view$ = xs.combine(props$, value$).map(([props, value]) => div([
            input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
            label(`${props.name}:(${value})`)
        ]))

    const sinks = {
        DOM: view$,
        VALUE: value$
    }

    return sinks
}

function main(sources) {
    const saveClick$ = sources.DOM.select('.save').events('click')
    const getInitialColors$ = xs.of({
      url: 'http://localhost:3000/colors',
      category: 'colors'
    })

    const colorResponse$ = sources.HTTP.select('colors').flatten()

    const redSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Red', min:0, max:255})})
    const red$ = redSlider.VALUE
    const redDom$ = redSlider.DOM

    const greenSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Green', min:0, max:255})})
    const green$ = greenSlider.VALUE
    const greenDom$ = greenSlider.DOM

    const blueSlider = isolate(LabeledSlider)({DOM: sources.DOM, PROPS: xs.of({name: 'Blue', min:0, max:255})})
    const blue$ = blueSlider.VALUE
    const blueDom$ = blueSlider.DOM

    const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const colors$ = colorResponse$.map(res => res.body)

    const postColor$ = currentColor$
        .map(color => saveClick$.map(() => color))
        .flatten().map(c => ({
            url: 'http://localhost:3000/colors',
            method: 'POST',
            category: 'colors',
            type: 'application/json',
            send: c
        }))

    const colorList$ = colors$.fold((acc, c) => acc.concat(c), [])

    const request$ = xs.merge(getInitialColors$, postColor$)

    const state$ = xs.combine(currentColor$, colorList$).map(([currentColor, colors]) => ({...currentColor, colors}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
            div('#colorControls', [
                h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
                dom.red,
                dom.green,
                dom.blue,
                button('.save', 'Save Color')
            ]),
            div('#colorList', [
                ul(
                    state.colors.map(c => li(
                        {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}}
                    ))
                )
            ])
        ]))

    const sinks = {
        DOM: view$,
        HTTP: request$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
})
```

## Deleting a color

* Add a link to the view for each li, including the color id

``` js
state.colors.map(c => li(
    {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}},
    [a('.delete',{attrs:{'data-color-id':c.id, href:'#'}}, ['x'])]
))
```

* Add a click handler for the link
* Map to the data-attrib and `remember()` the value

``` js
const deleteClick$ = sources.DOM.select('.delete').events('click')
    .map(ev => ev.target.getAttribute('data-color-id'))
```

* Add a `deleteColor$` request (put it with the post$)

``` js
const deleteColor$ = deleteClick$
    .map(id => ({
        url: `http://localhost:3000/colors/${id}`,
        method: 'DELETE',
        category: 'delete'
    }))
```

* And merge it in with the other requests

``` js
const request$ = xs.merge(getInitialColors$, postColor$, deleteColor$)
```

* At this point, **this will delete** on the server, but **won't update the UI** (verify with click and look at the `db.json`)
* Add a stream to handle the delete response
* And add a stream that maps that response to a usable value

``` js
const deleteResponse$ = sources.HTTP.select('delete').flatten()

const deletedItem$ = deleteResponse$.map(() => deleteClick$.map(id => ({isDelete:true, id})))
    .flatten()

```

* In order for this to work, the value from `deleteClick$` needs to be `remember()`'d

``` js
const deleteClick$ = sources.DOM.select('.delete').events('click')
    .map(ev => ev.target.getAttribute('data-color-id')).remember()
```

* Now update the `colors$` call to `fold`:
    * Merge in `deletedItem$`
    * Move reducer function out of fold so it's easier to read...
    * Update callback function to account for the different message format

``` js
const colorReducer = (acc, c) => c.isDelete ? acc.filter(color => color.id != c.id): acc.concat(c)
const colorList$ = xs.merge(colors$, deletedItem$).fold(colorReducer, [])
```

## Status Display & Form Reset

### Let's Display a Status Update on HTTP Calls

* Add a `statusText$` based on both http responses

``` js
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText)
    .startWith('')
```

* Work that into the state object

``` js
const state$ = xs.combine(currentColor$, colorList$, statusText$).map(([currentColor, colors, status]) => ({...currentColor, colors, status}))
```

* And add it to the rendered view - `h1(state.status),`
* Running this will do the following:
    * "Ok" will be displayed on initial page load - this is from the response on getInitialColors
    * Adding a color will change the displayed text to "Created"
    * Deleting will show "Ok" again
* So let's fix some stuff...
* First, we'll prevent the initial status display on load by adding a `drop(1)`

``` js
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText)
    .drop(1)
    .startWith('')
```

* Next, let's map the status text to a more friendly value
    * Add a colorMapping object
    * Update statusText map to return lowercase value
    * Map to that key in the object (or empty string for safety)

``` js
const colorMapping = {
    ok: 'Color was succesfully removed',
    created: 'Color was added'
}
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText.toLowerCase())
    .map(res => colorMapping[res] || '')
    .drop(1)
    .startWith('')
```

### Hide the message after some time

* Now let's hide the message after 2 seconds
* Add one more mapping, this time, returning a stream of streams and flattening
    * This is going to seem strange and overly complex at first... stick with me

``` js
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText.toLowerCase())
    .map(res => colorMapping[res] || '')
    .map(txt => xs.of(txt))
    .flatten()
    .drop(1)
    .startWith('')
```

* that works just as before, but adds seemingly unnecessary complexity
* Now that we are setup to map to a stream, we can just as easily return a merged stream from that map...
    * So, we'll convert that to a `xs.merge` call, and merge our static stream with a stream that will emit an empty value

``` js
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText.toLowerCase())
    .map(res => colorMapping[res] || '')
    .map(txt => xs.merge(
        xs.of(txt),
        xs.periodic(2000).map(() => '').take(1)
    ))
    .flatten()
    .drop(1)
    .startWith('')
```

* We can refactor that map on the periodic stream to a `mapTo`

``` js
const statusText$ = xs.merge(colorResponse$, deleteResponse$)
    .map(res => res.statusText.toLowerCase())
    .map(res => colorMapping[res] || '')
    .map(txt => xs.merge(
        xs.of(txt),
        xs.periodic(2000).mapTo('').take(1)
    ))
    .flatten()
    .drop(1)
    .startWith('')
```

### Let's Reset the form!

* Refactor LabeledSlider component by adding VAL source and merging with input$ (renamed from value$)
    * name merged stream `value$`

``` js
const input$ = sources.DOM.select('.slider').events('input')
    .map(ev => ev.target.value)

const slideValue$ = sources.VAL

const value$ = xs.merge(input$, slideValue$).startWith(0)
```

* Use colorResponse$ to create a stream and just map to 0

``` js
const resetSlider$ = colorResponse$.mapTo(0)
```

* Pass this into each instance of the slider as `VAL`

``` js
const redSlider = isolate(LabeledSlider)({
    DOM: sources.DOM,
    PROPS: xs.of({name: 'Red', min:0, max:255}),
    VAL: resetSlider$})
const red$ = redSlider.VALUE
const redDom$ = redSlider.DOM

const greenSlider = isolate(LabeledSlider)({
    DOM: sources.DOM,
    PROPS: xs.of({name: 'Green', min:0, max:255}),
    VAL: resetSlider$})
const green$ = greenSlider.VALUE
const greenDom$ = greenSlider.DOM

const blueSlider = isolate(LabeledSlider)({
    DOM: sources.DOM,
    PROPS: xs.of({name: 'Blue', min:0, max:255}),
    VAL: resetSlider$})
const blue$ = blueSlider.VALUE
const blueDom$ = blueSlider.DOM
```

* This will reset all 3 sliders after adding a color, but not on delete...
* So, if you are creating a color and decide to delete one before adding the replacement, you can do that
* If you want deletes to reset, just merge the `colorResponse$` and `deleteResponse$` into `resetSlider$`

### Cancel through a link

I can apply the same cancel logic by merging in a click stream...

* Add a link to the output - `a('.cancel',{attrs:{href:'#'}}, ['cancel'])`
* Add a handler for it - `const cancelClick$ = sources.DOM.select('.cancel').events('click')`
* Merge that into the `resetSlider$` stream - `const resetSlider$ = xs.merge(colorResponse$, cancelClick$).mapTo(0)`
