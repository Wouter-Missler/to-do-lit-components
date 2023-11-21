import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "./types/task";
import "./task"; // import the task-item component

@customElement("task-list")
export class TaskList extends LitElement {
    @property({ type: Array })
    tasks: Task[] = [];

    constructor() {
        super();
        this.fetchTasks();
    }

    fetchTasks(): void {
        // fetch tasks from json file
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        // if (tasks.length < 1) {
        //     tasks.push({
        //         id: 1,
        //         title: "Task 1",
        //         completed: false,
        //     });
        //     localStorage.setItem("tasks", JSON.stringify(tasks));
        // }
        this.tasks = tasks;
        console.log(this.tasks);
    }

    render() {
        return html`
            <ul>
                ${this.tasks.map(
                    (task) =>
                        html`
                            <task-item
                                title=${task.title}
                                completed=${task.completed}
                                identifier=${task.id}
                            ></task-item>
                        `
                )}
            </ul>
        `;
    }
}
