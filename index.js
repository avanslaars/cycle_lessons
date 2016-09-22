'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, h1, div, input} from '@cycle/dom'

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

run(main, {
    DOM: makeDOMDriver('#app')
})
