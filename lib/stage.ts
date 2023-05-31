import { atomWithStorage } from "jotai/utils";

export enum Stage {
    Basics = 'Basics',
    Fees = 'Fees',
    Deposit = 'Deposit',
    Review = 'Review'
};

export const stages = [
    'Basics',
    'Fees',
    'Deposit',
    'Review'
];


// @ts-ignore
export const stageAtom = atomWithStorage<Stage>("select.stage", stages[0]);
