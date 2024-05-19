import { IQuestion } from "./IQuestion";

export interface ITopic {
    id: number,
    title: string,
    questions: IQuestion[]
}