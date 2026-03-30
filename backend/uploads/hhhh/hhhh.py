# ---------- Data Storage ----------
tasks = []


# ---------- Core Functions ----------

def add_task():
    title = input("Enter task: ")
    task = {
        "title": title,
        "done": False
    }
    tasks.append(task)
    print("Task added.\n")


def view_tasks():
    if not tasks:
        print("No tasks available.\n")
        return

    print("\nYour Tasks:")
    for i, task in enumerate(tasks, start=1):
        status = "✔" if task["done"] else "✘"
        print(f"{i}. [{status}] {task['title']}")
    print()


def mark_done():
    view_tasks()
    if not tasks:
        return

    try:
        index = int(input("Enter task number to mark done: ")) - 1
        tasks[index]["done"] = True
        print("Task marked as completed.\n")
    except (ValueError, IndexError):
        print("Invalid input.\n")


def delete_task():
    view_tasks()
    if not tasks:
        return

    try:
        index = int(input("Enter task number to delete: ")) - 1
        removed = tasks.pop(index)
        print(f"Deleted: {removed['title']}\n")
    except (ValueError, IndexError):
        print("Invalid input.\n")


# ---------- Menu ----------

def show_menu():
    print("==== TODO APP ====")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Mark Task as Done")
    print("4. Delete Task")
    print("5. Exit")


# ---------- Flow Controller ----------

def run_app():
    while True:
        show_menu()
        choice = input("Choose an option: ")

        if choice == "1":
            add_task()
        elif choice == "2":
            view_tasks()
        elif choice == "3":
            mark_done()
        elif choice == "4":
            delete_task()
        elif choice == "5":
            print("Exiting app...")
            break
        else:
            print("Invalid choice.\n")


# ---------- Main ----------

def main():
    print("Welcome to Function-Based TODO App\n")
    run_app()


if __name__ == "__main__":
    main()