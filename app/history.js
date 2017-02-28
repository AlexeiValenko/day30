"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ABSENT = -1;
var History = (function () {
    function History(fileSystem) {
        this.currentHistoryPosition = -1;
        this.myHistory = [];
        this.currentHistoryPosition = -1;
        this.fileSystem = fileSystem;
    }
    History.prototype.goBack = function () {
        while (this.currentHistoryPosition > 0) {
            this.currentHistoryPosition--;
            var id = this.myHistory[this.currentHistoryPosition];
            if (!this.fileSystem.getItem(id)) {
                this.myHistory.splice(this.currentHistoryPosition, 1);
                continue;
            }
            return id;
        }
        return ABSENT;
    };
    History.prototype.goForward = function () {
        while (this.currentHistoryPosition != this.myHistory.length - 1) {
            this.currentHistoryPosition++;
            var id = this.myHistory[this.currentHistoryPosition];
            if (!this.fileSystem.getItem(id)) {
                this.myHistory.splice(this.currentHistoryPosition, 1);
                this.currentHistoryPosition--;
                continue;
            }
            return id;
        }
        return ABSENT;
    };
    History.prototype.addToHistory = function (id) {
        if (id != this.myHistory[this.currentHistoryPosition]) {
            this.myHistory.splice(this.currentHistoryPosition + 1, this.myHistory.length);
            this.myHistory.push(id);
            this.currentHistoryPosition++;
        }
    };
    return History;
}());
exports.History = History;
//# sourceMappingURL=history.js.map