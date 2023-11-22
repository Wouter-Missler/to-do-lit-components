import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "./types/task";
import "./task"; // import the task-item component
import { repeat } from "lit/directives/repeat.js";

@customElement("task-list")
export class TaskList extends LitElement {
    @property({ type: Array })
    tasks: Task[] = [];

    @property({ type: String, reflect: true })
    name: string = "";

    private showCompleted: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();
        this.tasks = this.fetchTasks();

        // initilaize a custom event listener to update the tasks
        window.addEventListener("tasks-updated-" + this.name, () => {
            this.tasks = this.fetchTasks();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        // remove the custom event listener
        window.removeEventListener("tasks-updated-" + this.name, () => {
            this.tasks = this.fetchTasks();
        });
    }

    fetchTasks(): Task[] {
        // fetch tasks from local storage
        let tasks = JSON.parse(
            localStorage.getItem("tasks-" + this.name) || "[]"
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

    addItem(): void {
        // add a new task to the list
        const input = this.shadowRoot?.querySelector("input");
        const title = input?.value;
        if (title) {
            const tasks: Task[] = this.fetchTasks();
            const newTask: Task = {
                id: this.generateId(),
                title,
                completed: false,
                createdAt: new Date(),
            };
            tasks.push(newTask);
            localStorage.setItem("tasks-" + this.name, JSON.stringify(tasks));
            this.tasks = this.fetchTasks();
            input.value = "";

            // update other task lists with the same name
            window.dispatchEvent(
                new CustomEvent("tasks-updated-" + this.name, {
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }

    generateId() {
        // find the highest id in the list and return the next id, or 1 if the list is empty
        return this.tasks.length > 0
            ? this.tasks.sort((a: Task, b: Task) => b.id - a.id)[0].id + 1
            : 1;
    }

    toggleHideCompleted(): void {
        // toggle the hide completed button
        this.showCompleted = !this.showCompleted;
        this.tasks = this.fetchTasks();

        const button = this.shadowRoot?.querySelector(".hide-button");
        !this.showCompleted
            ? button && (button.textContent = "Show completed")
            : button && (button.textContent = "Hide completed");
    }

    render() {
        return html`
            <h2>Tasks: ${this.name}</h2>
            <ul>
                ${this.tasks.filter((task: Task) => !task.completed).length >
                    0 ||
                (this.showCompleted && this.tasks.length > 0)
                    ? repeat(
                          this.tasks,
                          (task: Task) => task.id,
                          (task: Task) => html`
                              <task-item
                                  role="listitem"
                                  task-title=${task.title}
                                  ?task-completed=${task.completed}
                                  task-id=${task.id}
                                  task-created-at=${task.createdAt}
                                  task-completed-at=${task.completedAt}
                                  list-name=${this.name}
                                  style="${task.completed && !this.showCompleted
                                      ? "display: none;"
                                      : ""}"
                              ></task-item>
                          `
                      )
                    : html`<li class="no-tasks">
                          No tasks yet! Add one below.
                          ${!this.showCompleted && this.tasks.length > 0
                              ? html`
                                    (${this.tasks.length} completed task(s)
                                    hidden)
                                `
                              : ""}
                      </li>`}
            </ul>
            <div class="add-task">
                <input
                    type="text"
                    placeholder="Add a new task"
                    @keyup=${(e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                            this.addItem();
                        }
                    }}
                />
                <button type="button" @click=${this.addItem}>Add</button>
                <button
                    class="hide-button"
                    type="button"
                    @click=${this.toggleHideCompleted}
                >
                    Show completed
                </button>
            </div>
        `;
    }

    static styles = css`
        :host {
            max-width: 100%;
        }

        h2 {
            color: #ddd;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        ul {
            list-style: none;
            padding: 0;
            display: flex;
            flex-direction: column;
            max-height: 30vh;
            overflow-y: auto;
        }

        .no-tasks {
            font-style: italic;
            color: #999;
        }

        .add-task {
            display: grid;
            grid-template-columns: 1fr 0.5fr 0.5fr;
            gap: 0.5rem;

            @media (max-width: 768px) {
                grid-template-columns: 1fr 1fr;

                & input {
                    grid-column: 1 / span 2;
                }
            }
        }

        .add-task input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .add-task button {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
            color: #333;
        }

        .add-task button:hover {
            background: #eee;
        }

        .add-task button:active {
            background: #ddd;
        }

        .add-task button:focus {
            outline: 2px solid #ddd;
            outline-offset: 2px;
        }
    `;
}
