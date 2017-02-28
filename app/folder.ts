import {File} from "./file";

export class Folder {
    name: string;
    id: number;
    children: any[];

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.children = [];
    }

    deleteChild(id: number): void {
        for(let i in this.children) {
            if (this.children[i].getId() == id) {
                this.children.splice(<any>i, 1);
                return;
            }
        }
    }

    rename(newName: string): void {
        this.name = newName;
    }

    addChild(item: any): void {
        this.children.push(item);
    }

    findChild(id: number): any {
        for(let i in this.children) {
            if(this.children[i].getId() == id) {
                return this.children[i];
            }
        }
    }

    getChildren(): any {
        return this.children;
    }

    getId(): number {
        return this.id;
    }

    getType(): string {
        return 'folder';
    }
}
