Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}
var colors = require('colors');
colors.setTheme({
      silly: 'rainbow',
      input: 'grey',
      verbose: 'cyan',
      prompt: 'grey',
      good: 'green',
      staged: 'green',
      data: 'grey',
      help: 'cyan',
      warn: 'yellow',
      debug: 'blue',
      important: 'blue',
      change: 'red',
      RED: 'red',
      error: 'red',
      name: 'red',
      logo: 'green',
      title: 'green',
      arg: 'white'
    });

var cliArgs = process.argv.slice(2);
if(!cliArgs[0]){
    console.log("\n--- ---\n".error,
    "Not root dir specified.  Using environment variable: 'GUST_ROOT'".error,
    ("\n[" + process.env.GUST_ROOT + "]").warn,
    "\n--- ---\n".error);
}
var rootDir = cliArgs[0] || process.env.GUST_ROOT;
var fileDescriber = new require(__dirname + "/lib/file_describer.js")();
var fileDescriptions = fileDescriber.findAndDescribeJavaFiles(rootDir);
console.log(("Found " + fileDescriptions.length + " files").important);

//console.log(d);

