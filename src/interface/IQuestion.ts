export interface IQuestion {
    id: number,
    desc: string,
    question: string,
    question_type: string,
    question_file?: string,
    answer: string,
    answer_type: string,
    answer_file?: string,
    points: number,
    isHidden: boolean,
}