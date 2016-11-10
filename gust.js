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
Array.prototype.clean = function() {
  for (var i = 0; i < this.length; i++) {
    if (this[i].trim() == "") {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};
var colors = require('colors');
colors.setTheme({
      good: 'green',
      warn: 'yellow',
      debug: 'blue',
      important: 'blue',
      error: 'red',
      verbose: 'white'
    });


var cliArgs = process.argv.slice(2);
var addHeadersToJavaFiles = false;
var outputFiles = {dir: "out", json:"out.gust.json", text:"out.gust.txt", html: "out.gust.html"};
if(!cliArgs[0]){
    console.log("\n--- ---\n".error,
    "No root directory specified!  Using environment variable: 'GUST_ROOT'".error,
    ("\n[" + process.env.GUST_ROOT + "]").warn,
    "\n--- ---\n".error);
}
var rootDir = cliArgs[0] || process.env.GUST_ROOT;
console.log(("Using root directory: " + rootDir).verbose);
var fileDescriber = new require(__dirname + "/lib/file_describer.js")();
var fileDescriptions = fileDescriber.findAndDescribeJavaFiles(rootDir);
console.log(("\tFound " + fileDescriptions.length + " files").important);
console.log("Parsing completed.  Saving files...".verbose);

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

var HtmlCreator = require(__dirname + "/lib/html_creator.js");
var htmlCreator = new HtmlCreator();
htmlCreator.createHtmlDocs(outputFiles.dir, outputFiles.html, fileDescriptions);
console.log(("\tSaved output to: \n\t\t" + outputFiles.dir + "/" + outputFiles.json
+ "\n\t\t" + outputFiles.dir + "/" + outputFiles.text
+ "\n\t\t" + outputFiles.dir + "/" + outputFiles.html
).important);
