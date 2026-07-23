class FakeElement {
  constructor (name) {
    this.nodeName = name
    this.attributes = {}
    this.children = []
    this.parentElement = null
  }

  setAttribute (name, value) {
    this.attributes[name] = String(value)
  }

  getAttribute (name) {
    return this.attributes[name]
  }

  appendChild (child) {
    child.parentElement = this
    this.children.push(child)
    return child
  }

  prepend (child) {
    child.parentElement = this
    this.children.unshift(child)
    return child
  }
}

function installDOM () {
  global.document = {
    createElementNS: (namespace, name) => new FakeElement(name)
  }
}

function style (values = {}) {
  return {
    getPropertyValue: name => values[name] ?? ''
  }
}

module.exports = { FakeElement, installDOM, style }
