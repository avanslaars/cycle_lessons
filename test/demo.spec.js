'use strict'

import intent from '../intent'
import xs from 'xstream'
import xsAdapter from '@cycle/xstream-adapter'
import {mockDOMSource} from '@cycle/dom'

const getSources = function getSources(opts = {deleteStatusText: 'ok'}) {
  const domSource = mockDOMSource(xsAdapter, {
    '.save': {
      'click': xs.of({target:{}})
    },
    '.delete': {
      'click': xs.of({target:{getAttribute:(name) => name == 'data-color-id' ? '42' : ''}})
    },
    '.cancel': {
      'click': xs.of({target:{}})
    }
  })

  const httpSource = {
    select: function(cat) {
      if(cat === 'delete'){
        return xs.of(
          xs.of({statusText:opts.deleteStatusText})
        )
      } else {
        return xs.empty()
      }
    }
  }

  return {
    DOM: domSource,
    HTTP: httpSource
  }
}

test('deletedItem$ is empty stream for error', (done) => {
  const {deletedItem$} = intent(getSources({deleteStatusText:'Error'}))
  deletedItem$.addListener({
    next: function(){
      // Empty stream will immediately complete, so if this runs fail
      expect(true).toBe(false)
      done()
    },
    error: console.error,
    complete: function(){
      // immediate completion will pass test
      done()
    }
  })
})

test('deletedItem$ is has correct id for success', (done) => {
  const {deletedItem$} = intent(getSources())
  deletedItem$.addListener({
    next: function(result){
      expect(result.id).toBe('42')
      done()
    },
    error: console.error,
    complete: console.info
  })
})
