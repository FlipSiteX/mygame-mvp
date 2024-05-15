import { ITopic } from "./ITopic";

export interface IGame {
    id: number,
    title: string,
    categories: ITopic[],
}