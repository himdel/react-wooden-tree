import { NodeProps } from './components/Node';
//
// function generate_object(size: number): NodeProps[] {
//     let obj: NodeProps[] = [];
//
//     for (let i = 0; i < Math.cbrt(size); i++) {
//         obj[i] = {text: 'Parent ' + i, nodes: [], state: {expanded: true}};
//         for (let k = 0; k < Math.cbrt(size); k++) {
//             obj[i].nodes[k] = {text: 'First Child ' + i + '.' + k, nodes: [], state: {expanded: true}};
//             for (let l = 0; l < Math.cbrt(size); l++) {
//                 obj[i].nodes[k].nodes[l] = {text: 'Second Child ' + i + '.' + k + '.' + l};
//             }
//         }
//     }
//
//     return obj;
// }

export function generator(): NodeProps[] {
    return [
        {text: 'Parent 1 - Expanded', state: {expanded: true, checked: true}, attr: {'data-random': 'notThatRandom'},
            nodes: [
                {text: 'Child 1 - Custom Icon', icon: 'fa fa-stop fa-fw', state: {checked: true}},
                {text: 'Child 2 - Non checkable and disabled - no icon', icon: 'fa fa-fw',
                    checkable: false, state: {disabled: true}},
                {text: 'Child 3 - No checkbox', hideCheckbox: true},
                {text: 'Child 4 - LazyLoadable', lazyLoad: true, attr: {'data-random': 'random'}}
            ]
        },
        {text: 'Parent 2 - Not expanded', state: {expanded: false, checked: false},
            nodes: [
                {text: 'Child 1 - Custom Icon', icon: 'fa fa-stop fa-fw'},
                {text: 'Child 2 - No icon specified', classes: 'custom-class'},
                {text: 'Child 3 - Image icon', image: 'https://www.wpsuperstars.net/wp-content/uploads/2015/01/59.png'}
            ]
        },
        {text: 'Parent 3 - Children checkboxes', hideCheckbox: true, state: {expanded: true},
            attr: {'data-random': 'random'},
            nodes: [
                {text: 'Child 1 - Has checkbox - checked', state: {checked: true}},
                {text: 'Child 2 - Has checkbox - unchecked', attr: {'data-random': 'random'}}
            ]
        }
    ];
}