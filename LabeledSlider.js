'use strict'

import xs from 'xstream'
import {input, label, div} from '@cycle/dom'

function intent(sources) {
  const input$ = sources.DOM.select('.slider').events('input')
      .map(ev => ev.target.value)

  const slideValue$ = sources.VAL
  const props$ = sources.PROPS

  return {
    input$,
    slideValue$,
    props$
  }
}

function model(actions) {
  const value$ = xs.merge(actions.input$, actions.slideValue$).startWith(0)
  return {
    value$,
    state$: xs.combine(actions.props$, value$)
  }
}

function view(state$) {
  return state$.map(([props, value]) => div([
      input('.slider', {attrs:{type:'range', min:props.min, max:props.max}, props:{value:value}}),
      label(`${props.name}:(${value})`)
  ]))
}

export default function LabeledSlider(sources) {
    const actions = intent(sources)
    const theModel = model(actions)
    const view$ = view(theModel.state$)
    const sinks = {
        DOM: view$,
        VALUE: theModel.value$
    }
    return sinks
}
