import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "./service/task";
import "./task"; // import the task-item component
import { repeat } from "lit/directives/repeat.js";
import { TaskService } from "./service/task-service";

@customElement("task-list")
export class TaskList extends LitElement {
    @property({ type: String, reflect: true })
    name: string = "";

    @property({ type: Boolean, reflect: true })
    showCompleted: boolean = false;

    private taskService: TaskService | undefined;

    connectedCallback(): void {
        super.connectedCallback();

        this.taskService = new TaskService(this.name);

        // I am adding the this.name to the event name to make it unique to the necessary task-lists
        // without it, every task-list would listen to every task(s)-updated event

        // listen for update events from the task-item component
        this.addEventListener("task-updated-" + this.name, (e: Event) => {
            const task = (e as CustomEvent<Task>).detail;
            this.taskService?.updateTask(task);
        });

        // listen for delete events from the task-item component
        this.addEventListener("task-deleted-" + this.name, (e: Event) => {
            const id = (e as CustomEvent<number>).detail;
            this.taskService?.deleteTask(id);
        });

        // listen to general tasks-updated event, which is dispatched from the task-service
        // the only reason this is necessary is because we want to be able to have multiple task-lists
        // with the same name that stay in sync with each other
        window.addEventListener("tasks-updated-" + this.name, () => {
            this.requestUpdate();
        });
    }

    addItem(): void {
        // add a new task to the list
        const input = this.shadowRoot?.querySelector("input");
        const title = input?.value;
        if (title) {
            this.taskService?.addTask(title);
            input.value = "";
        }
    }

    toggleHideCompleted(): void {
        // toggle the hide completed button
        this.showCompleted = !this.showCompleted;

        const button = this.shadowRoot?.querySelector(".hide-button");
        !this.showCompleted
            ? button && (button.textContent = "Show completed")
            : button && (button.textContent = "Hide completed");
    }

    render() {
        const tasks = this.taskService?.getTasks();
        if (!tasks) {
            return html`
                <h2>Tasks: ${this.name}</h2>
                <p>Loading...</p>
            `;
        }

        const showTasks =
            tasks.filter((task: Task) => !task.completed).length > 0 || // show tasks if there are any incomplete tasks
            (this.showCompleted && tasks.length > 0); // or if showCompleted is true and there are any tasks

        return html`
            <h2>Tasks: ${this.name}</h2>
            <ul>
                ${showTasks
                    ? repeat(
                          tasks,
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
                    : html`
                          <li class="no-tasks">
                              No tasks yet! Add one below.
                              ${!this.showCompleted && tasks.length > 0
                                  ? html`
                                        (${tasks.length} completed task(s)
                                        hidden)
                                    `
                                  : ""}
                          </li>
                      `}
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
