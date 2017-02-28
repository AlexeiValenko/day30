import {FileSystem} from "./fileSystem";

const ABSENT = -1;

export class History {
    myHistory: number[];
    currentHistoryPosition = -1;
    fileSystem: FileSystem;

    constructor(fileSystem: FileSystem) {
        this.myHistory = [];
        this.currentHistoryPosition = -1;
        this.fileSystem = fileSystem;
    }

    goBack(): number {
        while (this.currentHistoryPosition > 0) {
            this.currentHistoryPosition--;
            let id = this.myHistory[this.currentHistoryPosition];
            if (!this.fileSystem.getItem(id)) {
                this.myHistory.splice(this.currentHistoryPosition, 1);
                continue;
            }
            return id;
        }
        return ABSENT;
    }

    goForward(): number {
        while (this.currentHistoryPosition != this.myHistory.length - 1) {
            this.currentHistoryPosition++;
            let id = this.myHistory[this.currentHistoryPosition];
            if (!this.fileSystem.getItem(id)) {
                this.myHistory.splice(this.currentHistoryPosition, 1);
                this.currentHistoryPosition--;
                continue;
            }
            return id;
        }
        return ABSENT;
    }

    addToHistory(id: number): void {
        if (id != this.myHistory[this.currentHistoryPosition]) {
            this.myHistory.splice(this.currentHistoryPosition + 1, this.myHistory.length);
            this.myHistory.push(id);
            this.currentHistoryPosition++;
        }
    }

}
