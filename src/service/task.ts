export type Task = {
    id: number;
    title: string;
    completed: boolean;

    createdAt: Date;
    updatedAt?: Date;
    completedAt?: Date;
};
