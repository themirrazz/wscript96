class WSHSyntaxError extends SyntaxError {
    charNumber = 0;
    lineNumber = 0;
    columnNumber = 0;
    eCode = '';
    constructor(message, { char, line, column, code }) {
        super(message);
        this.charNumber = char;
        this.lineNumber = line;
        this.columnNumber = column;
        this.eCode = code;
    }
}

var runAnyScript = code => runJScript(code);

const runJScript = async code => {
    const compiledCode = compileCode(code);
    return await eval(`(async () => { ${compiledCode} })()`);
};

// TODO: Esprima stuff
const compileCode = code => {
    const program = esprima.parse(code, { range: true, loc: true });
    const ast = program.body;
    // make sure there are no syntax errors
    validateAST(ast);
    return escodegen.generate(program);
};

const validateAST = ast => {
    // No expression? Nothing to validate.
    if(!ast) return;
    if(typeof ast === 'string') return;
    if(typeof ast === 'number') return;
    if(typeof ast === 'boolean') return;
    // Validate array
    if(Array.isArray(ast)) {
        return ast.forEach(ast0 => validateAST(ast0));
    }
    // Actual validation begins
    if(ast.type === 'Identifier') {
        ast.name = 's_' + ast.name;
    } else if(ast.type === 'VariableDeclaration') {
        if(ast.kind !== 'var') {
            throw new WSHSyntaxError(
                "Expected ';'",
                {
                    code: '800A03EC',
                    line: ast.loc.start.line,
                    char: ast.range[0] + ast.kind.length + 2
                }
            );
        }
        validateAST(ast.declarations)
    } else if(ast.type === 'ClassDeclaration') {
        throw new WSHSyntaxError(
            "Syntax error",
            {
                code: '800A03EA',
                line: ast.loc.start.line,
                char: ast.range[0] + 1
            }
        );
    } else if(ast.type === 'MemberExpression') {
        // first, we validate the object
        if(ast.object.type === 'Identifier') {
            ast.object.name = 's_' + ast.object.name;
        } else {
            validateAST(ast.object);
            /*const ogObj = ast.object;
            ast.object = {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'Literal',
                    value: "s_",
                    raw: '"s_"'
                },
                right: ogObj
            }*/
        }
        // then the property
        if(ast.property.type === 'Identifier') {
            ast.property.name = 's_' + ast.property.name;
        } else {
            validateAST(ast.property);
            const ogProp = ast.property;
            ast.property = {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'Literal',
                    value: "s_",
                    raw: '"s_"'
                },
                right: ogProp
            }
        }
    } else if(ast.type === 'ArrowFunctionExpression') {
        throw new WSHSyntaxError(
            "Syntax error",
            {
                code: '800A03EA',
                line: ast.loc.start.line,
                char: ast.range[0] + 1
            }
        );
    } else if(ast.type === 'AwaitExpression') {
        throw new WSHSyntaxError(
            "Syntax error",
            {
                code: '800A03EA',
                line: ast.loc.start.line,
                char: ast.range[0] + 1
            }
        );
    } else if(ast.type === 'FunctionExpression' && (ast.async || ast.generator)) {
        throw new WSHSyntaxError(
            "Syntax error",
            {
                code: '800A03EA',
                line: ast.loc.start.line,
                char: ast.range[0] + 1
            }
        );
    } else if(ast.type === 'CallExpression' && false) {
        const arg = ast.arguments;
        const callee = ast.callee;
        ast.arguments = undefined;
        ast.callee = undefined;
        ast.type = 'AwaitExpression';
        ast.argument = {
            type: 'CallExpression',
            arguments: arg,
            callee
        };
    } else {
        if(ast.type === 'FunctionExpression') {
            ast.async = true;
        }
        Object.keys(ast).forEach(key => {
            validateAST(ast[key]);
        });
    }
};