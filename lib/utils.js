'use strict'
var Link = require('rax-link')
var Rax = require('rax')
var camelCase = require('lodash.camelcase')
var toPairs = require('ramda/src/toPairs')
var reduce = require('ramda/src/reduce')
var camelCaseAttrMap = require('./camel-case-attribute-names')

function createStyleJsonFromString(styleString) {
  styleString = styleString || ''
  var styles = styleString.split(/;(?!base64)/)
  var singleStyle,
    key,
    value,
    jsonStyles = {}
  for (var i = 0; i < styles.length; ++i) {
    singleStyle = styles[i].split(':')
    if (singleStyle.length > 2) {
      singleStyle[1] = singleStyle.slice(1).join(':')
    }

    key = singleStyle[0]
    value = singleStyle[1]
    if (typeof value === 'string') {
      value = value.trim()
    }

    if (key != null && value != null && key.length > 0 && value.length > 0) {
      jsonStyles[camelCase(key)] = value
    }
  }
  return jsonStyles
}

function createElement(node, index, data, children) {
  var elementProps = {
    key: index
  }
  if (node.attribs) {
    elementProps = reduce(
      function(result, keyAndValue) {
        var key = keyAndValue[0]
        var value = keyAndValue[1]
        key = camelCaseAttrMap[key.replace(/[-:]/, '')] || key
        if (key === 'style') {
          value = createStyleJsonFromString(value)
        } else if (key === 'class') {
          key = 'className'
        } else if (key === 'for') {
          key = 'htmlFor'
        }
        if (typeof value === 'string') {
          value = value
        }
        result[key] = value || key
        return result
      },
      elementProps,
      toPairs(node.attribs)
    )
  }

  children = children || []
  var allChildren = data != null ? [data].concat(children) : children
  if (node.name === 'a') {
    let defaultStyle = { color: 'deepskyblue' }
    let style = elementProps.style || {}
    Object.assign(defaultStyle, style)
    elementProps.style = defaultStyle

    return Rax.createElement.apply(null, [Link, elementProps].concat(allChildren))
  } else {
    return Rax.createElement.apply(null, [node.name, elementProps].concat(allChildren))
  }
}

module.exports = {
  createElement: createElement
}
