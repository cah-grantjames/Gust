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

var fileDescriber = new require(__dirname + "/lib/file_describer.js")();

console.log(fileDescriber.findAndDescribeJavaFiles("/Users/grant.james/projects/_alfred/app/src/main"));

