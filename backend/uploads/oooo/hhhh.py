# ---------- Utility Functions ----------

def input_marks():
    print("Entering marks...")
    return [75, 80, 85]


def process_marks(marks):
    print("Processing marks...")
    total = sum(marks)
    avg = total / len(marks)
    return total, avg


def display_result(name, total, avg):
    print("Displaying result...")
    print(f"Name: {name}")
    print(f"Total: {total}")
    print(f"Average: {avg:.2f}")


# ---------- Class ----------

class Student:
    def __init__(self, name):
        self.name = name
        self.marks = []

    def load_marks(self):
        print("Calling input_marks() from class...")
        self.marks = input_marks()   # function call

    def analyze_marks(self):
        print("Calling process_marks() from class...")
        return process_marks(self.marks)  # function call

    def show(self, total, avg):
        print("Calling display_result() from class...")
        display_result(self.name, total, avg)  # function call


# ---------- Flow Controller ----------

def run_student_flow():
    print("Starting student flow...\n")

    student = Student("Navith")

    # Step-by-step flow
    student.load_marks()                 # → calls input_marks()
    total, avg = student.analyze_marks() # → calls process_marks()
    student.show(total, avg)             # → calls display_result()

    print("\nFlow finished.")


# ---------- Main Entry ----------

def main():
    print("Program started...\n")
    run_student_flow()   # main flow trigger
    print("\nProgram ended.")


if __name__ == "__main__":
    main()