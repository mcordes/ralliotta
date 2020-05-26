
export abstract class Model {
    data: any = {};

    constructor(data: any) {
        this.data = data;
    }

    // TODO-mrc rename to 'ref' to reduce confusion? Or getRef() or something.
    getRef() {
        return this.data._ref;
    }
}
