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
    <dnd-grid-box :boxId="box2Id" resizeVisible>
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
## Container:

| Property               | Default         | Description                                                               |
|----------------------- | --------------- | ------------------------------------------------------------------------- |
| layout                 |                 | Array of objects each representing a box with the below Object properties |
|   - id                 |                 | The id of the box linked with this box layout (must be unique)            |
|   - hidden             |                 | hide or show the box                                                      |
|   - pinned             |                 | If pinned, the box can not be dragged/resized and always stays in place   |
|   - position           |                 | The position/size in the grid                                             |
|   - - x                |                 | The x position in the grid by cells                                       |
|   - - y                |                 | The y position in the grid by cells                                       |
|   - - w                |                 | The width in the grid by cells                                            |
|   - - h                |                 | The height in the grid by cells                                           |
| cellSize               |                 | Object describing the default cell size                                   |
|   - w                  | 100             | Width in pixels                                                           |
|   - h                  | 100             | Height in pixels                                                          |
| maxColumnCount         | infinity        | Integer max columns                                                       |
| maxRowCount            | infinity        | Integer max rows                                                          |
| margin                 | 5               | Integer in pixels                                                         |
| outerMargin            | 0               | Integer in pixels                                                         |
| bubbleUp               | false           | Boolean when true bubbles boxes to the top of the screen                  |
| autoAddLayoutForNewBox | true            | Boolean                                                                   |
| defaultSize            |                 | Default size of a new box                                                 |
|   - w                  | 1               | Width in cells                                                            |
|   - h                  | 1               | Height in cells                                                           |
| fixLayoutOnLoad        | true            | Boolean describing to fix layout (overlaps) on load                       |

## Box:

| Property               | DEFAULT         | Description                                                               |
|----------------------- | --------------- | ------------------------------------------------------------------------- |
| boxId                  | !               | String, Box id, this is a required field                                  |
| dragSelector           | *               | String, id of the element by which you can drag the box                   |
| resizeVisible          | false           | Boolean, displays a circle the corner of boxes on mobile devices          |

## Installation

### Using npm or yarn

`npm i --save @dattn/dnd-grid`

`yarn install @dattn/dnd-grid`

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
