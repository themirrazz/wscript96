const wrapAsyncFunction = func => {
    const f0 = function (...args) {
        return func.apply(this, args);
    };
    return f0;
};

// full api access
const w96 = parent.w96;

// cache for wrapped objects
const wrappedObjects_og = [];
const  wrappedObjects   = [];

class WrappedContextObject {
    object;
    constructor(object) {
        this.object = object;
    }
    unwrap() {
        // Basic data types - no need for wrapping
        if(typeof entry === 'string') return entry;
        if(typeof entry === 'number') return entry;
        if(typeof entry === 'boolean') return entry;
        if(entry === null) return null;
        if(entry === undefined) return undefined;
        // This will most likely never be supported
        if(typeof entry === 'function') {
            throw new TypeError('Methods may not be unwrapped');
        }
        // TODO: implement unwrapping
        if(Array.isArray(entry)) {
            throw new TypeError('Arrays may not be unwrapped');
        }
        throw new TypeError('Objects may not be unwrapped');
    }
};

const CreateCtxObjWrapper = window.CreateCtxObjWrapper = entry => {
    // Basic data types
    if(typeof entry === 'string') return entry;
    if(typeof entry === 'number') return entry;
    if(typeof entry === 'boolean') return entry;
    if(entry === null) return null;
    if(entry === undefined) return undefined;
    // Now we wrap objects for context isolation

}

const WrapNativeObject = window.WrapNativeObject = entry => {
    // Basic data types - no need for wrapping
    if(typeof entry === 'string') return entry;
    if(typeof entry === 'number') return entry;
    if(typeof entry === 'boolean') return entry;
    if(entry instanceof Promise) return entry;
    if(entry instanceof parent.Promise) return entry;
    if(entry === null) return null;
    if(entry === undefined) return undefined;
    // Check if the object comes from the contex
    if(entry instanceof WrappedContextObject) {
        // if it is, return the original object
        return entry;
    }
    // Now we actually check and wrap it
    if(wrappedObjects_og.indexOf(entry) > -1) {
        return wrappedObjects[
            wrappedObjects_og.indexOf(entry)
        ];
    }
    if(typeof entry === 'function') {
        return CreateNativeFunction(entry);
    }
    const proxy = new Proxy(entry, {
        get(t, key) {
            if(String(key).startsWith('s_')) {
                key = key.slice(2);
                if(t[key]) return WrapNativeObject(t[key]);
                return undefined;
            } else {
                if(t[key]) return t[key];
            }
        },
        set(t, key, value) {
            if(String(key).startsWith('s_')) {
                key = key.slice(2);
                if(wrappedObjects.indexOf(value) > -1) {
                    t[key] = wrappedObjects_og[
                        wrappedObjects.indexOf(value)
                    ];
                } else {
                    t[key] = CreateCtxObjWrapper(value);
                }
            }
        },
        deleteProperty(t, key) {
            if(String(key).startsWith('s_')) key = key.slice(2);
            return delete t[key];
        }
    });
    return proxy;
};

/**
 * @param {(...args: any[]) => any} func
 */
const CreateNativeFunction = window.CreateNativeFunction = func => {
    if(wrappedObjects_og.indexOf(func) > -1) {
        return wrappedObjects[
            wrappedObjects_og.indexOf(func)
        ];
    }
    const wrapper = wrapAsyncFunction(async function(...args) {
        let result = func.apply(this, args);
        if(result instanceof Promise) result = await result;
        return WrapNativeObject(result);
    });
    // don't re-wrap this function again
    wrappedObjects_og.push(func);
    wrappedObjects.push(wrapper);
    Object.defineProperty(wrapper, 'toString', {
        value: () => {
            return [
                'function ' + func.name + '() {',
                '    [native code]',
                '}'
            ].join('\n')
        }
    });
    return wrapper;
};

Object.defineProperties(Function.prototype, {
    's_toString': {
        value: function () { return this.toString() }
    },
    's_name': {
        get: function () { return this.name }
    },
    's_length': {
        get: function () { return this.length }
    },
    's_call': {
        value: function (...args) {
            return this.call(...args);
        }
    },
    's_apply': {
        value: function (...args) {
            return this.apply(...args);
        }
    }
});

Object.defineProperties(String.prototype, {
    's_toString': {
        value: function () { return String(this) }
    },
    's_length': {
        get: function () { return this.length }
    },
    's_slice': {
        value: function (...args) {
            return this.slice(...args);
        }
    },
    's_split': {
        value: function (...args) {
            return this.split(...args);
        }
    }
});

const s_true = true;
const s_false = false;
const s_True = true;
const s_False = false;
const s_TRUE = true;
const s_FALSE = false;
const s_TRue = true;
const s_FALse = false;
const s_TrUe = true;
const s_FaLsE = false;

Object.defineProperties(Array.prototype, {
    's_toString': {
        value: function () { return String(this) }
    },
    's_length': {
        get: function () { return this.length }
    },
    's_slice': {
        value: function (...args) {
            return this.slice(...args);
        }
    },
    's_join': {
        value: function (...args) {
            return this.join(...args);
        }
    },
    's_push': {
        value: function (...args) {
            return this.push(...args);
        }
    },
    's_pop': {
        value: function (...args) {
            return this.pop(...args);
        }
    },
    's_unshift': {
        value: function (...args) {
            return this.unshift(...args);
        }
    },
    's_shift': {
        value: function (...args) {
            return this.shift(...args);
        }
    },
});

const s_Math = {
    s_random: () => Math.random(),
    s_floor: float => Math.floor(float),
    s_round: float => Math.round(float),
    s_ceil: float => Math.ceil(float),
    s_pow: (x, y) => Math.pow(x, y),
    s_square: int => Math.pow(int, 2),
    s_cube: int => Math.pow(int, 3),
    s_PI: Math.PI,
    s_E: Math.E
};

const s_eval = CreateNativeFunction(code => {
    return null
});

const s_globalThis = window;

const ActiveXObject = async function ActiveXObject (name) {
    if(!await w96.FS.exists('C:/system/local/bin/active-z')) {
        throw new ReferenceError("ActiveZ installation not found");
    }
    try {
        return await w96.sys.execCmd('active-z', parent.Array('create', name));
    } catch (error) {
        throw new TypeError('invaid ActiveX object');
    }
};

const s_ActiveXObject = WrapNativeObject(name => ActiveXObject(name));

const s_Date = CreateNativeFunction((...args) => {
    return new Date(...args);
});

s_Date.s_now = async () => {
    // you think I don't know what people do with this?
    // no freezing today.
    await w96.util.wait(1);
    return Date.now();
};

const s_WScript = WrapNativeObject({
    Echo: function (text) {
        if(typeof text !== 'string') text = String(text);
        return new Promise(resolve => {
            const dialog = parent.alert(
                text.replaceAll('&', '&amp;')
                .replaceAll('<','&lt;')
                    .replaceAll('>','&gt;'),
                {
                    title: 'Windows Script Host',
                    icon: 'null'
                }
            );
            dialog.wnd.onclose = () => resolve();
            dialog.wnd.registerAppBar();
        });
    },
    Arguments: {
        get length() {
            return ArgV.length
        },
        Item: (index) => {
            return ArgV[index]
        }
    },
    Quit: () => window.close()
});

const s_Error = WrapNativeObject(Error);
const s_SyntaxError = WrapNativeObject(SyntaxError);
const s_ReferenceError = WrapNativeObject(ReferenceError);
const s_TypeError = WrapNativeObject(TypeError);
const s_EvalError = WrapNativeObject(EvalError);
