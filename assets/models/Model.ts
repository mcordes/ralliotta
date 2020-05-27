
export abstract class Model {
    data: any = {};

    constructor(data: any) {
        this.data = data;
    }

    getRef() {
        return this.data._ref;
    }
}
