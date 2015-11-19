/* CREDITS________________________________________________
 *
 *   Initial version taken from Phil Pedruco & refactored
 *   http://bl.ocks.org/phil-pedruco/raw/9852362/
 * _______________________________________________________
 */


// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'conversion_example/assets/lib',
    paths: {
    	D3:    'd3.v3.min',
    	three: 'three.min',
    	helper: 'helper',

        app: '../app/main',
        stage: '../app/stage',
        data: '../app/data',
        cube: '../app/cube'
    },
    shim: {
        three: {
            exports: 'THREE'
        }
    }
});

requirejs(['app']);
