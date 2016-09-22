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

```
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

```
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

```
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
