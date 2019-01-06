tr<template>
    <div class="widgetGallery">
        <nav class="navbar">
            <div>
                <template id="widget-template">
                    <ul class="widgets">
                        <li class="widget"
                            v-for="widget in availableWidgets"
                            :key="widget.id"
                            @click="addWidget(widget)">
                            <h3>{{ widget.title }}</h3>
                            <p>
                                {{ widget.description }}
                            </p>
                        </li>
                    </ul>
                </template>
            </div>
        </nav>
    </div>
</template>

<script>
import Guid from './guid.js'
let guid = new Guid()

export default {
    props: {
        availableWidgets: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            list: this.data
        }
    },
    components: {
    },
    methods: {
        addWidget(widgetTemplate) {
            let widget = widgetTemplate.copy()
            widget.id = guid.generate()
            this.$emit('addWidget', widget)
        }
    },
    template: '#widget-template'
}
</script>
<style scoped="">
.widgetGallery {
    padding: 8px;
}

li {
    list-style: none;
}

.widget {
    background: #888;
    border-radius: 4px;
    padding: 2px 8px;
}

</style>
