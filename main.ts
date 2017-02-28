import {FileSystem} from "./app/fileSystem";
import {History} from "./app/history";
import {UserInterface} from "./app/UI";


var fileSystem = new FileSystem();
var myHistory = new History(fileSystem);

var ui = new UserInterface(fileSystem, myHistory);

