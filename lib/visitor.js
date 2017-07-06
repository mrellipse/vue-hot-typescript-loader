const estraverse = require('estraverse');

function exportsExpression(node, name) {

    let value = null;

    estraverse.traverse(node, {

        enter(node, parent) {

            if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && node.expression.operator === '=') {
                let left = node.expression.left;

                if (left && left.type === 'MemberExpression' && left.property.type == 'Identifier' && (left.property.name === 'default' || left.property.name === name))
                    value = node.expression.right.name;
            }
        }
    });

    return value;
}

function isRequire(data) {
    let value = false;

    estraverse.traverse(data.node, {
        enter(node, parent) {
            if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require') {
                value = true;
            }
        }
    });

    return value;
}

function vueRequire(data) {
    let value = null;

    estraverse.traverse(data.node, {

        enter(node, parent) {
            if (node.kind === 'const' && node.declarations) {

                let match = node.declarations.find((o) => o.type === 'VariableDeclarator' && o.init && isRequire({ node: o.init }));
                let callArgs = match ? match.init ? match.init.arguments : null : null;

                if (callArgs && callArgs[0].type === 'Literal' && callArgs[0].value.toLowerCase() === 'vue')
                    value = match.id.name;
            }
        }
    });

    return value;
}

function vueRequireComponent(data) {
    let value = null;

    estraverse.traverse(data.node, {
        enter(node, parent) {
            if (node.kind === 'const' && node.declarations) {

                let match = node.declarations.find((o) => o.type === 'VariableDeclarator' && o.init && isRequire({ node: o.init }));
                let callArgs = match ? match.init ? match.init.arguments : null : null;

                if (callArgs && callArgs[0].type === 'Literal' && callArgs[0].value.toLowerCase().indexOf('vue-class-component') !== -1)
                    value = match.id.name;
            }
        }
    });

    return value;
}

function vueClassDeclaration(data) {
    let value = null;

    if (data.declare)
        estraverse.traverse(data.node, {
            enter(node, parent) {

                if (node.kind === 'let' && node.declarations) {
                    let match = node.declarations.find((o) => o.type === 'VariableDeclarator' && o.init && o.init.type === 'ClassExpression' && o.init.superClass);

                    if (match && match.init.superClass.name === data.declare)
                        value = {
                            found: true,
                            declaration: match,
                            name: match.init.id.name
                        };
                }
            }
        });

    return value;
}

function vueClassExportsExpression(data) {

    let value = null;

    if (data.node && data.declare && data.class)
        estraverse.traverse(data.node, {
            enter(node, parent) {
                let match = exportsExpression(node, data.class.name);
                if (data.class.name === match)
                    value = match;
            }
        });

    return value;
}

function createVisitor(data) {

    return {
        enter(node, parent) {

            data.node = node;
            data.declare = data.declare || vueRequire(data);
            data.component = data.component || vueRequireComponent(data);
            data.class = data.class || vueClassDeclaration(data);

            if (!data.hasComponent && vueClassExportsExpression(data)) {

                data.hasComponent = true

                const componentId = {
                    type: 'Identifier',
                    name: data.identifier
                }

                data.class.declaration = componentId

                return {
                    type: 'VariableDeclaration',
                    declarations: [{
                        type: 'VariableDeclarator',
                        id: componentId,
                        init: {
                            type: 'Identifier',
                            name: data.class.name
                        }
                    }],
                    kind: 'var'
                }
            } else {
                return node;
            }
        }
    }
};

module.exports = (ast) => {

    let data = {
        class: null,
        code: null,
        component: null,
        declare: null,
        hasComponent: false,
        identifier: '__component__',
        node: null
    };

    let visit = (identifier) => {

        data.identifier = identifier || '__component__';
        
        const visitor = createVisitor(data);

        data.code = estraverse.replace(ast, visitor);

        delete data['node'];

        return data;
    };

    return { visit };
};

