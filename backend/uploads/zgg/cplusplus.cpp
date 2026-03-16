#include <iostream>
#include <string>
#include <vector>

// The Class: A blueprint for a Bank Account
class BankAccount {
private:
    // Private attributes: Cannot be accessed directly from outside the class
    std::string owner;
    double balance;
    int accountNumber;

public:
    // Constructor: Initializes the object
    BankAccount(std::string name, int id, double initialDeposit) {
        owner = name;
        accountNumber = id;
        balance = initialDeposit;
    }

    // Method: To deposit money
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            std::cout << "Deposited $" << amount << " into account #" << accountNumber << std::endl;
        }
    }

    // Method: To withdraw money (with logic checks)
    void withdraw(double amount) {
        if (amount > balance) {
            std::cout << "Insufficient funds! Withdrawal failed." << std::endl;
        } else {
            balance -= amount;
            std::cout << "Withdrew $" << amount << ". New balance: $" << balance << std::endl;
        }
    }

    // Getter Method: To safely view the private balance
    void displayInfo() const {
        std::cout << "Owner: " << owner << " | ID: " << accountNumber << " | Balance: $" << balance << std::endl;
    }
};

int main() {
    // Creating Objects (Instances of the BankAccount class)
    BankAccount account1("Alice", 1001, 500.00);
    BankAccount account2("Bob", 1002, 150.00);

    // Using Methods
    account1.displayInfo();
    account1.deposit(250.0);
    account1.withdraw(100.0);

    std::cout << "\n--- Next Transaction ---" << std::endl;
    account2.displayInfo();
    account2.withdraw(200.0); // This should trigger the "Insufficient funds" check

    return 0;
}