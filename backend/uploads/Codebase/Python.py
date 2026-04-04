# 1. Outer function containing a nested helper
def power_factory(exponent):
    # 2. Nested function (Internal helper)
    def calculate(base):
        return base ** exponent
    return calculate

# 3. Simple addition
def add(a, b):
    return a + b

# 4. A function that takes another function as an argument
def apply_operation(func, x, y):
    return func(x, y)

# 5. Math wrapper using logic nesting
def complex_math(n):
    # 6. Local function inside complex_math
    def is_even(num):
        return num % 2 == 0
    
    if is_even(n):
        return n * 2
    return n * 3

# 7. Function to process a list (using a lambda/nested logic)
def process_data(data):
    # 8. Another nested function for transformation
    def transform(val):
        return val + 10
    
    return [transform(x) for x in data]

# 9. Master demo function to tie it all together
def run_all_demos():
    print("--- Python Function Nesting Demo ---")
    
    # Using the power_factory (Closure)
    square = power_factory(2)
    cube = power_factory(3)
    print(f"Square of 5: {square(5)}")
    print(f"Cube of 3: {cube(3)}")
    
    # Using function as an argument
    sum_result = apply_operation(add, 10, 20)
    print(f"Sum result via apply_operation: {sum_result}")
    
    # Using logic nesting
    print(f"Complex math (even 4): {complex_math(4)}")
    print(f"Complex math (odd 5): {complex_math(5)}")
    
    # Processing lists
    my_nums = [1, 2, 3]
    print(f"Processed List: {process_data(my_nums)}")

# 10. Entry point
if __name__ == "__main__":
    run_all_demos()