function HtmlCreator() {
    if(!(this instanceof HtmlCreator)) {
       return new HtmlCreator();
    };
    this.fs = require('fs');

    this.getType = function(fileDescription) {
    
        if(fileDescription.isDao) {
            return "DAO";
        } else if(fileDescription.isDto) {
            return "DTO";
        } else if(fileDescription.isDomain) {
             return "DOMAIN";
        } else if(fileDescription.isVm) {
             return "VM";
        } else if(fileDescription.isWorkflow) {
            return "WORKFLOW";
        } else if(fileDescription.isBroadcastReceiver) {
            return "BROADCAST_RECEIVER";
        } else if(fileDescription.isActivity) {
            return "ACTIVITY";
        }else {
            return "POJO";
        }    
    }

    this.createHtmlDocs = function(outputDir, outputFileName, fileDescriptions) {
        var content = "";
        var htmlMasterPg = this.fs.readFileSync(__dirname + "/../templates/master.html").toString();
        for (var i = 0; i < fileDescriptions.length; i++) {
            content += "<hr>";
            var fd = fileDescriptions[i];
            var itemPg = this.fs.readFileSync(__dirname + "/../templates/item.html").toString();
            fd.type = this.getType(fd);
            fd.associatedClassesTitle = "Associated Classes";

            itemPg = this.replaceTokens(itemPg, fd);
            if(fd.className == "BaseVm" || fd.className == "AccessMedicationVm")
                console.log(itemPg);
            content += itemPg;
        }
        this.fs.writeFileSync(outputDir + "/" + outputFileName, htmlMasterPg.replace("{{content}}", content));
    };

    this.replaceTokens = function(itemPg, fd) {
        var tokens = this.getAllTokens(itemPg);
        for(var j = 0; j < tokens.length; j++) {
            if(tokens[j].type == "property") {
                itemPg = itemPg.replace(tokens[j].token, this.readProperty(fd, tokens[j].property));
            } else if(tokens[j].type == "list") {
                var propertyList = this.readProperty(fd, tokens[j].property);
                var text = "";
                for(var x = 0; x < propertyList.length; x++) {
                    var p = propertyList[x];
                    var listTemplate = this.fs.readFileSync(__dirname + "/../templates/" + tokens[j].template + ".html").toString();
                    var str = "";
                    if(tokens[j].tokenProperty == "*"){
                        str += listTemplate.replace(tokens[j].templateToken, p);
                    } else {
                        str += listTemplate.replace(tokens[j].templateToken, this.readProperty(p, tokens[j].tokenProperty));
                    }
                    if(tokens[j].anchorToken) {
                       str = str.replace(tokens[j].anchorToken, p);
                    }
                    text += str;
                }
                itemPg = itemPg.replace(tokens[j].token, text);
            }
        }
        return itemPg;
    };

    this.readProperty = function(o, property) {
        return eval("o." + property);
    };

    this.getAllTokens = function(content) {
        var tokens = [];
        var chunks = content.split("{{");
        for(var i = 0; i < chunks.length; i++){
            var bites = chunks[i].split("}}");
            if(bites[0] && content.indexOf("{{" + bites[0] + "}}") != -1){
                var token = bites[0];
                var property = token;
                var type = "property";
                var template = null;
                var templateToken = null;
                var tokenProperty = null;
                var anchorToken = null;
                if(token.indexOf("list") != -1) {
                    type = "list"
                    var metaToken = token.split(",").clean();
                    property = metaToken[1].trim();
                    tokenProperty = metaToken[2].trim();
                    template = metaToken[3].trim();
                    templateToken = metaToken[4];
                    anchorToken = metaToken[5];
                }

                tokens.push({
                    token : "{{" + token + "}}",
                    property : property,
                    tokenProperty : tokenProperty,
                    type : type,
                    template : template,
                    templateToken : "{{" + templateToken + "}}",
                    anchorToken : "{{" + anchorToken + "}}"
                });
            }
        }
        return tokens;
    };
};
module.exports = HtmlCreator;