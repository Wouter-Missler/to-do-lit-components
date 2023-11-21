import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("task-item")
export class TaskItem extends LitElement {
    @property({ type: String })
    title: string = "";

    @property({ type: Boolean })
    completed: boolean = false;

    @property({ type: Number })
    identifier: number = 0;

    toggleCompleted(e: InputEvent): void {
        this.completed = (e.target as HTMLInputElement).checked;
        console.log(this.completed);

        // update json file
        this.updateTask();
    }

    handleInput(e: InputEvent): void {
        const target = e.target as HTMLInputElement;
        this.title = target.innerText;

        // update json file
        this.updateTask();
    }

    updateTask(): void {
        // write to json file, using the _id property. there's no api in place
        // so we'll just use a local json file
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const index = tasks.findIndex(
            (task: any) => task.id === this.identifier
        );
        tasks[index] = {
            ...tasks[index],
            title: this.title,
            completed: this.completed,
        };
        console.log(tasks);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        console.log("updated");
        console.log(localStorage.getItem("tasks"));
    }

    render() {
        return html`
            <li>
                <input
                    type="checkbox"
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
                    ${this.title}</span
                >
            </li>
        `;
    }
}
