<template>
    <div>
        <h1>DEMO dnd-grid Vue.js Component</h1>

        <dnd-grid-container
            :layout="layout"
            @layoutUpdate="onLayoutUpdate"
        >
            <dnd-grid-box
                v-for="box in layout"
                :x="box.x"
                :y="box.y"
                :w="box.w"
                :h="box.h"
                :hide="box.hide"
                :boxId="box.id"
                :key="box.id"
            >
                Box {{ box.id }}
            </dnd-grid-box>
        </dnd-grid-container>
    </div>
</template>

<script>
    import components from '../src/components';

    export default {
        components: {
            DndGridContainer: components.Container,
            DndGridBox: components.Box
        },

        data() {
            return {
                layout: [
                    {
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 1,
                        id: 'a'
                    },
                    {
                        x: 2,
                        y: 0,
                        w: 1,
                        h: 2,
                        id: 'b'
                    },
                    {
                        x: 0,
                        y: 1,
                        w: 2,
                        h: 3,
                        id: 'c'
                    },
                    {
                        x: 2,
                        y: 2,
                        w: 3,
                        h: 1,
                        id: 'd'
                    }
                ]
            }
        },

        methods: {
            onLayoutUpdate(evt) {
                this.layout = evt.layout;
            }
        }
    };
</script>
