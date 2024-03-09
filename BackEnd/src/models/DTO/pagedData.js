export class PagedData {
    constructor(page) {
        this.Page = page;
    }

    get Data() {
        return this.data;
    }

    set Data(value) {
        this.data = value;
    }

    get Page() {
        return this.page;
    }

    set Page(value) {
        this.page = value;
    }
}