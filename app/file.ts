export class File {

    name: string;
    id: number;
    content: string;

    constructor(id: number, name: string, content: string) {
        this.name = name;
        this.id = id;
        this.content = content;

    }

    rename(newName: string): void {
        this.name = newName;
    }

    setContent(content: string): void {
        this.content = content;
    }

    getContent(): string {
        return this.content;
    }

    getId(): number {
        return this.id;
    }

    getType(): string {
        return 'file';
    }
}