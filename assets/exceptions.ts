
export class NotFoundError extends Error {
    // NOTE: Used to trigger a 404 style page in the error handler. See main.ts
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = NotFoundError.name;
    }
}

export class AuthenticationError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = AuthenticationError.name;
    }
}
