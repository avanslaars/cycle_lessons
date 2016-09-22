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
