#include <stdio.h>

// Function declarations
void greet();
int add(int a, int b);
void displayResult(int result);

int main() {
    int num1 = 10, num2 = 20;
    int sum;

    greet();

    sum = add(num1, num2);

    displayResult(sum);

    return 0;
}

// Function 1
void greet() {
    printf("Welcome to the C program!\n");
}

// Function 2
int add(int a, int b) {
    return a + b;
}

// Function 3
void displayResult(int result) {
    printf("The sum is: %d\n", result);
}