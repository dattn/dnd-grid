# dnd-grid

> A vuejs grid with draggable and resizable boxes

[Demo page](https://dnd-grid.duton.lu/)

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

## Layout JSON

```javascript
[
    {
        id: 'box-a',
        hidden: false,
        pinned: false,
        position: {
            x: 0,
            y: 0,
            w: 4, // Multiplier for virtual grid width
            h: 2 // Multiplier for virtual grid height
       }
    },
    {
        id: 'box-b',
        hidden: false,
        pinned: false,
        position: {
            x: 4,
            y: 0,
            w: 2,
            h: 1
        }
    },
    ...
]
```

| Property        | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| id              | The id of the box linked with this box layout (must be unique)          |
| hidden          | hide or show the box                                                    |
| pinned          | If pinned, the box can not be dragged/resized and always stays in place |
| position        | The position/size in the grid                                           |

## Installation

### Using npm

`npm i --save @dattn/dnd-grid`

### How to import (using ES6 import)

```javascript
// import Container and Box components
import { Container, Box } from '@dattn/dnd-grid'
// minimal css for the components to work properly
import '@dattn/dnd-grid/dist/dnd-grid.css'
```

### Setup component

```javascript
<script>
export default {
    components: {
        DndGridContainer: Container,
        DndGridBox: Box
    }
}
</script>
```

## License

This project is licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License)
