module.exports = ui

const THEMES = {
  white: 'u-themeWhite',
  sand: 'u-themeSand'
}

function ui (state, emitter, app) {
  state.ui = {
    theme: 'white',
    isPartial: false,
    inTransition: false
  }

  emitter.on('ui:transition', function (next = true) {
    state.ui.inTransition = next
  })

  emitter.on('ui:partial', function (href, getPartial) {
    getPartial(function () {
      const matched = app.router.match(href)
      const _state = Object.assign({}, state, {
        href: href,
        route: matched.route,
        params: matched.params,
        ui: Object.assign({}, state.ui, {isPartial: true})
      })
      const result = matched.cb(_state, emitter.emit.bind(emitter))
      return result
    })
  })

  emitter.on('ui:theme', function (name) {
    state.ui.theme = name
    if (typeof window !== 'undefined') {
      const theme = THEMES[name] || ''

      let value = document.documentElement.classList.value
      if (/u-theme\w+/.test(value)) {
        value = value.replace(/u-theme\w+/, theme)
      } else {
        value += ` ${theme}`
      }

      document.documentElement.setAttribute('class', value.trim())
    }
  })

  // circumvent choo default scroll-to-anchor behavior
  emitter.on('navigate', function () {
    state.ui.inTransition = false

    const el = document.getElementById(window.location.hash.substr(1))

    if (!el) {
      window.scrollTo(0, 0)
    } else {
      const from = window.scrollY
      window.setTimeout(function () {
        // reset scroll to where it was before navigate
        window.scrollTo(window.scrollX, from)
        window.setTimeout(function () {
          // smoothly scroll element into view when everything has settled
          el.scrollIntoView({behavior: 'smooth', block: 'start'})
        }, 0)
      }, 0)
    }
  })
}
