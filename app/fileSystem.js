"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var folder_1 = require("./folder");
var file_1 = require("./file");
var ROOT = 0;
var SPLIT_SIGN = '/';
var treatedNodes = 0;
var tmpLastId = 0;
var FileSystem = (function () {
    function FileSystem() {
        this.fsStorage = [];
        this.lastId = 0;
        this.readSystemFromFile();
    }
    FileSystem.prototype.addFolder = function (name, parentId) {
        var parent = this.getItem(parentId);
        if (name == '')
            name = 'New Folder';
        var newName = this.uniqueName(parent, name);
        var folder = new folder_1.Folder(++this.lastId, newName);
        if (parent)
            parent.addChild(folder);
        this.saveSystemToFile();
        return folder;
    };
    FileSystem.prototype.addFile = function (name, parentId, content) {
        var parent = this.getItem(parentId);
        if (name == '')
            name = 'New File';
        var newName = this.uniqueName(parent, 'New File');
        var file = new file_1.File(++this.lastId, newName, content);
        parent.addChild(file);
        this.saveSystemToFile();
        return file;
    };
    FileSystem.prototype.renameItem = function (id, newName) {
        if (id == ROOT)
            return false;
        if (newName.indexOf('/') > -1)
            throw new Error('Name can not contains "/"');
        var parent = this.findParent(this.fsStorage, id);
        if (this.usedName(parent, newName)) {
            throw new Error('Name should be unique in a folder');
        }
        var item = this.findById(this.fsStorage, id);
        item.rename(newName);
        this.saveSystemToFile();
        return item;
    };
    FileSystem.prototype.deleteItem = function (id) {
        if (id == ROOT)
            return;
        var parent = this.findParent(this.fsStorage, id);
        if (parent)
            parent.deleteChild(id);
        this.saveSystemToFile();
    };
    FileSystem.prototype.getItem = function (lookingFor) {
        if (!lookingFor) {
            return this.fsStorage[ROOT];
        }
        var id = Number(lookingFor);
        if (isNaN(id)) {
            var pathArray = lookingFor.split(SPLIT_SIGN);
            var item_1 = this.getItemByPathRecursevly(pathArray, this.fsStorage[0]);
            if (item_1)
                return item_1;
            else
                return undefined;
        }
        var item = this.findById(this.fsStorage, id);
        if (item)
            return item;
        else
            return undefined;
    };
    FileSystem.prototype.getPath = function (id) {
        return this.findFullPathRecursevly(this.fsStorage, id);
    };
    FileSystem.prototype.getParent = function (id) {
        return this.findParent(this.fsStorage, id);
    };
    // Private functions
    FileSystem.prototype.saveSystemToFile = function () {
        var flatSystem = this.makeSystemFlat();
        localStorage.setItem('file_system', JSON.stringify(flatSystem));
    };
    FileSystem.prototype.makeSystemFlat = function () {
        var clone = {};
        var flatSystem = [];
        clone['id'] = ROOT;
        clone['name'] = 'root';
        clone['type'] = 'folder';
        clone['father'] = null;
        flatSystem.push(clone);
        this.putChildrensToFlat(flatSystem, this.fsStorage[0]);
        return flatSystem;
    };
    FileSystem.prototype.putChildrensToFlat = function (flatSystem, father) {
        var children = father.getChildren();
        children.forEach(function (node) {
            var clone = {};
            clone['id'] = node.getId();
            clone['name'] = node.name;
            clone['type'] = node.getType();
            clone['father'] = father['id'];
            if (clone['type'] == 'file')
                clone['content'] = node.getContent();
            flatSystem.push(clone);
            if (node.getType() == 'folder')
                this.putChildrensToFlat(flatSystem, node);
        }.bind(this));
    };
    FileSystem.prototype.readSystemFromFile = function () {
        this.fsStorage = [];
        tmpLastId = 0;
        treatedNodes = 0;
        try {
            var flatSystem = JSON.parse(localStorage.getItem('file_system'));
            this.checkIdsAreUnique(flatSystem);
            this.makeSystemTree(flatSystem);
            if (treatedNodes < flatSystem.length)
                throw new Error("Extra data");
            this.lastId = tmpLastId;
        }
        catch (e) {
            this.fsStorage = [];
            var root = new folder_1.Folder(ROOT, 'root');
            this.fsStorage.push(root);
        }
    };
    FileSystem.prototype.checkIdsAreUnique = function (flatSystem) {
        var tmp = [];
        for (var i = 0; i < flatSystem.length; i++) {
            var id = flatSystem[i].id;
            if (!id && tmp.includes(id))
                throw new Error('Not unique id');
            tmp.push(id);
        }
    };
    FileSystem.prototype.makeSystemTree = function (flatSystem) {
        if (flatSystem.length == 0) {
            throw new Error('Empty system storage');
        }
        for (var i = 0; i < flatSystem.length; i++) {
            if (flatSystem[i].id == 0) {
                this.nodeTreatment(this.fsStorage, flatSystem[i]);
                break;
            }
        }
        if (!this.fsStorage[0])
            throw new Error('Wrong fields');
        this.addToSystemTreeChilds(this.fsStorage[0], flatSystem);
    };
    FileSystem.prototype.nodeTreatment = function (container, node) {
        if (!this.checkFields(node))
            throw new Error('Wrong fields');
        var item;
        if (node.type == 'folder') {
            item = new folder_1.Folder(node.id, node.name);
        }
        else {
            item = new file_1.File(node.id, node.name, node.content);
        }
        container.push(item);
        this.updateLastId(node.id);
        treatedNodes++;
        return item;
    };
    FileSystem.prototype.updateLastId = function (newId) {
        tmpLastId = newId > tmpLastId ? newId : tmpLastId;
    };
    FileSystem.prototype.addToSystemTreeChilds = function (father, flatSystem) {
        flatSystem.forEach(function (child, index) {
            if (child['father'] == father.getId()) {
                var item = this.nodeTreatment(father.getChildren(), child);
                if (child.type == 'folder') {
                    this.addToSystemTreeChilds(item, flatSystem);
                }
            }
        }.bind(this));
    };
    FileSystem.prototype.checkFields = function (node) {
        return 'id' in node && 'father' in node && 'type' in node && 'name' in node &&
            ((node.type == 'file' && 'content' in node) || node.type == 'folder');
    };
    FileSystem.prototype.findById = function (array, id) {
        var item;
        for (var i = 0; i < array.length; i++) {
            if (array[i].getId() == id)
                return array[i];
            if (array[i].getType() == 'folder') {
                item = this.findById(array[i].getChildren(), id);
                if (item)
                    return item;
            }
        }
    };
    FileSystem.prototype.findParent = function (array, id) {
        for (var i in array) {
            if (array[i].getType() == 'file') {
                continue;
            }
            if (this.haveChildWithId(array[i].getChildren(), id)) {
                return array[i];
            }
            else {
                var resultFromChild = this.findParent(array[i].getChildren(), id);
                if (resultFromChild != 0)
                    return resultFromChild;
            }
        }
        return 0;
    };
    FileSystem.prototype.haveChildWithId = function (array, id) {
        for (var i in array) {
            if (array[i].getId() == id)
                return true;
        }
        return false;
    };
    FileSystem.prototype.findFullPathRecursevly = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].getId() == id) {
                return array[i].name;
            }
            else {
                if (array[i].getType() == 'folder') {
                    var resultFromChild = this.findFullPathRecursevly(array[i].getChildren(), id);
                    if (resultFromChild != '')
                        return array[i].name + '/' + resultFromChild;
                }
            }
        }
        return '';
    };
    FileSystem.prototype.getItemByPathRecursevly = function (path, current) {
        if (path[0] == current.name) {
            if (path.length == 1)
                return current;
            path.shift();
            if (current.getType == 'file')
                return undefined;
            for (var i = 0; i < current.getChildren().length; i++) {
                var item = this.getItemByPathRecursevly(path, current.getChildren()[i]);
                return item;
            }
        }
    };
    FileSystem.prototype.usedName = function (father, name) {
        var children = father.getChildren();
        for (var i in children) {
            if (children[i].name == name) {
                return true;
            }
        }
        return false;
    };
    FileSystem.prototype.uniqueName = function (father, name) {
        var suffix = 1;
        if (this.usedName(father, name)) {
            while (this.usedName(father, name + suffix)) {
                suffix++;
            }
            return name + suffix;
        }
        else
            return name;
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
//# sourceMappingURL=fileSystem.js.map