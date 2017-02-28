

import {FileSystem} from "./fileSystem";
import {History} from "./history";
import {File} from "./file";
import {Folder} from "./folder";
import * as $ from 'jquery';


const ROOT = 0;
const ABSENT = -1;

var menuUl;
var fullSystemList;
var content;
var currentFile: File;
var self: UserInterface;

export class UserInterface {
    fileSystem: FileSystem;
    myHistory: History;

    constructor(fileSystem: FileSystem, myHistory: History) {
        this.fileSystem = fileSystem;
        this.myHistory = myHistory;

        self = this;

        $(document).ready(function () {
            content = $('.content');
            content.contextmenu(self.showContextMenu);
            fullSystemList = $('.list');
            //context menu
            menuUl = $('ul.contextMenu');
            $('.contextMenu > #newFolder').click(self.clickAddFolder);
            $('.contextMenu > #newFile').click(self.clickAddFile);
            $('.contextMenu > #rename').click(self.clickRename);
            $('.contextMenu > #delete').click(self.clickDelete);
            $(window).click(self.hideContextMenu);
            // path
            $('input#go').val('root');
            $('button#go').click(self.clickGo);
            // history
            $('button#back').click(self.clickBack);
            $('button#forward').click(self.clickForward);
            //files three
            self.makeThree(self.fileSystem.getItem(ROOT), fullSystemList);

            $(this).bind("contextmenu", function(e) {
                e.preventDefault();
            });
        });
    }

//  event handlers

    private clickFileOrFolder(e: any): boolean {
        e.stopPropagation();
        self.hideContextMenu();

        let id = $(this).data('id');
        self.myHistory.addToHistory(id);
        self.expand(id, true);
        self.showContent(id);
        return false;
    }

    private clickExpander(e: any): boolean {
        self.expand($(this).data('id'), false);
        self.hideContextMenu();
        return false;
    }

    private clickAddFile(e: any): boolean {
        e.stopPropagation();
        self.hideContextMenu();

        let id = $('.contextMenu').data('id');

        let father = self.fileSystem.getItem(id);
        let node = self.fileSystem.addFile('', father.getId(), '');

        let upperUl = $('ul[data-id=' + id + ']');
        let li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        let link = $('<a href="" data-id="' + node.getId() + '">' + node.name + '</a></li>');
        $(link).contextmenu(self.showContextMenu);
        $(link).click(self.clickFileOrFolder);
        li.appendTo(upperUl);
        li.addClass("hiden");
        li.append(link);
        self.showContent(id);
        return false;
    }

    private clickAddFolder(e: any): boolean {
        e.stopPropagation();
        self.hideContextMenu();

        let id = $('.contextMenu').data('id');

        let father = self.fileSystem.getItem(id);
        let node = self.fileSystem.addFolder('', father.getId());
        let upperUl = $('ul[data-id=' + id + ']');

        let li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        let link = $('<a href="" data-id="' + node.getId() + '" data-type="' + node.getType() + '">'
            + node.name + '</a></li>');
        $(link).click(self.clickFileOrFolder);
        $(link).contextmenu(self.showContextMenu);
        li.appendTo(upperUl);

        let button = $('<button class="expand" data-id="' + node.getId() + '">+</button>');
        $(button).click(self.clickExpander);
        li.addClass('directory');
        li.append(button).append(link);
        let ul = $('<ul data-id="' + node.getId() + '" class="hiden"></ul>');
        li.append(ul);
        self.showContent(id);
        return false;
    }

    private clickDelete(e: any): boolean {
        e.stopPropagation();
        self.hideContextMenu();

        let id = $('.contextMenu').data('id');
        let parent = self.fileSystem.getParent(id).getId();

        if (id == 0) {
            alert('You can not delete root');
            return;
        }
        self.fileSystem.deleteItem(id);
        $('li[data-id=' + id + ']').remove();
        self.showContent(parent);
        return false;
    }

    private clickRename(e: any): boolean {
        e.stopPropagation();
        self.hideContextMenu();

        let id = $('.contextMenu').data('id');
        if (id == 0) {
            alert('You can not rename root');
            return;
        }

        setTimeout(function () {
            let done = false;
            let message = 'Insert new name';
            let name;
            do {
                name = prompt(message);
                if (name == null) return false;
                try {
                    let item = self.fileSystem.renameItem(id, name);
                    done = true;
                } catch (e) {
                    message = e.message + ', please insert another name.';
                }
            } while (!done);
            $('a[data-id=' + id + ']').text(name);
            self.showContent(self.fileSystem.getParent(id).getId());
        }, 10);
        return false;
    }

    private clickBack(): boolean {
        self.hideContextMenu();
        let id = self.myHistory.goBack();
        if (id != ABSENT) self.showContent(id);
        return false;
    }

    private clickForward(): boolean {
        self.hideContextMenu();
        let id = self.myHistory.goForward();
        if (id != ABSENT) self.showContent(id);
        return false;
    }

    private clickGo(e: any): boolean {
        self.hideContextMenu();
        let path = $('input#path').val();
        let item = self.fileSystem.getItem(path);
        if(!item) {
            alert('No such folder');
            return false;
        }
        let id = item.getId();
        self.showContent(id);
        return false;
    }

    private clickSave(e: any): boolean {
        self.hideContextMenu();
        currentFile.setContent($('textarea.content').val());
        return false;
    }

    private clickCancel(e: any): boolean {
        self.hideContextMenu();
        $('textarea.content').val(currentFile.getContent());
        return false;
    }

    private showContextMenu(e: any): boolean {
        e.stopPropagation();
        let id = $(e.currentTarget).attr('data-id');
        let type = $(e.currentTarget).attr('data-type');
        if (id == undefined || type == undefined) return;
        $('ul.contextMenu').css('left', e.pageX - 10 + 'px');
        $('ul.contextMenu').css('top', e.pageY - 10 + 'px');
        $('ul.contextMenu').attr('data-id', id);
        $('ul.contextMenu').data('id', id);
        $('ul.contextMenu').attr('data-type', type);
        $('ul.contextMenu').css('display', 'block');
        return false;
    }

    private hideContextMenu(): void {
        $(menuUl).css('display', 'none');
    }

    // presentation

    private makeThree(node: any, upperUl: any): void {
        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '" data-type="' + node.getType() + '">'
            + node.name + '</a></li>');
        $(link).click(this.clickFileOrFolder);
        $(link).contextmenu(this.showContextMenu);
        li.appendTo(upperUl);

        if (node.getType() == 'folder') {
            var button = $('<button class="expand" data-id="' + node.getId() + '">+</button>');
            $(button).click(this.clickExpander);
            li.addClass('directory');
            li.append(button).append(link);
            var ul = $('<ul data-id="' + node.getId() + '" class="hiden"></ul>');
            li.append(ul);
            if (node.getChildren().length > 0) {
                node.getChildren().forEach(function (child) {
                    self.makeThree(child, ul);
                });
            }
        } else {
            li.addClass("hiden");
            li.append(link);
        }
    }

    private showContent(id: number): void {
        let path = this.fileSystem.getPath(id);
        $('input.path').val(path);

        let item = $('li[data-id=' + id + ']');

        $(content).html('');
        $(content).attr('data-type', 'content');
        $(content).attr('data-id', id);

        currentFile = this.fileSystem.getItem(id);

        if (item.hasClass('folder') || item.hasClass('directory')) {
            let emptyUl = $('<ul data-type="content"></ul>');
            $(content).append(emptyUl);
            let children = this.fileSystem.getItem(id).getChildren();
            children.forEach(function (child) {
                self.addChildToContent(emptyUl, child);
            });
        } else {
            let fileContent = currentFile.getContent();
            let text = $('<textarea name="fileContent" class="content">' + fileContent + '</textarea>');
            let buttonSave = $('<button class="content">Save</button>');
            let buttonCancel = $('<button class="content">Cancel</button>');
            $(buttonSave).click(this.clickSave);
            $(buttonCancel).click(this.clickCancel);
            $(content).append(text).append(buttonCancel).append(buttonSave);
        }
    }

    private addChildToContent(content: any, node: any): void {
        let link = $('<li data-id="' + node.getId() + '"  data-type="' + node.getType() + '" class="'
            + node.getType() + '" title="' + node.name + '"><span>' + node.name + '</span> </li>');
        $(link).click(this.clickFileOrFolder);
        $(link).contextmenu(this.showContextMenu);
        $(content).append(link);
    }

    private expand(id: number, expandOnly: boolean): void {
        let button = $('button[data-id=' + id + ']');
        let ul = $('ul[data-id=' + id + ']');

        if ($(ul).hasClass('hiden')) {
            $(button).text('-');
            this.showDir(ul);
        } else if (!expandOnly) {
            $(button).text('+');
            this.hideDir(ul);
        }
    }

    private showDir(ul: any): void {
        $(ul).removeClass("hiden");
    }

    private hideDir(ul: any): void {
        $(ul).addClass("hiden");
    }
}
