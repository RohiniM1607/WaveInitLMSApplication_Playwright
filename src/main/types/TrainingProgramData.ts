export interface TrainingProgramData {
    testCaseId: string;
    title: string;
    description: string;
    trainerName: string;
    trainerEmail: string;
    capacity: string;
    expectedResult: string;
}

export interface TrainingSessionFormInput {
    title?: string;
    description?: string;
    trainerName?: string;
    trainerEmail?: string;
    capacity?: string;
    startDate?: Date;
    endDate?: Date;
}
