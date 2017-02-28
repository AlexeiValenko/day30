"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var ROOT = 0;
var ABSENT = -1;
var menuUl;
var fullSystemList;
var content;
var currentFile;
var self;
var UserInterface = (function () {
    function UserInterface(fileSystem, myHistory) {
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
            $(this).bind("contextmenu", function (e) {
                e.preventDefault();
            });
        });
    }
    //  event handlers
    UserInterface.prototype.clickFileOrFolder = function (e) {
        e.stopPropagation();
        self.hideContextMenu();
        var id = $(this).data('id');
        self.myHistory.addToHistory(id);
        self.expand(id, true);
        self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickExpander = function (e) {
        self.expand($(this).data('id'), false);
        self.hideContextMenu();
        return false;
    };
    UserInterface.prototype.clickAddFile = function (e) {
        e.stopPropagation();
        self.hideContextMenu();
        var id = $('.contextMenu').data('id');
        var father = self.fileSystem.getItem(id);
        var node = self.fileSystem.addFile('', father.getId(), '');
        var upperUl = $('ul[data-id=' + id + ']');
        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '">' + node.name + '</a></li>');
        $(link).contextmenu(self.showContextMenu);
        $(link).click(self.clickFileOrFolder);
        li.appendTo(upperUl);
        li.addClass("hiden");
        li.append(link);
        self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickAddFolder = function (e) {
        e.stopPropagation();
        self.hideContextMenu();
        var id = $('.contextMenu').data('id');
        var father = self.fileSystem.getItem(id);
        var node = self.fileSystem.addFolder('', father.getId());
        var upperUl = $('ul[data-id=' + id + ']');
        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '" data-type="' + node.getType() + '">'
            + node.name + '</a></li>');
        $(link).click(self.clickFileOrFolder);
        $(link).contextmenu(self.showContextMenu);
        li.appendTo(upperUl);
        var button = $('<button class="expand" data-id="' + node.getId() + '">+</button>');
        $(button).click(self.clickExpander);
        li.addClass('directory');
        li.append(button).append(link);
        var ul = $('<ul data-id="' + node.getId() + '" class="hiden"></ul>');
        li.append(ul);
        self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickDelete = function (e) {
        e.stopPropagation();
        self.hideContextMenu();
        var id = $('.contextMenu').data('id');
        var parent = self.fileSystem.getParent(id).getId();
        if (id == 0) {
            alert('You can not delete root');
            return;
        }
        self.fileSystem.deleteItem(id);
        $('li[data-id=' + id + ']').remove();
        self.showContent(parent);
        return false;
    };
    UserInterface.prototype.clickRename = function (e) {
        e.stopPropagation();
        self.hideContextMenu();
        var id = $('.contextMenu').data('id');
        if (id == 0) {
            alert('You can not rename root');
            return;
        }
        setTimeout(function () {
            var done = false;
            var message = 'Insert new name';
            var name;
            do {
                name = prompt(message);
                if (name == null)
                    return false;
                try {
                    var item = self.fileSystem.renameItem(id, name);
                    done = true;
                }
                catch (e) {
                    message = e.message + ', please insert another name.';
                }
            } while (!done);
            $('a[data-id=' + id + ']').text(name);
            self.showContent(self.fileSystem.getParent(id).getId());
        }, 10);
        return false;
    };
    UserInterface.prototype.clickBack = function () {
        self.hideContextMenu();
        var id = self.myHistory.goBack();
        if (id != ABSENT)
            self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickForward = function () {
        self.hideContextMenu();
        var id = self.myHistory.goForward();
        if (id != ABSENT)
            self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickGo = function (e) {
        self.hideContextMenu();
        var path = $('input#path').val();
        var item = self.fileSystem.getItem(path);
        if (!item) {
            alert('No such folder');
            return false;
        }
        var id = item.getId();
        self.showContent(id);
        return false;
    };
    UserInterface.prototype.clickSave = function (e) {
        self.hideContextMenu();
        currentFile.setContent($('textarea.content').val());
        return false;
    };
    UserInterface.prototype.clickCancel = function (e) {
        self.hideContextMenu();
        $('textarea.content').val(currentFile.getContent());
        return false;
    };
    UserInterface.prototype.showContextMenu = function (e) {
        e.stopPropagation();
        var id = $(e.currentTarget).attr('data-id');
        var type = $(e.currentTarget).attr('data-type');
        if (id == undefined || type == undefined)
            return;
        $('ul.contextMenu').css('left', e.pageX - 10 + 'px');
        $('ul.contextMenu').css('top', e.pageY - 10 + 'px');
        $('ul.contextMenu').attr('data-id', id);
        $('ul.contextMenu').data('id', id);
        $('ul.contextMenu').attr('data-type', type);
        $('ul.contextMenu').css('display', 'block');
        return false;
    };
    UserInterface.prototype.hideContextMenu = function () {
        $(menuUl).css('display', 'none');
    };
    // presentation
    UserInterface.prototype.makeThree = function (node, upperUl) {
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
        }
        else {
            li.addClass("hiden");
            li.append(link);
        }
    };
    UserInterface.prototype.showContent = function (id) {
        var path = this.fileSystem.getPath(id);
        $('input.path').val(path);
        var item = $('li[data-id=' + id + ']');
        $(content).html('');
        $(content).attr('data-type', 'content');
        $(content).attr('data-id', id);
        currentFile = this.fileSystem.getItem(id);
        if (item.hasClass('folder') || item.hasClass('directory')) {
            var emptyUl_1 = $('<ul data-type="content"></ul>');
            $(content).append(emptyUl_1);
            var children = this.fileSystem.getItem(id).getChildren();
            children.forEach(function (child) {
                self.addChildToContent(emptyUl_1, child);
            });
        }
        else {
            var fileContent = currentFile.getContent();
            var text = $('<textarea name="fileContent" class="content">' + fileContent + '</textarea>');
            var buttonSave = $('<button class="content">Save</button>');
            var buttonCancel = $('<button class="content">Cancel</button>');
            $(buttonSave).click(this.clickSave);
            $(buttonCancel).click(this.clickCancel);
            $(content).append(text).append(buttonCancel).append(buttonSave);
        }
    };
    UserInterface.prototype.addChildToContent = function (content, node) {
        var link = $('<li data-id="' + node.getId() + '"  data-type="' + node.getType() + '" class="'
            + node.getType() + '" title="' + node.name + '"><span>' + node.name + '</span> </li>');
        $(link).click(this.clickFileOrFolder);
        $(link).contextmenu(this.showContextMenu);
        $(content).append(link);
    };
    UserInterface.prototype.expand = function (id, expandOnly) {
        var button = $('button[data-id=' + id + ']');
        var ul = $('ul[data-id=' + id + ']');
        if ($(ul).hasClass('hiden')) {
            $(button).text('-');
            this.showDir(ul);
        }
        else if (!expandOnly) {
            $(button).text('+');
            this.hideDir(ul);
        }
    };
    UserInterface.prototype.showDir = function (ul) {
        $(ul).removeClass("hiden");
    };
    UserInterface.prototype.hideDir = function (ul) {
        $(ul).addClass("hiden");
    };
    return UserInterface;
}());
exports.UserInterface = UserInterface;
//# sourceMappingURL=UI.js.map