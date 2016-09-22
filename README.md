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

    const state$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const sinks = {
        DOM: xs.combine(state$, dom$).map(([state, dom]) => div([
            h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
            dom.red,
            dom.green,
            dom.blue
        ]))
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app')
})
```
