'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeHTTPDriver} from '@cycle/http'
import {makeDOMDriver, h1, div, input, label, button, ul, li, a} from '@cycle/dom'
import LabeledSlider from './LabeledSlider'

function intent(sources) {
  const saveClick$ = sources.DOM.select('.save').events('click')
  const deleteClick$ = sources.DOM.select('.delete').events('click')
      .map(ev => ev.target.getAttribute('data-color-id')).remember()

  const cancelClick$ = sources.DOM.select('.cancel').events('click')

  const getInitialColors$ = xs.of({
    url: 'http://localhost:3000/colors',
    category: 'colors'
  })

  const colorResponse$ = sources.HTTP.select('colors').flatten()
  const deleteResponse$ = sources.HTTP.select('delete').flatten()

  const resetSlider$ = xs.merge(colorResponse$, cancelClick$).mapTo(0)

  const currentColorProxy$ = xs.create()
  const postColor$ = currentColorProxy$
    .map(color => saveClick$.map(() => color))
    .flatten().map(c => ({
        url: 'http://localhost:3000/colors',
        method: 'POST',
        category: 'colors',
        type: 'application/json',
        send: c
    }))

  const deleteColor$ = deleteClick$
    .map(id => ({
        url: `http://localhost:3000/colors/${id}`,
        method: 'DELETE',
        category: 'delete'
    }))

  const deletedItem$ = deleteResponse$.map(() => deleteClick$.map(id => ({isDelete:true, id})))
      .flatten()

  return {
    getInitialColors$,
    colorResponse$,
    deleteResponse$,
    resetSlider$,
    currentColorProxy$,
    postColor$,
    deleteColor$,
    deletedItem$,
    dom$: sources.DOM
  }
}

function model(actions) {
  const colorMapping = {
    ok: 'Color was succesfully removed',
    created: 'Color was added'
  }

  const statusText$ = xs.merge(actions.colorResponse$, actions.deleteResponse$)
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
      DOM: actions.dom$,
      PROPS: xs.of({name: 'Red', min:0, max:255}),
      VAL: actions.resetSlider$})
  const red$ = redSlider.VALUE
  const redDom$ = redSlider.DOM

  const greenSlider = isolate(LabeledSlider)({
      DOM: actions.dom$,
      PROPS: xs.of({name: 'Green', min:0, max:255}),
      VAL: actions.resetSlider$})
  const green$ = greenSlider.VALUE
  const greenDom$ = greenSlider.DOM

  const blueSlider = isolate(LabeledSlider)({
      DOM: actions.dom$,
      PROPS: xs.of({name: 'Blue', min:0, max:255}),
      VAL: actions.resetSlider$})
  const blue$ = blueSlider.VALUE
  const blueDom$ = blueSlider.DOM

  const currentColor$ = xs.combine(red$, green$, blue$).map(([red,green,blue]) => ({red, green, blue}))
  actions.currentColorProxy$.imitate(currentColor$)
  const colors$ = actions.colorResponse$.map(res => res.body)

  const colorReducer = (acc, c) => c.isDelete ? acc.filter(color => color.id != c.id): acc.concat(c)
  const colorList$ = xs.merge(colors$, actions.deletedItem$).fold(colorReducer, [])

  const request$ = xs.merge(actions.getInitialColors$, actions.postColor$, actions.deleteColor$)

  const state$ = xs.combine(currentColor$, colorList$, statusText$).map(([currentColor, colors, status]) => ({...currentColor, colors, status}))
  const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

  const model$ = xs.combine(state$, dom$)
  return {
    model$,
    request$
  }
}

function view(model$) {
  return model$.map(([state, dom]) => div([
      div('#colorControls', [
          h1({attrs:{style:`color:rgb(${state.red}, ${state.green}, ${state.blue})`}},'Current Color'),
          dom.red,
          dom.green,
          dom.blue,
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
    const actions = intent(sources)
    const appState = model(actions)
    const view$ = view(appState.model$)

    const sinks = {
        DOM: view$,
        HTTP: appState.request$
    }
    return sinks
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
})
