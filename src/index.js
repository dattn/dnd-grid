const components = require('./components');
module.exports = components;

components.forEach(component => {
    component.install = Vue => Vue.component(component.name, component);
    component.version = proccess.env.VERSION;

    // Install by default if using the script tag
    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(component);
    }
});
