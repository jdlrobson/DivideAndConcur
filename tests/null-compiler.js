function donothing() {
    return null;
}

require.extensions['.css'] = donothing;
require.extensions['.less'] = donothing;
