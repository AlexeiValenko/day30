import {Folder} from "./folder";
import {File} from "./file";

const ROOT = 0;
const SPLIT_SIGN = '/';

var treatedNodes = 0;
var tmpLastId = 0;

export class FileSystem {
    fsStorage: any[];
    lastId: number;

    constructor() {
        this.fsStorage = [];
        this.lastId = 0 ;

        this.readSystemFromFile();
    }

    addFolder(name: string, parentId: number): Folder {
        let parent = this.getItem(parentId);
        if(name == '') name = 'New Folder';
        let newName = this.uniqueName(parent, name);
        let folder = new Folder(++this.lastId, newName);
        if(parent) parent.addChild(folder);
        this.saveSystemToFile();
        return folder;
    }

    addFile(name: string, parentId: number, content: string): File {
        let parent = this.getItem(parentId);
        if(name == '') name = 'New File';
        let newName = this.uniqueName(parent, 'New File');
        let file = new File(++this.lastId, newName, content);
        parent.addChild(file);
        this.saveSystemToFile();
        return file;
    }

    renameItem(id: number, newName: string): any {
        if(id == ROOT) return false;
        if(newName.indexOf('/') > -1 ) throw new Error('Name can not contains "/"');
        let parent = this.findParent(this.fsStorage, id);
        if(this.usedName(parent,newName)) {
            throw new Error('Name should be unique in a folder');
        }

        let item = this.findById(this.fsStorage, id);
        item.rename(newName);
        this.saveSystemToFile();
        return item;
    }

    deleteItem(id: number): void {
        if(id == ROOT) return;
        let parent = this.findParent(this.fsStorage, id);
        if(parent) parent.deleteChild(id);
        this.saveSystemToFile();
    }


    getItem(lookingFor: any): any {
        if (!lookingFor) {
            return this.fsStorage[ROOT];
        }

        let id = Number(lookingFor);

        if (isNaN(id)) {
            let pathArray = lookingFor.split(SPLIT_SIGN);
            let item = this.getItemByPathRecursevly(pathArray, this.fsStorage[0]);
            if (item) return item;
            else return undefined;
        }

        let item = this.findById(this.fsStorage, id);
        if (item) return item;
        else return undefined;
    }

    getPath(id: number): string {
        return this.findFullPathRecursevly(this.fsStorage, id);
    }

    getParent(id: number): Folder {
        return this.findParent(this.fsStorage, id);
    }

    // Private functions

    private saveSystemToFile(): void {
        let flatSystem = this.makeSystemFlat();
        localStorage.setItem('file_system', JSON.stringify(flatSystem));
    }

    private makeSystemFlat(): any[] {
        let clone = {};
        let flatSystem = [];

        clone['id'] = ROOT;
        clone['name'] = 'root';
        clone['type'] = 'folder';
        clone['father'] = null;
        flatSystem.push(clone);
        this.putChildrensToFlat(flatSystem, this.fsStorage[0]);
        return flatSystem;
    }


    private putChildrensToFlat(flatSystem: any[], father: Folder): void {
        let children = father.getChildren();
        children.forEach(function (node) {
            let clone = {};
            clone['id'] = node.getId();
            clone['name'] = node.name;
            clone['type'] = node.getType();
            clone['father'] = father['id'];
            if (clone['type'] == 'file') clone['content'] = node.getContent();
            flatSystem.push(clone);
            if (node.getType() == 'folder') this.putChildrensToFlat(flatSystem, node);
        }.bind(this))
    }

    private readSystemFromFile(): void {
        this.fsStorage = [];
        tmpLastId = 0;
        treatedNodes = 0;

        try {
            let flatSystem = JSON.parse(localStorage.getItem('file_system'));
            this.checkIdsAreUnique(flatSystem);
            this.makeSystemTree(flatSystem);
            if (treatedNodes < flatSystem.length) throw new Error("Extra data");
            this.lastId = tmpLastId;
        } catch (e) {
            this.fsStorage = [];
            let root = new Folder(ROOT, 'root');
            this.fsStorage.push(root);
        }
    }

    private checkIdsAreUnique(flatSystem: any[]): void {
        let tmp = <any>[];
        for (let i = 0; i < flatSystem.length; i++) {
            let id = flatSystem[i].id;
            if (!id && tmp.includes(id)) throw new Error('Not unique id');
            tmp.push(id);
        }
    }

    private makeSystemTree(flatSystem: any[]): void {
        if (flatSystem.length == 0) {
            throw new Error('Empty system storage');
        }

        for (let i = 0; i < flatSystem.length; i++) {
            if (flatSystem[i].id == 0) {  // find root
                this.nodeTreatment(this.fsStorage, flatSystem[i]);
                break;
            }
        }
        if (!this.fsStorage[0]) throw new Error('Wrong fields');
        this.addToSystemTreeChilds(this.fsStorage[0], flatSystem);
    }

    private nodeTreatment(container: any[], node: any): any {
        if (!this.checkFields(node)) throw new Error('Wrong fields');
        let item;
        if (node.type == 'folder') {
            item = new Folder(node.id, node.name);
        } else {
            item = new File(node.id, node.name, node.content);
        }
        container.push(item);
        this.updateLastId(node.id);
        treatedNodes++;
        return item;
    }

    private updateLastId(newId: number): void {
        tmpLastId = newId > tmpLastId ? newId : tmpLastId;
    }

    private addToSystemTreeChilds(father: Folder, flatSystem: any[]): void {
        flatSystem.forEach(function (child, index) {
            if (child['father'] == father.getId()) {
                let item = this.nodeTreatment(father.getChildren(), child);
                if (child.type == 'folder') {
                    this.addToSystemTreeChilds(item, flatSystem);
                }
            }
        }.bind(this));
    }

    private checkFields(node: any): boolean {
        return 'id' in node && 'father' in node && 'type' in node && 'name' in node &&
            ((node.type == 'file' && 'content' in node ) || node.type == 'folder');
    }

    private findById(array: any[], id: number): File | Folder {
        let item: File | Folder;
        for (let i = 0; i < array.length; i++) {
            if (array[i].getId() == id) return array[i];
            if (array[i].getType() == 'folder') {
                item = this.findById(array[i].getChildren(), id);
                if (item) return item;
            }
        }
    }

    private findParent(array: any[], id: number): any {
        for (let i in array) {
            if (array[i].getType() == 'file') {
                continue;
            }
            if (this.haveChildWithId(array[i].getChildren(), id)) {
                return array[i];
            } else {
                let resultFromChild = this.findParent(array[i].getChildren(), id);
                if (resultFromChild != 0) return resultFromChild;
            }
        }
        return 0;
    }

    private haveChildWithId(array: any[], id: number): boolean {
        for (let i in array) {
            if (array[i].getId() == id) return true;
        }
        return false;
    }

    private findFullPathRecursevly(array: any[], id: number): string {
        for (let i = 0; i < array.length; i++) {
            if (array[i].getId() == id) {
                return array[i].name;
            } else {
                if (array[i].getType() == 'folder') {
                    let resultFromChild = this.findFullPathRecursevly(array[i].getChildren(), id);
                    if (resultFromChild != '') return array[i].name + '/' + resultFromChild;
                }
            }
        }
        return '';
    }

    private getItemByPathRecursevly(path: string[],current: any): any {
        if (path[0] == current.name) {
            if (path.length == 1) return current;
            path.shift();
            if (current.getType == 'file') return undefined;
            for (let i = 0; i < current.getChildren().length; i++) {
                let item = this.getItemByPathRecursevly(path, current.getChildren()[i]);
                return item;
            }
        }
    }

    private usedName(father: Folder, name: string): boolean {
    let children = father.getChildren();
    for (let i in children) {
        if (children[i].name == name) {
            return true;
        }
    }
    return false;
}

    private uniqueName(father: Folder, name: string): string {
    let suffix = 1;
    if (this.usedName(father, name)) {
        while (this.usedName(father, name + suffix)) {
            suffix++;
        }
        return name + suffix;
    } else return name;
}

}