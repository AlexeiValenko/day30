"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fileSystem_1 = require("./app/fileSystem");
var history_1 = require("./app/history");
var UI_1 = require("./app/UI");
var fileSystem = new fileSystem_1.FileSystem();
var myHistory = new history_1.History(fileSystem);
var ui = new UI_1.UserInterface(fileSystem, myHistory);
//# sourceMappingURL=main.js.map