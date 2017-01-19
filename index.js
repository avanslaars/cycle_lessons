'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeHTTPDriver} from '@cycle/http'
import {makeDOMDriver, h1, div, input, label, button, ul, li, a} from '@cycle/dom'
import LabeledSlider from './LabeledSlider'
import intent from './intent'


function model(actions) {
  const {colorResponse$, deleteResponse$, resetSlider$,
    currentColorProxy$, request$, deletedItem$, dom$} = actions

  const colorMapping = {
    ok: 'Color was succesfully removed',
    created: 'Color was added',
    error: 'Ooops!'
  }

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

  const redSlider = isolate(LabeledSlider)({
      DOM: dom$,
      PROPS: xs.of({name: 'Red', min:0, max:255}),
      VAL: resetSlider$})
  const red$ = redSlider.VALUE
  const redDom$ = redSlider.DOM

  const greenSlider = isolate(LabeledSlider)({
      DOM: dom$,
      PROPS: xs.of({name: 'Green', min:0, max:255}),
      VAL: resetSlider$})
  const green$ = greenSlider.VALUE
  const greenDom$ = greenSlider.DOM

  const blueSlider = isolate(LabeledSlider)({
      DOM: dom$,
      PROPS: xs.of({name: 'Blue', min:0, max:255}),
      VAL: resetSlider$})
  const blue$ = blueSlider.VALUE
  const blueDom$ = blueSlider.DOM

  const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
  currentColorProxy$.imitate(currentColor$)
  const colors$ = colorResponse$.map(res => res.body)

  const colorReducer = (acc, c) => c.isDelete ? acc.filter(color => color.id != c.id): acc.concat(c)
  const colorList$ = xs.merge(colors$, deletedItem$).fold(colorReducer, [])

  const state$ = xs.combine(currentColor$, colorList$, statusText$).map(([currentColor, colors, status]) => ({...currentColor, colors, status}))
  const combinedDom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

  return xs.combine(state$, combinedDom$)
    .map(([state, dom]) => ({
        red:state.red,
        green: state.green,
        blue: state.blue,
        status: state.status,
        colors: state.colors,
        redDom: dom.red,
        greenDom: dom.green,
        blueDom: dom.blue
    }))
}

function view(model$) {
  return model$.map(state => div([
      div('#colorControls', [
          h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
          state.redDom,
          state.greenDom,
          state.blueDom,
          button('.save', 'Save Color'),
          a('.cancel',{attrs:{href:'#'}}, ['cancel']),
          div('.statusMessage', state.status)
      ]),
      div('#colorList', [
          ul(
              state.colors.map(c => li(
                  {attrs:{style:`background-color:rgb(${c.red}, ${c.green}, ${c.blue})`}},
                  [a('.delete',{attrs:{'data-color-id':c.id, href:'#'}}, ['x'])]
              ))
          )
      ])
  ]))
}

function main(sources) {
    const {request$, preventDefaultEvent$, ...actions} = intent(sources)
    const model$ = model(actions)
    const view$ = view(model$)

    const sinks = {
        DOM: view$,
        HTTP: request$,
        preventDefault: preventDefaultEvent$
    }
    return sinks
}

function preventDefaultDriver(ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault(),
    error: () => {},
    complete: () => {},
  });
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    preventDefault: preventDefaultDriver
})
