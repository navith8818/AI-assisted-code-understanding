class Book:
    """Represents a single book in the library."""
    def __init__(self, title, author, isbn):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.is_checked_out = False

    def __str__(self):
        status = "Checked Out" if self.is_checked_out else "Available"
        return f"'{self.title}' by {self.author} [{status}]"


class Library:
    """Manages a collection of Book objects."""
    def __init__(self, name):
        self.name = name
        self.books = []

    def add_book(self, book):
        """Adds a Book object to the library's collection."""
        self.books.append(book)
        print(f"Added: {book.title}")

    def find_book_by_title(self, title):
        """Helper function to search for a book."""
        for book in self.books:
            if book.title.lower() == title.lower():
                return book
        return None

    def checkout_book(self, title):
        """Functions as the logic for borrowing a book."""
        book = self.find_book_by_title(title)
        if book:
            if not book.is_checked_out:
                book.is_checked_out = True
                print(f"Success! You've checked out {title}.")
            else:
                print(f"Sorry, {title} is already checked out.")
        else:
            print(f"Error: {title} not found in {self.name}.")

# --- Execution Section ---

# 1. Create the Library Object
my_library = Library("City Central Library")

# 2. Create Book Objects (Instances)
book1 = Book("The Great Gatsby", "F. Scott Fitzgerald", "12345")
book2 = Book("1984", "George Orwell", "67890")

# 3. Use Library Methods
my_library.add_book(book1)
my_library.add_book(book2)

print("\n--- Current Inventory ---")
for b in my_library.books:
    print(b)

print("\n--- Transaction ---")
my_library.checkout_book("1984")
my_library.checkout_book("1984") # Try checking out the same book again