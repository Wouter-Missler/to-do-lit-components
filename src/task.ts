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
        // making sure the date is formatted correctly 0x for single digit numbers
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const month =
            date.getMonth() + 1 < 10
                ? "0" + date.getMonth() + 1
                : date.getMonth() + 1;
        const hours =
            date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        const minutes =
            date.getMinutes() < 10
                ? "0" + date.getMinutes()
                : date.getMinutes();

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
            border-bottom: 1px solid #555;
        }

        input {
            margin-right: 0.5rem;
        }

        input[type="text"] {
            flex-grow: 1;
            font-size: 1rem;
            color: #ccc;

            &:focus {
                border: none;
                background: rgba(255, 255, 255, 0.1);
                outline: 2px solid var(--primary);
                outline-offset: 2px;
            }
        }

        input[type="text"]:not(:focus) {
            border: none;
            background: none;
        }

        input[type="checkbox"] {
            cursor: pointer;
            margin-bottom: 0.25rem;

            &:hover {
                background: #eee;
            }

            &:checked {
                background: #eee;
            }

            &:focus {
                outline: 2px solid var(--primary);
                outline-offset: 0px;
            }

            &:active {
                background: #ddd;
                outline-offset: 2px;
            }
        }

        input[checked] + input[type="text"] {
            text-decoration: line-through;
            color: #aaa;
        }

        .date {
            font-size: 0.8rem;
            color: #aaa;
            margin-left: auto;
            width: fit-content;
            padding-inline: 1rem;
            text-align: right;
        }

        button {
            padding: 0.25rem;
            border: none;
            border-radius: 4px;
            background: none;
            cursor: pointer;
            color: #eee;
            font-size: 1rem;
            transform: scale(0.8);
            transition: transform 0.2s ease-in-out;

            &:focus {
                outline: 2px solid var(--primary);
                outline-offset: 0px;
            }

            &:active {
                outline-offset: 1px;
            }
        }
    `;
}
