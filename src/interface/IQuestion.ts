export interface IQuestion {
    question: string,
    question_type: string,
    question_file: string | null,
    answer: string,
    answer_type: string,
    answer_file: string | null,
    points: number,
    isHidden: boolean,
}