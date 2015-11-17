// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'conversion_example/assets/lib',
    paths: {
    	D3:    'd3.v3.min',
    	three: 'three.min',

        app: '../app/dataCube'
    },
    shim: {
        three: {
            exports: 'THREE'
        }
    }
});

requirejs(['app']);



// Start loading the main app file. Put all of
// your application logic in there.
//requirejs(['/app/dataCube']);