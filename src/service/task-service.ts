import type { Task } from "./task";

export class TaskService {
    private tasks: Task[] = [];
    private localStorageKey: string;
    private listName: string;

    constructor(listName: string) {
        this.localStorageKey = "tasks-" + listName;
        this.listName = listName;

        // initialize the tasks
        this.tasks = this.fetchTasks();

        // listen for an update on the tasks, necessary for syncing multiple task-lists
        window.addEventListener("tasks-updated-" + this.listName, () => {
            this.tasks = this.fetchTasks();
        });
    }

    // fetch tasks from local storage
    private fetchTasks(): Task[] {
        let tasks = JSON.parse(
            localStorage.getItem(this.localStorageKey) || "[]"
        );

        // sort the tasks on the basis of completed and createdAt
        tasks = tasks.sort((a: Task, b: Task) => {
            if (a.completed && !b.completed) {
                return 1;
            } else if (!a.completed && b.completed) {
                return -1;
            } else {
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            }
        });

        return tasks;
    }

    // add a new task to the list
    public addTask(title: string): void {
        const newTask: Task = {
            id: this.generateId(),
            title,
            completed: false,
            createdAt: new Date(),
        };
        this.tasks.push(newTask);

        this.persistTasks();
    }

    // update a task
    public updateTask({ ...taskArgs }: Task): void {
        const task = this.tasks.find((task: Task) => task.id === taskArgs.id);
        if (!task) {
            console.error("Task not found");
            return;
        }

        const updatedTask = {
            ...task, // get the existing task
            ...taskArgs, // override any properties that were passed in
        };

        // update the task
        this.tasks = this.tasks.map((task: Task) =>
            task.id === updatedTask.id ? updatedTask : task
        );

        this.persistTasks();
    }

    // delete a task
    public deleteTask(id: number): void {
        this.tasks = this.tasks.filter((task: Task) => task.id !== id);

        this.persistTasks();
    }

    // update all the tasks
    private persistTasks(): void {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));

        // dispatch a custom event to notify the task-list component
        window.dispatchEvent(
            new CustomEvent("tasks-updated-" + this.listName, {
                bubbles: true,
                composed: true,
            })
        );
    }

    // generate a unique id for the task
    private generateId(): number {
        // find the highest id in the list and return the next id, or 1 if the list is empty
        return this.tasks.length > 0
            ? this.tasks.sort((a: Task, b: Task) => b.id - a.id)[0].id + 1
            : 1;
    }

    public getTasks(): Task[] {
        return this.tasks;
    }
}
