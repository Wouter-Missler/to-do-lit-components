import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

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

    @property({ type: String, attribute: "task-created-at" })
    createdAt: string = new Date().toISOString();

    @property({ type: String, attribute: "task-completed-at" })
    completedAt?: string;

    // an extra property so that the cursor doesn't jump when editing the title
    private titleValue: string = "";

    connectedCallback(): void {
        super.connectedCallback();
        this.titleValue = this.title;
    }

    toggleCompleted(e: InputEvent): void {
        this.completed = (e.target as HTMLInputElement).checked;

        this.updateTask({
            title: this.title,
            completed: this.completed,
            updatedAt: new Date(),
            completedAt: this.completed ? new Date() : undefined,
        });
    }

    handleInput(e: InputEvent): void {
        const target = e.target as HTMLInputElement;
        this.title = target.value;

        // update json file
        this.updateTask({
            title: this.title,
            updatedAt: new Date(),
        });
    }

    updateTask({ ...taskArgs }): void {
        //update the task
        this.dispatchEvent(
            new CustomEvent("task-updated-" + this.listName, {
                bubbles: true,
                composed: true,
                detail: {
                    id: this.identifier,
                    ...taskArgs,
                },
            })
        );
    }

    deleteTask(): void {
        // delete the task
        this.dispatchEvent(
            new CustomEvent("task-deleted-" + this.listName, {
                bubbles: true,
                composed: true,
                detail: this.identifier,
            })
        );
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

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // xx-xx xx:xx
        return `${day}-${month} ${hours}:${minutes}`;
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
            <input
                type="text"
                title="Edit task"
                spellcheck="false"
                @input=${(e: InputEvent) => {
                    this.handleInput(e);
                }}
                value=${this.titleValue}
            />
            <span class="date">
                ${this.completed && this.completedAt
                    ? this.formatDate(this.completedAt)
                    : this.formatDate(this.createdAt)}
            </span>
            <button
                type="button"
                class="delete"
                title="Delete task"
                @click=${() => {
                    this.deleteTask();
                    this.remove();
                }}
            >
                🗑️
            </button>
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

        input[type="text"] {
            font-size: 1rem;
        }

        input[type="text"]:not(:focus) {
            border: none;
            background: none;
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

        .date {
            font-size: 0.8rem;
            color: #aaa;
            margin-left: auto;
        }

        button {
            padding: 0.5rem;
            border: none;
            border-radius: 4px;
            background: none;
            cursor: pointer;
            color: #eee;
            font-size: 1rem;
            transform: scale(0.9);
            transition: transform 0.2s ease-in-out;

            &:hover {
                transform: scale(1);
            }
        }
    `;
}
