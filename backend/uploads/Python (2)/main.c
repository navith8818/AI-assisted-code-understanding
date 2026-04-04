#include <stdio.h>
#include <stdbool.h>

// --- MATH UTILITIES ---

// 1. A basic squaring function
int square(int x) {
    return x * x;
}

// 2. Uses 'square' to calculate the sum of two squares (Nesting level 1)
int sum_of_squares(int a, int b) {
    return square(a) + square(b);
}

// 3. Simple comparison
int is_greater(int a, int b) {
    return a > b;
}

// --- LOGIC LAYERS ---

// 4. Returns the larger of two squared results (Nesting level 2)
int max_squared(int a, int b) {
    int sq_a = square(a);
    int sq_b = square(b);
    
    if (is_greater(sq_a, sq_b)) {
        return sq_a;
    }
    return sq_b;
}

// 5. Checks if a number is positive
bool is_positive(int n) {
    return n > 0;
}

// 6. Validates if both numbers are positive before math (Nesting level 3)
void safe_multiply(int a, int b) {
    if (is_positive(a) && is_positive(b)) {
        printf("Result: %d\n", a * b);
    } else {
        printf("Error: Both numbers must be positive.\n");
    }
}

// --- ARRAY & POINTER LOGIC ---

// 7. Prints a single integer (To be used as a callback)
void print_num(int n) {
    printf("%d ", n);
}

// 8. A "Higher Order" style function: applies a function to an array
void process_array(int *arr, int size, void (*action)(int)) {
    for (int i = 0; i < size; i++) {
        action(arr[i]); // Calling the function passed as an argument
    }
    printf("\n");
}

// --- SYSTEM WRAPPERS ---

// 9. A wrapper to run all demonstrations (Nesting level 1)
void run_demo() {
    printf("Sum of squares (3,4): %d\n", sum_of_squares(3, 4));
    printf("Max squared (-10, 5): %d\n", max_squared(-10, 5));
    
    int data[] = {1, 2, 3, 4, 5};
    printf("Array elements: ");
    process_array(data, 5, print_num);
    
    safe_multiply(10, -2);
}

// 10. Entry point (Nesting level 0)
int main() {
    printf("Starting C Function Nesting Demo...\n");
    run_demo(); 
    return 0;
}