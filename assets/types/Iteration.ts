import {Ref} from "./Ref";

export interface Iteration extends Ref {
    Name: string;
    PlannedVelocity: number;
    Project: Ref;
    StartDate: Date;
    EndDate: Date;
}

