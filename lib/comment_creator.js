function CommentCreator() {
    if(!(this instanceof CommentCreator)) {
       return new CommentCreator();
    };

    this.prefix = "\n* ";

    this.addHeadersFileDescriptions = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            fileDescriptions[i].header = this.createHeader(fileDescriptions[i]);
        }
        return fileDescriptions;
    };

    this.createTitle = function(type, className) {
        return this.prefix + "|| @" + type + "@ \"" + className + "\" ||";
    };

    this.createHeader = function(fileDescription) {
        var header = "";
        var prefix = this.prefix;

        if(fileDescription.isDao) {
            header += this.createTitle("DAO", fileDescription.className);
        } else if(fileDescription.isDto) {
            header += this.createTitle("DTO", fileDescription.className);
        } else if(fileDescription.isDomain) {
             header += this.createTitle("DOMAIN", fileDescription.className);
        } else if(fileDescription.isVm) {
             header += this.createTitle("VM", fileDescription.className);
        } else if(fileDescription.isWorkflow) {
            header += this.createTitle("WORKFLOW", fileDescription.className);
        } else if(fileDescription.isBroadcastReceiver) {
            header += this.createTitle("BROADCAST_RECEIVER", fileDescription.className);
        } else {
            header += this.createTitle("POJO", fileDescription.className);
        }
        header += prefix + "Associations:"
        var associationsPrefix = prefix + "  > ";
        if(fileDescription.associations.daos.length > 0) {
            header += associationsPrefix + "Daos: " + fileDescription.associations.daos;
        }
        if(fileDescription.associations.domains.length > 0) {
            header += associationsPrefix + "Domains: " + fileDescription.associations.domains;
        }
        if(fileDescription.associations.dtos.length > 0) {
            header += associationsPrefix + "Dtos: " + fileDescription.associations.dtos;
        }

        header += associationsPrefix + "Classes: [";
        header += fileDescription.associatedClasses.join(", ") + "]";

        header = "\n/**" + header + "\n*/";

        //if(fileDescription.isBroadcastReceiver)
            //console.log(header);

        return header;
    };

}
module.exports = CommentCreator;
