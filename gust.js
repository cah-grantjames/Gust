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
var addHeadersToJavaFiles = false;
var outputFiles = {dir: "out", json:"out.gust.json", text:"out.gust.txt"};
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


var fs = require('fs');
if(!fs.existsSync(outputFiles.dir)) {
    fs.mkdirSync(outputFiles.dir);
}
fs.writeFileSync(outputFiles.dir + "/" + outputFiles.json, JSON.stringify(fileDescriptions, 0, 4));

var commentCreator = new require(__dirname + "/lib/comment_creator.js")();
commentCreator.addHeadersFileDescriptions(fileDescriptions);
if(addHeadersToJavaFiles) {
    commentCreator.addTokenToAllFiles(fileDescriptions);
    commentCreator.writeHeadersToAllFiles(fileDescriptions);
}
var text = "";
for(var i = 0; i < fileDescriptions.length; i++) {
    text += "-------------------------------------\n";
    text += fileDescriptions[i].filePath.replace(rootDir, "") + "\n";
    text += fileDescriptions[i].package + "\n";
    text += fileDescriptions[i].header + "\n";
    text += "-------------------------------------\n";
}
fs.writeFileSync(outputFiles.dir + "/" + outputFiles.text, text);
console.log(("Saved output to: \n\t" + outputFiles.dir + "/" + outputFiles.json + "\n\t" + outputFiles.dir + "/" + outputFiles.text).important);
