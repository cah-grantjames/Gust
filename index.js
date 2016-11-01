
var fileFinder = new require(__dirname + "/lib/file_finder.js")();

console.log(fileFinder.findAllJavaFiles("/Users/grant.james/projects/_alfred/app/src/main").length);

