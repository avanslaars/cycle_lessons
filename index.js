'use strict'

import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import isolate from '@cycle/isolate'
import {makeHTTPDriver} from '@cycle/http'
import {makeDOMDriver, h1, div, input, label, button, ul, li, a} from '@cycle/dom'

function LabeledSlider(sources) {
    const input$ = sources.DOM.select('.slider').events('input')
        .map(ev => ev.target.value)

    const slideValue$ = sources.VAL

    const value$ = xs.merge(input$, slideValue$).startWith(0)

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

    const colorMapping = {
        ok: 'Color was succesfully removed',
        created: 'Color was added'
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

    const deletedItem$ = deleteResponse$.map(() => deleteClick$.map(id => ({isDelete:true, id})))
        .flatten()

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

    const deleteColor$ = deleteClick$
        .map(id => ({
            url: `http://localhost:3000/colors/${id}`,
            method: 'DELETE',
            category: 'delete'
        }))

    const colorReducer = (acc, c) => c.isDelete ? acc.filter(color => color.id != c.id): acc.concat(c)
    const colorList$ = xs.merge(colors$, deletedItem$).fold(colorReducer, [])

    const request$ = xs.merge(getInitialColors$, postColor$, deleteColor$)

    const state$ = xs.combine(currentColor$, colorList$, statusText$).map(([currentColor, colors, status]) => ({...currentColor, colors, status}))
    const dom$ = xs.combine(redDom$, greenDom$, blueDom$).map(([red,green,blue]) => ({red, green, blue}))

    const view$ = xs.combine(state$, dom$).map(([state, dom]) => div([
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
