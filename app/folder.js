"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Folder = (function () {
    function Folder(id, name) {
        this.id = id;
        this.name = name;
        this.children = [];
    }
    Folder.prototype.deleteChild = function (id) {
        for (var i in this.children) {
            if (this.children[i].getId() == id) {
                this.children.splice(i, 1);
                return;
            }
        }
    };
    Folder.prototype.rename = function (newName) {
        this.name = newName;
    };
    Folder.prototype.addChild = function (item) {
        this.children.push(item);
    };
    Folder.prototype.findChild = function (id) {
        for (var i in this.children) {
            if (this.children[i].getId() == id) {
                return this.children[i];
            }
        }
    };
    Folder.prototype.getChildren = function () {
        return this.children;
    };
    Folder.prototype.getId = function () {
        return this.id;
    };
    Folder.prototype.getType = function () {
        return 'folder';
    };
    return Folder;
}());
exports.Folder = Folder;
//# sourceMappingURL=folder.js.map