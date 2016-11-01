function CommentCreator() {
    if(!(this instanceof CommentCreator)) {
       return new CommentCreator();
    };

    this.addHeadersFileDescriptions = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            fileDescriptions[i].header = this.createHeader(fileDescriptions[i]);
        }
        return fileDescriptions;
    };

    this.createHeader = function(fileDescription) {
        var header = "";
        var prefix = "\n* ";
        header += prefix + fileDescription.className;
        if(fileDescription.isDao) {
            header += prefix + " @ DAO @ " + fileDescription.className;
        } else if(fileDescription.isDto) {
            header += prefix + " @ DTO @ " + fileDescription.className;
        } else if(fileDescription.isDomain) {
             header += prefix + " @ DOMAIN @ " + fileDescription.className;
        } else if(fileDescription.isVm) {
             header += prefix + " @ VM @ " + fileDescription.className;
        } else if(fileDescription.isWorkflow) {
            header += prefix + " @ WORKFLOW @ " + fileDescription.className;
        } else {
            header += prefix + " @ POJO @ " + fileDescription.className;
        }
        if(fileDescription.associations.dao.length > 0) {
            header += prefix + "Associated Daos: " + fileDescription.associations.dao;
        }
        if(fileDescription.associations.domain.length > 0) {
            header += prefix + "Associated Domains: " + fileDescription.associations.domain;
        }
        if(fileDescription.associations.dto.length > 0) {
            header += prefix + "Associated Dto: " + fileDescription.associations.dto;
        }

        header += prefix + "Associated Classes: ";
        for(var i = 0; i < fileDescription.associatedClasses.length; i++) {
            header += prefix + " - " + fileDescription.associatedClasses[i];
        }

        header = "\n/**" + header + "\n*/";

        if(fileDescription.isDao)
                    console.log(header);

        return header;
    };

}
module.exports = CommentCreator;
