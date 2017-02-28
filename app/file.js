"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var File = (function () {
    function File(id, name, content) {
        this.name = name;
        this.id = id;
        this.content = content;
    }
    File.prototype.rename = function (newName) {
        this.name = newName;
    };
    File.prototype.setContent = function (content) {
        this.content = content;
    };
    File.prototype.getContent = function () {
        return this.content;
    };
    File.prototype.getId = function () {
        return this.id;
    };
    File.prototype.getType = function () {
        return 'file';
    };
    return File;
}());
exports.File = File;
//# sourceMappingURL=file.js.map