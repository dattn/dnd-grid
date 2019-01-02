import Box from './box'
export default class Widget extends Box {
    constructor(box) {
        super(box)
        this.schema = box.schema
        this.tag = box.tag
        this.properties = {
            ...box.properties
        }
        if (!this.properties.title) {
            this.properties.title = null
        }

        if (!this.properties.address) {
            this.properties.address = null
        }

        if (!this.properties.filters) {
            this.properties.filters = null
        }

        if (!this.properties.timeFrame) {
            this.properties.timeFrame = null
        }
    }

    /**
     * Returns a copy as a Widget object
     */
    copy() {
        return new Widget(JSON.parse(JSON.stringify(this)))
    }
    /**
     * Returns a copy as a JS Object
     */
    object() {
        return JSON.parse(JSON.stringify(this))
    }
}
