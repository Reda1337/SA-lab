# Week 1: Functional programming
## Study Context
**Phase:** Architectural Foundations  
**Focus Area:** Functional Design
**Book/Source:** Grokking Simplicity: Taming Complex Software with Functional Thinking
**Chapters Covered:** 1 -> 7


## Key Concepts Learned

### General takeaway

Software complexity largely arises because of when and how many times things happen
(i.e., time and repetition) rather than what happens. Functional programming helps
manage complexity by minimizing the impact of time and repetition on our code.

### 1. Types of implementations

Every functional enjoyer should look for these three important aspects in code implementations:
 - Actions
 - Calculations
 - Data

1.1 Actions

What do we mean by actions? Well, they are anything that gets affected by or affects something outside
their scope. They depend on the timeline — each time you use an action its value or side effect
may be different from before. For example:

```js
sendEmail(to, from, subject, body)
getCurrentTime()
```

Actions spread. If you use an action inside a "normal" function then that function becomes an
action. And if you call that function inside another function, that one becomes an action too.

Ps: by "normal function" I mean calculation — we'll talk about it in the next point.

1.2 Calculations

Calculations are computations from inputs to outputs. In other words, a function that has inputs
and returns outputs — but the catch is it always returns the same output for the same inputs.
For example:

```js
sum(1, 2)
calculateTax(priceItems)
```

Ps: In some places calculations are called pure functions.

1.3 Data

Data is facts about events. We record facts immutably since the facts don’t change.

### 2. Healthy flow of a functional implementation

  ACTIONS -> CALCULATIONS -> DATA

We need to always limit how dependent on time an action is. Functional programming gives
techniques to minimize action usage and control how actions interact with the rest of the code.

The more you rely on calculations and data, the more testable, predictable, and easy-to-work-with
your code becomes.

### 3. Different types of how info enters or leaves a function

Within a single function there are two ways for data to be used (inputs) and two ways to return data
(outputs). How you pass or return data plays a big role in making that function an action or a calculation.

 - Explicit inputs: Arguments — the ones you pass to the function.

   Example:
   ```js
   function sum(a, b) { return a + b; } // a and b are explicit inputs
   ```

 - Implicit inputs: Any input you use but never passed as an argument (like a global variable).

   Example:
   ```js
   var total_sum; // implicit input
   function addToTotal(a) { // explicit input
     total_sum += a;
   }
   ```

 - Explicit outputs: Return values — anything you explicitly return from the function.

   Example:
   ```js
   function sum(a, b) { return a + b; } // returns explicit output
   ```

 - Implicit outputs: Any other output that wasn't returned explicitly but was modified globally.

   Example:
   ```js
   var total_sum;
   function addToTotal(a) {
     // implicit output: modifies total_sum but doesn't return it
     total_sum += a;
   }
   ```

Functional programmers call implicit inputs and outputs "side effects" — they aren't part of the
main purpose of the function (which is to calculate and return a value).

### 4. Steps to extract a calculation from an action

To extract a calculation, a general process is:

1. Identify the calculation code inside an action and refactor it into a new function. Then call that
   function where appropriate.
2. Identify the implicit inputs and outputs inside the refactored function.
3. Convert implicit inputs into arguments and implicit outputs into return values.

Ps: To make return values explicit there are many techniques like "COPY ON WRITE" — we'll see it in
the next concept.

### 5. Different methods to handle implicit outputs

There are different ways to handle implicit outputs and make them explicit. One common method is:

COPY ON WRITE — copy the mutable value before modifying it. This helps implement immutability and
ensures the function won't cause side effects outside its scope.

Example:

------ BEFORE COPY ON WRITE --------

```js
function addItemToCart(name, price) {
  add_item(shopping_cart, name, price);
}

function add_item(cart, name, price) {
  // this modifies shopping_cart directly (implicit output)
  cart.push({ name: name, price: price });
}
```

------ AFTER COPY ON WRITE --------

```js
function addItemToCart(name, price) {
  shopping_cart = add_item(shopping_cart, name, price); // assign returned value
}

function add_item(cart, name, price) {
  // make a shallow copy and modify the copy
  var new_cart = cart.slice();
  new_cart.push({ name: name, price: price });
  return new_cart; // return copy
}
```

### 6. Better design in functional programming

 - Even for actions we use the concept of minimizing implicit inputs and outputs. If you can’t
   eliminate all implicit I/O, the more you remove the better.
 - Design is about pulling things apart. We’re often tempted to put things together, but that makes
   code bigger, harder to test, and harder to reuse. Small functions are easier to test, maintain,
   and compose.

### 7. Concerns of making multiple copies to keep immutability

Making copies of data structures to preserve immutability may seem costly in terms of performance
and memory. But modern techniques like structural sharing and persistent data structures let us
avoid full copies most of the time.

Also, garbage collectors are fast and optimized — in many cases you won't notice a significant
performance hit from copying data.

Structural sharing is where new versions of data structures share parts of the old versions that
haven’t changed. If you have a large list and add an item, the new list can share most of its
structure with the old one. When data is immutable, structural sharing is safe.

### 8. Concerns about refactoring untrusted code

Using or modifying code you don't trust is a concern — what if it mutates your data or causes
unexpected side effects?

To keep your code safe and immutable, use "Defensive Copying". It's the best simple solution when
interacting with untrusted code.

Rules:

 - Rule 1 — Copy as data leaves your code:
   1. Make a deep copy of the immutable data.
   2. Pass the copy to the untrusted code.

 - Rule 2 — Copy as data enters your code:
   1. Immediately make a deep copy of mutable data passed into your code.
   2. Use the copy inside your code.

It sounds simple — and that's literally all you need to interact with code you can't trust with
your data immutability.

Ps: Deep copies are certainly more expensive than shallow copies, so use them cautiously.

## Personal Reflections

Because this is the first time I read about functional programming, I realized how these concepts
align with React and how React is built around functional programming principles:

 - React components are pure functions that take props as inputs and return JSX as outputs.
 - State management in React often involves immutable data structures, which aligns with
   functional programming principles.
 - React's emphasis on declarative programming means describing what the UI should look like
   based on the current state rather than how to change it over time. This declarative approach
   is a key aspect of functional programming.
 - Composition is fundamental in both functional programming and React. Components can be
   composed together to create complex UIs from simpler building blocks.

### Summary
 - Functions that have implicit inputs or outputs are considered actions.
 - Shared variables are a form of implicit inputs.
 - Implicit inputs can be replaced by arguments.
 - Implicit outputs can be replaced by return values.
 - Design is about untangling the threads that make the mess and splitting them into parts that
   can be composed to solve the problem.
 - The more functions follow single responsibility, the easier they are to reuse.
 - Copy on write ensures our data stays immutable — modify the copy instead of the original.
 - Shallow copy: copy only the top-level structure in nested data.
 - Structural sharing: nested data structures reference the same inner data when unchanged.
 - Defensive copying: make deep copies when data leaves or enters your trusted code.
 - Defensive copying requires deep copies and can be expensive — keep that in mind.




