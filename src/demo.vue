<template>
    <div>
        <h1>DEMO dnd-grid Vue.js Component</h1>

        <dnd-grid-container></dnd-grid-container>
        <dnd-grid-box></dnd-grid-box>
    </div>
</template>

<script>
    import components from '../src/components';

    export default {
        components: {
            DndGridContainer: components.Container,
            DndGridBox: components.Box
        }
    };
</script>
