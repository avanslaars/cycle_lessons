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
