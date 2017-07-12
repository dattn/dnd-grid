const components = require('./components')
module.exports = components

const initComponent = (component) => {
    component.install = Vue => Vue.component(component.name, component)

    // Install by default if using the script tag
    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(component)
    }
}

for (let key in components) {
    initComponent(components[key])
}
