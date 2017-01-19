'use strict'

import xs from 'xstream'

export default function intent(sources) {
  const saveClick$ = sources.DOM.select('.save').events('click')
  // TODO: Update notes to reflect the update that broke out deleteId from deleteClick
  const deleteClick$ = sources.DOM.select('.delete').events('click')

  const deleteId$ = deleteClick$
      .map(ev => ev.target.getAttribute('data-color-id')).remember()

  const cancelClick$ = sources.DOM.select('.cancel').events('click')

  const preventDefaultEvent$ = xs.merge(deleteClick$, cancelClick$)

  const getInitialColors$ = xs.of({
    url: 'http://localhost:3000/colors',
    category: 'colors'
  })


  const colorResponse$ = sources.HTTP.select('colors')
    .map(resp$ => resp$.replaceError(err => xs.of({body:[], statusText: 'Error'})))
    .flatten()
  const deleteResponse$ = sources.HTTP.select('delete')
    .map(resp$ => resp$.replaceError(err => xs.of({body:[], statusText: 'Error'})))
    .flatten()

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

  const deleteColor$ = deleteId$
    .map(id => ({
        url: `http://localhost:3000/colors/${id}`,
        method: 'DELETE',
        category: 'delete'
    }))

  const deletedItem$ = deleteResponse$.map(resp => resp.statusText == 'Error' ? xs.empty() : deleteId$.take(1).map(id => ({isDelete:true, id})))
      .flatten()

  const request$ = xs.merge(getInitialColors$, postColor$, deleteColor$)

  return {
    colorResponse$,
    deleteResponse$,
    resetSlider$,
    currentColorProxy$,
    request$,
    deletedItem$,
    preventDefaultEvent$,
    dom$: sources.DOM
  }
}
