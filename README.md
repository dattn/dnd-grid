# dnd-grid-extended

> A vuejs grid with draggable and resizable boxes. This source is based on @dattn/dnd-grid. Thank you very much for all of your work @dattn.

## Collision handling
I was looking for a grid library that was rather close to how the Azure portal dashboard worked. But boxes that collided with a dragging box didn't move how I wanted, in dnd-grid, so this is an implementation solving my issue.

The **demo** requires **Vue >= 2.3.0** because of the ":layout.sync" feature

The **components** require **Vue >= 2.0.0**

# Usage

## Example

```html
<dnd-grid-container :layout.sync="layoutJson">
    <dnd-grid-box :boxId="box1Id">
        <h1>Box 1</h1>
    </dnd-grid-box>
    <dnd-grid-box :boxId="box2Id">
        <h1>Box 2</h1>
    </dnd-grid-box>
    ...
</dnd-grid-container>
```
> Also see the demo app that uses the Gallery component

## Layout JSON

```javascript
const widgets = [
    new Widget({
        id: 'box-a',
        hidden: false,
        pinned: false,
        position: {
            x: 0,
            y: 0,
            w: 4, // Multiplier for virtual grid width
            h: 2 // Multiplier for virtual grid height
       }
    }),
    new Widget({
        id: 'box-b',
        hidden: false,
        pinned: false,
        position: {
            x: 4,
            y: 0,
            w: 2,
            h: 1
        }
    }),
    ...
]
```

| Property        | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| id              | The id of the box linked with this box layout (must be unique)          |
| hidden          | hide or show the box                                                    |
| position        | The position/size in the grid                                           |

## Installation

### Using npm

`npm i --save @danielnord/dnd-grid`

### How to import (using ES6 import)

```javascript
// import Container and Box components
import { Container, Box } from '@danielnord/dnd-grid'
// minimal css for the components to work properly
import '@danielnord/dnd-grid/dist/dnd-grid.css'
```

### Setup component

```javascript
<script>
export default {
    components: {
        DndGridContainer: Container,
        DndGridBox: Box,
        DndGridGallery: Gallery
    }
}
</script>
```

## Planned work

### Gallery (WIP)
A new gallery component was added to be able to add new widgets from a list

### Properties (WIP)
Make it possible to edit properties for a widget

## License

This project is licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License)
