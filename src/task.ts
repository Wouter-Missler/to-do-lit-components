import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Task } from "./types/task";

@customElement("task-item")
export class TaskItem extends LitElement {
    @property({ type: String, reflect: true, attribute: "task-title" })
    title: string = "";

    @property({ type: Boolean, reflect: true, attribute: "task-completed" })
    completed?: boolean;

    @property({ type: Number, attribute: "task-id" })
    identifier: number = 0;

    @property({ type: String, attribute: "list-name" })
    listName: string = "";

    // an extra property so that the cursor doesn't jump when editing the title
    private titleValue: string = "";

    connectedCallback(): void {
        super.connectedCallback();
        this.titleValue = this.title;
    }

    toggleCompleted(e: InputEvent): void {
        this.completed = (e.target as HTMLInputElement).checked;

        this.persistTask({
            title: this.title,
            completed: this.completed,
            updatedAt: new Date(),
            completedAt: this.completed ? new Date() : undefined,
        });
    }

    handleInput(e: InputEvent): void {
        const target = e.target as HTMLInputElement;
        this.title = target.innerText;

        // update json file
        this.persistTask({
            title: this.title,
            updatedAt: new Date(),
        });
    }
    persistTask({ ...taskArgs }): void {
        // there's no api for this demo, so we'll just update the localstorage
        const tasks = JSON.parse(
            localStorage.getItem("tasks-" + this.listName) || "[]"
        );
        const index = tasks.findIndex(
            (task: any) => task.id === this.identifier
        );
        tasks[index] = {
            ...tasks[index],
            ...taskArgs,
        };
        localStorage.setItem("tasks-" + this.listName, JSON.stringify(tasks));
    }

    // we need this function here to update the titleValue property whenever the task-title attribute changes
    attributeChangedCallback(
        name: string,
        _old: string | null,
        value: string | null
    ): void {
        super.attributeChangedCallback(name, _old, value);
        if (name === "task-title") {
            this.titleValue = value || "";
        }
    }

    render() {
        return html`
            <input
                type="checkbox"
                title="Mark as completed"
                @change=${(e: InputEvent) => {
                    this.toggleCompleted(e);
                }}
                ?checked=${this.completed}
            />
            <span
                contenteditable
                @input=${(e: InputEvent) => {
                    this.handleInput(e);
                }}
            >
                ${this.titleValue}
            </span>
        `;
    }

    static styles = css`
        :host {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        input {
            margin-right: 0.5rem;
        }

        span[contenteditable]:focus {
            outline: none;
            background: #040404;
        }

        input[type="checkbox"] {
            cursor: pointer;
        }

        input[type="checkbox"]:hover {
            background: #eee;
        }

        input[type="checkbox"]:checked {
            background: #eee;
        }

        input[type="checkbox"]:active {
            background: #ddd;
        }

        input[checked] + span {
            text-decoration: line-through;
            color: #aaa;
        }
    `;
}
