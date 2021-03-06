import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { HierarchicalNodeProps, NodeProps, Tree, treeDataReducer, TreeDataType } from '..';
import { ReactTestRendererJSON } from 'react-test-renderer';

let treeH: HierarchicalNodeProps[];
let tree2H: HierarchicalNodeProps[];
let tree3H: HierarchicalNodeProps[];
let tree: TreeDataType;
let tree2: TreeDataType;
let tree3: TreeDataType;

const initState = {
    checked: false,
    selected: false,
    disabled: false,
    expanded: false
};

/** Updated if called onDataChange */
let lastChange: any;

/** Indicates how many times were the onDataChange called */
let changeCounter: number;

/**
 * Does the actions which are required simulating data changes.
 * Dummy function to get idea what was called from the tree.
 * Updates lastChange and increments changeCounter globals.
 *
 * @param {[string, string, object]} commands The array of node changing commands.
 */
let onDataChange = (commands: [string, string, any]) => {
    let temp = {...tree2};
    for ( let i = 0; i < commands.length; i++ ) {
        let command = commands[i];
        temp = treeDataReducer(temp, command);
        changeCounter++;
        lastChange = [command.nodeId, command.type, command.value];
    }
    tree2 = temp;
};

/**
 * Returns dummy children to a node in TreeDataType structure.
 *
 * @param parentId
 */
function flatLazyChildren(parentId: string): TreeDataType {
    return {
        [parentId + '.0']: {nodeId: parentId + '.0', text: 'Sub Parent 0',
            state: {expanded: false, disabled: false, checked: false, selected: false}
        },
        [parentId + '.1']: {nodeId: parentId + '.1', text: 'Sub Parent 1',
            state: {expanded: false, disabled: false, checked: false, selected: false}
        },
        [parentId + '.2']: {nodeId: parentId + '.2', text: 'Sub Parent 2',
        state: {expanded: false, disabled: false, checked: true, selected: false}
    }
    };
}

/**
 * Lazy load fail trigger
 */
let failLazyLoad: boolean;

/**
 * Promise Helper
 */
let promise: Promise<TreeDataType>;

/**
 * Lazy loading dummy
 * @param node
 */
let lazyLoad = (node: NodeProps): Promise<TreeDataType> => {
    promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if ( !failLazyLoad ) {
                resolve(flatLazyChildren(node.nodeId));
            } else {
                reject(new Error('Something happened.'));
            }
        }, 10);
    });

    return promise;
};

/**
 * Selects the required li element in the list.
 *
 * @param {ReactTestRendererJSON} node The created node with renderer.
 * @param {string} nodeId The nodeId of the required li element.
 * @returns {ReactTestRendererJSON} The li element.
 */
function liSelector(node: ReactTestRendererJSON, nodeId: string): ReactTestRendererJSON {
    let ul = node.children[0];
    let fieldName = 'data-id';
    for ( let i = 0; i < ul.children.length; i++ ) {
        if ( ul.children[i].props[fieldName] === nodeId ) {
            return ul.children[i];
        }
    }

    return null;
}

/**
 * Selects the first children by className. Non recursive.
 *
 * @param {ReactTestRendererJSON} li The li to search children in.
 * @param {string} className The required class name.
 * @returns {ReactTestRendererJSON} The element which has the class.
 */
function childrenClassSelector(li: ReactTestRendererJSON, className: string): ReactTestRendererJSON {
    for (let i = 0; i < li.children.length; i++) {
        if ( li.children[i].props.className.includes(className) ) {
            return li.children[i];
        }
    }
    return null;
}

/**
 * Selects the first children by className. Non recursive.
 *
 * @param {ReactTestRendererJSON} li The li to search children in.
 * @param {string} type The type of the child.
 * @returns {ReactTestRendererJSON} The element with the defined type.
 */
function childrenTypeSelector(li: ReactTestRendererJSON, type: string): ReactTestRendererJSON {
    for (let i = 0; i < li.children.length; i++) {
        if ( li.children[i].type === type) {
            return li.children[i];
        }
    }
    return null;
}

/**
 * Helper: Selects children.
 *
 * @param {ReactTestRendererJSON} li The li to search in.
 * @param {string} button Valid values: expand, check, text.
 * @returns {ReactTestRendererJSON} The element or null if not found.
 */
function childrenSelector(li: ReactTestRendererJSON, button: string): ReactTestRendererJSON {
    switch (button) {
        case 'expand':
            return childrenClassSelector(li, 'expand-button');
        case 'check':
            return childrenClassSelector(li, 'checkbox-button');
        case 'text':
            return childrenTypeSelector(li, 'span');
        default:
            return null;
    }
}

/**
 * Resetting the event changes, and restoring the tree.
 */
beforeEach(() => {
    lastChange = null;
    changeCounter = 0;
    failLazyLoad = false;
    promise = null;

    treeH = [
        {text: 'Parent 0',
            nodes: [
                {text: 'Child 0.0'},
                {text: 'Child 0.1',
                    nodes: [
                        {text: 'Child 0.1.0', attr: {'data-info': 'search2', 'data-desc': 'searchDescExtended'}}
                    ]},
                {text: 'Child 0.2', attr: {'data-info': 'search1', 'data-desc': 'searchDesc'}}
            ]},
        {text: 'Parent 1', state: {selected: true}, attr: {'data-info': 'search1', 'data-desc': 'searchDesc'}}
    ];

    tree2H = [
        {text: 'Parent 0', state: {disabled: true},
            nodes: [
                {text: 'Child 0.0'}
            ]
        },
        {text: 'Parent 1', state: {expanded: true},
            nodes: [
                {text: 'Child 1.0', state: {expanded: true},
                    nodes: [
                        {text: 'Child 1.0.0', state: {selected: true}},
                        {text: 'Child 1.0.1'},
                        {text: 'Child 1.0.2'}
                    ]
                },
                {text: 'Child 1.1'}
            ]
        },
        {text: 'Parent 2', lazyLoad: true},
    ];

    tree3H = [
        {text: 'Parent 0', state: {selected: true}},
        {text: 'Parent 1', state: {selected: true}}
    ];

    tree = Tree.convertHierarchicalTree(Tree.initHierarchicalTree(treeH));
    tree2 = Tree.convertHierarchicalTree(Tree.initHierarchicalTree(tree2H));
    tree3 = Tree.convertHierarchicalTree(Tree.initHierarchicalTree(tree3H));
});

describe('tree public method', () => {
    it('should initialize the state correctly from flat tree', () => {
        let flatTree: TreeDataType = {
            ['']: {text: 'Root', nodeId: '', nodes: ['0', '1']},
            ['0']: {text: 'Parent 0', nodeId: '0', nodes: []},
            ['1']: {text: 'Parent 1', nodeId: '1', nodes: ['1.0']},
            ['1.0']: {text: 'Children 0', nodeId: '1.0', nodes: []},
        };

        flatTree = Tree.initTree(flatTree);
        for ( let node in flatTree ) {
            if ( !flatTree.hasOwnProperty(node) ) {
                continue;
            }
            expect(flatTree[node].state).toMatchObject(initState);
        }
    });

    it('should initialize the ids and state correctly from hierarchical tree', () => {
        expect(tree).not.toBeNull();

        expect(treeH[0].nodes[1].nodes[0].nodeId).toBe('0.1.0');
        expect(treeH[0].nodes[1].nodes[0].state).toMatchObject(initState);

        expect(treeH[0].nodes[0].nodeId).toBe('0.0');
        expect(treeH[0].nodes[0].state).toMatchObject(initState);

        expect(treeH[1].nodeId).toBe('1');
        expect(treeH[1].state).toMatchObject({...initState, selected: true});
    });

    it('should return the correct node by id', () => {
        let node = Tree.nodeSelector(tree, '0.2');
        expect(node.text).toBe('Child 0.2');

        node = Tree.nodeSelector(tree, '1');
        expect(node.text).toBe('Parent 1');
    });

    it('should return the correct node ids in the whole tree by attribute value', () => {
        let ids = Tree.nodeSearch(tree, null, 'data-info', 'search1');
        expect(ids.length).toBe(2);
        expect(ids[0]).toBe('1');
        expect(ids[1]).toBe('0.2');
    });

    it('should return the correct node ids in a subtree by attribute value', () => {
        let ids = Tree.nodeSearch(tree, '0', 'data-info', 'search1');
        expect(ids.length).toBe(1);
        expect(ids[0]).toBe('0.2');
    });

    it('should update the tree correctly', () => {
        let node = Tree.nodeSelector(tree, '1');

        node.text = 'Edited Node';
        Tree.nodeUpdater(tree, node);
        expect(tree[1].text).toBe('Edited Node');

        node = Tree.nodeSelector(tree, '0.1.0');
        node.text = 'Edited Child Node';
        expect(tree[treeH[0].nodes[1].nodes[0].nodeId].text).toBe('Edited Child Node');
    });

    it('should return node with changed checked state', () => {
        let node = Tree.nodeSelector(tree, '1');

        node = Tree.nodeChecked(node, true);
        expect(node.state).toMatchObject({
            checked: true,
            expanded: false,
            disabled: false,
            selected: true
        });

        node = Tree.nodeChecked(node, false);
        expect(node.state).toMatchObject({
            checked: false,
            expanded: false,
            disabled: false,
            selected: true
        });
    });

    it('should return node with changed expanded state', () => {
        let node = Tree.nodeSelector(tree, '1');

        node = Tree.nodeExpanded(node, true);
        expect(node.state).toMatchObject({
            expanded: true,
            disabled: false,
            selected: true,
            checked: false
        });

        node = Tree.nodeExpanded(node, false);
        expect(node.state).toMatchObject({
            expanded: false,
            disabled: false,
            selected: true,
            checked: false
        });
    });

    it('should return node with changed disabled state', () => {
        let node = Tree.nodeSelector(tree, '1');

        node = Tree.nodeDisabled(node, true);
        expect(node.state).toMatchObject({
            expanded: false,
            disabled: true,
            selected: true,
            checked: false
        });

        node = Tree.nodeDisabled(node, false);
        expect(node.state).toMatchObject({
            expanded: false,
            disabled: false,
            selected: true,
            checked: false
        });
    });

    it('should return node with changed selected state', () => {
        let node = Tree.nodeSelector(tree, '1');

        node = Tree.nodeSelected(node, false);
        expect(node.state).toMatchObject({
            expanded: false,
            disabled: false,
            selected: false,
            checked: false
        });

        node = Tree.nodeSelected(node, true);
        expect(node.state).toMatchObject({
            expanded: false,
            disabled: false,
            selected: true,
            checked: false
        });
    });

    it('should return node with changed children nodes', () => {
        let node = Tree.nodeSelector(tree, '1');

        let subTree = flatLazyChildren(node.nodeId);
        node = Tree.nodeChildren(node, Object.keys(subTree));

        expect(node.nodes).not.toBeNull();
        expect(node.nodes).toMatchObject(Object.keys(subTree));
    });

    it('should return node with changed loading state', () => {
        let node = Tree.nodeSelector(tree, '1');

        node = Tree.nodeLoading(node, true);
        expect(node.loading).toBeTruthy();

        node = Tree.nodeLoading(node, false);
        expect(node.loading).toBeFalsy();
    });
});

describe('tree events', () => {

    it('should not call checked event if node is disabled', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                />
            )
            .toJSON();

        let checkButton = childrenSelector(liSelector(node, '0'), 'check');
        checkButton.props.onClick();
        expect(changeCounter).toEqual(0);
    });

    it('should not call selected event but expand event if node is disabled', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                />
            )
            .toJSON();

        let span = childrenSelector(liSelector(node, '0'), 'text');
        span.props.onClick();
        expect(changeCounter).toEqual(1);
        expect(lastChange).toMatchObject(['0', 'state.expanded', true]);
    });

    it('should call check function once with no hierarchical check', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={false}
                />
            )
            .toJSON();

        let check = childrenSelector(liSelector(node, '1'), 'check');
        check.props.onClick();
        expect(changeCounter).toEqual(2);
        expect(lastChange).toMatchObject(['1', 'state.checked', true]);
    });

    it('should call check function more times with hierarchical check', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            )
            .toJSON();

        let check = childrenSelector(liSelector(node, '1'), 'check');
        check.props.onClick();
        expect(changeCounter).toEqual(7);

        // Last change check
        expect(lastChange[1]).toMatch('state.checked');
        expect(lastChange[2]).toBeTruthy();
    });

    it('should call check function for all parents with hierarchical check', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            )
            .toJSON();

        let check = childrenSelector(liSelector(node, '1.0.0'), 'check');
        check.props.onClick();
        expect(changeCounter).toEqual(4);

        // Last change check
        expect(lastChange[1]).toMatch('state.checked');
        expect(lastChange[2]).toBe(null);
    });

    it('should check parent if all children checked', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            );

        let check = childrenSelector(liSelector(node.toJSON(), '1.0'), 'check');
        check.props.onClick();

        node.update(
            <Tree
                data={tree2}
                callbacks={{
                    onDataChange: onDataChange,
                }}
                showCheckbox={true}
                hierarchicalCheck={true}
            />
        );

        check = childrenSelector(liSelector(node.toJSON(), '1.1'), 'check');
        check.props.onClick();

        // Check self, parent and two children + self, parent
        expect(changeCounter).toEqual(9);

        node.update(
            <Tree
                data={tree2}
                callbacks={{
                    onDataChange: onDataChange,
                }}
                showCheckbox={true}
                hierarchicalCheck={true}
            />
        );
        expect(node).toMatchSnapshot();
    });

    it('should partially check parent if not all children checked', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            );

        let check = childrenSelector(liSelector(node.toJSON(), '1.0.0'), 'check');
        check.props.onClick();

        node.update(
            <Tree
                data={tree2}
                callbacks={{
                    onDataChange: onDataChange,
                }}
                showCheckbox={true}
                hierarchicalCheck={true}
            />
        );
        expect(node).toMatchSnapshot();

        check = childrenSelector(liSelector(node.toJSON(), '1.1'), 'check');
        check.props.onClick();

        // Check self, parent and two children
        expect(changeCounter).toEqual(6);

        node.update(
            <Tree
                data={tree2}
                callbacks={{
                    onDataChange: onDataChange,
                }}
                showCheckbox={true}
                hierarchicalCheck={true}
            />
        );
        expect(node).toMatchSnapshot();
    });

    it('should call lazy load and expand functions', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            )
            .toJSON();

        let expand = childrenSelector(liSelector(node, '2'), 'expand');
        expand.props.onClick();
        // No function passed: Nodes: [], loading: null, expanded: true
        expect(changeCounter).toEqual(2);

        // Last change check
        expect(lastChange[1]).toMatch('loading');
        expect(lastChange[2]).toBeNull();
    });

    it('should match lazy loaded nodes', async () => {
        failLazyLoad = false;
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={
                        {
                            onDataChange: onDataChange,
                            lazyLoad: lazyLoad,
                        }
                    }
                />
            );

        let expand = childrenSelector(liSelector(node.toJSON(), '2'), 'expand');
        expand.props.onClick();

        await promise;
        expect(changeCounter).toEqual(5);

        node.update(
            <Tree
                data={tree2}
                callbacks={
                    {
                        onDataChange: onDataChange,
                        lazyLoad: lazyLoad,
                    }
                }
            />
        );
        expect(node).toMatchSnapshot();
    });

    it('should match failed lazy load', async () => {
        failLazyLoad = true;
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={
                        {
                            onDataChange: onDataChange,
                            lazyLoad: lazyLoad,
                        }
                    }
                />
            );

        let expand = childrenSelector(liSelector(node.toJSON(), '2'), 'expand');
        expand.props.onClick();

        // The promise gets rejected so all the testing goes into the catch block.
        try {
            await promise;
        } catch (e) {
            expect(changeCounter).toEqual(2);

            node.update(
                <Tree
                    data={tree2}
                    callbacks={
                        {
                            onDataChange: onDataChange,
                            lazyLoad: lazyLoad,
                        }
                    }
                />
            );
            expect(node).toMatchSnapshot();
        }
    });

    it('should call collapse functions', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    showCheckbox={true}
                    hierarchicalCheck={true}
                />
            )
            .toJSON();

        let expand = childrenSelector(liSelector(node, '1.0'), 'expand');
        expand.props.onClick();

        expect(changeCounter).toEqual(1);
        expect(lastChange).toMatchObject(['1.0', 'state.expanded', false]);
    });

    it('should allow render only one selected node', () => {
        renderer
            .create(
                <Tree
                    data={tree3}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                />
            );

        expect(changeCounter).toEqual(1);
        expect(lastChange).toMatchObject(['1', 'state.selected', false]);
    });

    it('should allow render multiple selected nodes', () => {
        renderer
            .create(
                <Tree
                    data={tree3}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={true}
                />
            );

        expect(changeCounter).toEqual(0);
        expect(lastChange).toBeNull();
    });

    it('should select only one node', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                />
            )
            .toJSON();

        let text = childrenSelector(liSelector(node, '2'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(2);
        expect(lastChange).toMatchObject(['2', 'state.selected', true]);

        text = childrenSelector(liSelector(node, '1'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(4);
        expect(lastChange).toMatchObject(['1', 'state.selected', true]);
    });

    it('should select multiple nodes', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={true}
                />
            )
            .toJSON();

        let text = childrenSelector(liSelector(node, '2'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(1);
        expect(lastChange).toMatchObject(['2', 'state.selected', true]);
    });

    it('should prevent deselecting the selected node', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                    preventDeselect={true}
                />
            )
            .toJSON();

        let text = childrenSelector(liSelector(node, '1.0.0'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(0);
        expect(lastChange).toBeNull();
    });

    it('should allow selecting another node', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                    preventDeselect={true}
                />
            )
            .toJSON();

        let text = childrenSelector(liSelector(node, '1.0.1'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(2);
        expect(lastChange).toMatchObject(['1.0.1', 'state.selected', true]);
    });

    it('should deselect and reselect node', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                    preventDeselect={false}
                    allowReselect={false}
                />
            );

        let text = childrenSelector(liSelector(node.toJSON(), '1.0.0'), 'text');
        text.props.onClick();

        node.update(
            <Tree
                data={tree2}
                callbacks={{
                    onDataChange: onDataChange,
                }}
                multiSelect={false}
                preventDeselect={false}
                allowReselect={false}
            />
        );

        text = childrenSelector(liSelector(node.toJSON(), '1.0.0'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(2);
        expect(lastChange).toMatchObject(['1.0.0', 'state.selected', true]);
    });

    it('should call selected again if would deselect', () => {
        const node = renderer
            .create(
                <Tree
                    data={tree2}
                    callbacks={{
                        onDataChange: onDataChange,
                    }}
                    multiSelect={false}
                    preventDeselect={true}
                    allowReselect={true}
                />
            )
            .toJSON();

        let text = childrenSelector(liSelector(node, '1.0.0'), 'text');
        text.props.onClick();

        expect(changeCounter).toEqual(1);
        expect(lastChange).toMatchObject(['1.0.0', 'state.selected', true]);
    });
});
