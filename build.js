//BUILDING FOR WINDOWS:

//Prerequisites: Must have Node, NPM, and Bower installed globally.
//This assumes you have a folder next to `scout-app` called `scout-app-build`.
//`scout-app-build` folder should contain:
//  * locales (folder)
//  * icudtl.dat
//  * nw.pak
//  * Scout-App.exe
// All of those are from NW.js 0.12.3, the .exe is a renamed version of
// nw.exe with a custom icon


// Variables
var start = Date.now() + "";
var fs = require('fs-extra');
var exec = require("child_process").execSync;
//var rimraf = require('rimraf'); // used to set number of retries for async deleting of in use files
//var del = require('del'); // used to delete entire folders with the exception of specific files
var manifest = fs.readJsonSync('package.json');
var bowerJSON = fs.readJsonSync('bower.json');
manifest.name = manifest.name.toLowerCase();
bowerJSON.name = bowerJSON.name.toLowerCase();
delete manifest.devDependencies;
var build = '../scout-app-build/';
var sf = 'scout-files/';


// Functions
function timer (finish, begin) {
    //3195
    var subtract = finish - begin;
    //319.5 becomes 320
    var round = Math.round(subtract / 10);
    //320 becomes 3.2
    var seconds = round / 100;
    //3.2 becomes ["3", "2"]
    var splitSeconds = seconds.toString().split('.');
    if (splitSeconds[0].length < 2) {
        //"3" becomes " 3"
        splitSeconds[0] = " " + splitSeconds[0];
    }
    if (splitSeconds.length == 1 || splitSeconds[1].length < 1) {
        //"" becomes "00"
        splitSeconds[1] = "00";
    } else if (splitSeconds[1].length == 1) {
        //"2" becomes "20"
        splitSeconds[1] = splitSeconds[1] + "0";
    }
    //[" 3", "20"] becomes " 3.20 seconds"
    var time = splitSeconds.join('.') + " seconds";
    return time;
}

function minutes (finish, begin) {
    //82500
    var subtract = finish - begin;
    //82500 = 1.375
    var minutes = subtract / 60000;
    minutes = Math.round(minutes * 1000) / 1000;
    //
    var splitMinutes = minutes.toString().split('.');
    if (splitMinutes[1]) {
        //375 = 22.5
        splitMinutes[1] = (splitMinutes[1] / 1000) * 60;
        //22.5 = 23
        splitMinutes[1] = Math.round(splitMinutes[1]).toString();
    } else {
        splitMinutes[1] = "00";
    }
    if (splitMinutes[1].length == 1) {
        splitMinutes[1] = "0" + splitMinutes[1];
    }
    var time = splitMinutes.join(':');
    return time;
}

function rmrf (location) {
    var winLocation = location.split('/').join('\\');
    while ( fs.existsSync(location) ) {
        exec('rd /S /Q ' + winLocation);
    }
}


// Clean build folder
rmrf(build + 'License');
rmrf(build + 'bower_components');
rmrf(build + 'node_modules');
rmrf(build + 'temp');
rmrf(build + sf);
fs.mkdirsSync(build + sf);
var timeClean = Date.now() + "";
console.log('Cleaning build folder - ' + timer(timeClean, start));


// Copy files over
fs.writeJsonSync(build + 'package.json', manifest);
fs.writeJsonSync(build + 'bower.json', bowerJSON);;
fs.copySync(sf + 'index.html', build + sf + 'index.html');
var timeFiles = Date.now() + "";
console.log('Copying files         - ' + timer(timeFiles, timeClean));


// Copy folders over
fs.copySync('License',        build + 'License');
fs.copySync(sf + '_fonts',    build + sf + '_fonts');
fs.copySync(sf + '_img',      build + sf + '_img');
fs.copySync(sf + '_markup',   build + sf + '_markup');
fs.copySync(sf + '_scripts',  build + sf + '_scripts');
fs.copySync(sf + '_style',    build + sf + '_style');
fs.copySync(sf + '_themes',   build + sf + '_themes');
fs.copySync(sf + 'mixins',    build + sf + 'mixins');
fs.copySync(sf + 'cultures',  build + sf + 'cultures');
fs.removeSync(build + sf + 'cultures/cultures.xls');
fs.removeSync(build + sf + 'cultures/README.md');
var timeFolder = Date.now() + "";
console.log('Copying folders       - ' + timer(timeFolder, timeFiles));


// Run executables
exec('npm --prefix ' + build + 'temp install --production ' + build);
var timeExec = Date.now() + "";
console.log('NPM & Bower Installs  - ' + timer(timeExec, timeFolder));


// Move node_modules and bower_components into place
fs.copySync(build + 'temp/node_modules/scout-app/bower_components', build + 'bower_components');
var timeBower = Date.now() + "";
console.log('Move bower_components - ' + timer(timeBower, timeExec));

fs.copySync(build + 'temp/node_modules/scout-app/node_modules',     build + 'node_modules');
var timeNM = Date.now() + "";
console.log('Move node_modules     - ' + timer(timeNM, timeBower));

rmrf(build + 'temp');
var timeRmvTmp = Date.now() + "";
console.log('Delete Temp           - ' + timer(timeRmvTmp, timeNM));


// Node-Sass Vendor cleanup
rmrf(build + 'node_modules/node-sass/vendor');
fs.copySync(sf + '_assets/node-sass_v3.4.2/win32-ia32-43', build + 'node_modules/node-sass/vendor/win32-ia32-43');
fs.copySync(sf + '_assets/node-sass_v3.4.2/win32-x64-43',  build + 'node_modules/node-sass/vendor/win32-x64-43');
var timeNS = Date.now() + "";
console.log('Node-Sass bindings    - ' + timer(timeNS, timeNM));


// Total Time
var end = Date.now() + "";
console.log('Total Build Time      - ' + timer(end, start) + ' or ' + minutes(end, start));


//Run the app
var scoutExe = exec(build.split('/').join('\\') + 'Scout-App.exe');
