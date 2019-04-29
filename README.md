# React Wooden Tree 

[![Build Status](https://travis-ci.com/brumik/react-wooden-tree.svg?branch=master)](https://travis-ci.com/brumik/react-wooden-tree)

The tree can be used with redux and of course without it. With the correct
usage of redux the tree renders the changes faster.

For detailed information visit the docs page: (and turn off inherited methods)
[https://brumik.github.io/react-wooden-tree/](https://brumik.github.io/react-wooden-tree/).

## Dependencies
* [React](https://reactjs.org/)
* [React Dom](https://www.npmjs.com/package/react-dom)
* [Redux](https://redux.js.org/) and [React-Redux](https://react-redux.js.org/) - only if you want to use with redux
* [Font Awesome](https://fontawesome.com/) - only if using default icons

## Install
The component can be installed with `npm`:
```bash
npm install --save react-wooden-tree
```
or you can download manually from [GitHub](https://github.com/brumik/react-wooden-tree).

## Basic usage
See the `demo-app` folder for the examples
* `App.tsx` - This is the redux example
* `App-NonRedux.tsx`

To make it work first in the main directory run `npm install` and `
npm run build` to generate the package as the demo application uses 
local build. Then run `npm install` from `/demo-app` and `npm run start`
to start the application.

All the helper methods and definitions
are documented on the [docs page](https://brumik.github.io/react-wooden-tree/).

## Data Structure
The tree accepts flat structured data but supplies function for conversion
from hierarchical data. 


### Flat Data Structure
The structure used by the tree:
```typescript
/**
 * Defines the TreeDataType format
 */
export interface TreeDataType {
    /** The key should be the same as nodeId */
    [key: string]: NodeProps;
}

/**
 * Node properties interface.
 */
export interface NodeProps {
    /** The node ID - Required */
    nodeId?: string;
    /** The text to display on node */
    text?: string;
    /** List of node ids of the node's children */
    nodes?: string[];
    /** The state of the node */
    state?: {
        checked?: boolean;
        disabled?: boolean;
        expanded?: boolean;
        selected?: boolean;
    };
    
    checkable?: boolean;
    hideCheckbox?: boolean;

    selectable?: boolean;
    selectedIcon?: string;

    /** Inidcates if node is lazy loadable or not */
    lazyLoad?: boolean;
    /** If true, loading icon is showed, if null, then error icon is showed */
    loading?: boolean;

    /** Custom attribute field */
    attr?: {[key: string]: string};

    // Styling
    icon?: string;
    iconColor?: string;
    iconBackground?: string;
    image?: string;
    classes?: string;
}
```
State should be initialized with the `Tree.initTree()` function before use.

### Hierarchical data structure
```typescript
export interface HierarchicalNodeProps {
    nodeId?: string;
    nodes?: HierarchicalNodeProps[];
    /** Other props from NodeProps interface */
    [propTypes: string]: any;
}
```
This is more people friendly structure, where the hierarchy is maintained by
nesting the objects. If you have a structure like this you do not need to
initialize the `nodeId` but before usage you have to initialize the tree
with `Tree.initHierarchicalTree()` and flatten it with te function
`Tree.convertHierarchicalTree()`. 
