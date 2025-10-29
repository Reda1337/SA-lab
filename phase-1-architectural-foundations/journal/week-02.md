# Week 2: Functional programming
## 1. Study Context - What I learned

**Phase:** Architectural Foundations 

**Focus Area:** Functional Design

**Book/Source:** Grokking Simplicity: Taming Complex Software with Functional Thinking

**Chapters Covered:** 8–15

## Key Concepts Learned

### General takeaway

How can we structure our programs to better manage complexity? By separating
actions, calculations, and data, we can create clearer boundaries in our code. This
separation helps us reason about our programs, test them more effectively, and reduce
unintended side effects.

### 1. Stratified design

Stratified design is a technique that helps manage complexity by organizing code into layers.
Each layer has functions that operate at a similar level of abstraction.
Ex: Business rules layer -> Object manipulation layer -> JavaScript built-in layer.

In general: Stratified design is a design technique that builds software in layers.

For example, this function mixes different levels of abstraction:
  - Checking for items in the cart (business logic)
  - Creating a new item (object manipulation)
  - Looping through an array (JavaScript built-in)

```js
function freeTieClip(cart) {
  var hasTie = false
  var hasTieClip = false;
  for(var i = 0; i < cart.length; i++) {
    var item = cart[i];
    if(item.name === "tie")
      hasTie = true;
    if(item.name === "tie clip")
      hasTieClip = true;
  }
  if(hasTie && !hasTieClip) {
    var tieClip = make_item("tie clip", 0);
    return add_item(cart, tieClip);
  }
  return cart;
}
```

The code is full of
details that aren’t relevant at this level of thinking. Why should marketing campaigns have to
know that the shopping cart is an array?

A better approach is to separate these concerns into different functions that each operate
at a single level of abstraction.

```js
function freeTieClip(cart) {
  var hasTie = isInCart(cart, "tie");
  var hasTieClip = isInCart(cart, "tie clip");
  if(hasTie && !hasTieClip) {
    var tieClip = make_item("tie clip", 0);
    return add_item(cart, tieClip);
  }
  return cart;
} 
```
Now the `freeTieClip` function is easier to read and understand because it focuses on the
business logic without being cluttered by low-level details. Do you have to know that
it’s an array? No, you just need to know that `isInCart` checks for the presence of an item.

### 2. Patterns of stratified design

2.1 Straightforward implementation:

Following stratified design means being straightforward about your functions. Your function should
exactly express what it does without mixing different levels of abstraction. What this means is that
your function should operate at a single level of abstraction and too much details only means that
your code SMELLS.

2.2 Abstraction barrier:

The idea here is to create a barrier between high level implementation details and low level
implementation details. This barrier helps to keep the high level code clean and focused on the
business logic. It also helps us freeing our mind from low level details when working on high level
logic.

Functional programmers use abstraction barriers because they help us think at a higher level. For example, the marketing team can design promotions without worrying about how the cart is implemented (arrays or loops), and developers can change implementations without affecting high-level logic.

2.3 Minimal interface:

The minimal interface pattern states that we should prefer to write new features at higher levels rather
than adding to or modifying lower levels. Applying this pattern in practice means that if you can
implement a function above a layer, using existing functions in that layer, you should. And, also ideally,
the functions should not have to change, nor should you need to add functions later. The set should be
complete, minimal, and timeless.

2.4 Comfortable layers

The patterns and practices of stratified design should serve our needs as programmers, who are in
turn serving the business. We don’t want to create layers that are uncomfortable to work with.
If a layer feels awkward or difficult to use, it’s a sign that we need to rethink its design.
There is constant tension between design and the need for new features. Let comfort guide you on
when to stop.

### 3. Levels of abstraction — common ideas

  - The longer the path from the top high level to a function at the bottom, the more expensive 
  that function will be to change.
  - Testing code at the bottom is more important because it affects more code above it.
  - Code at the bottom is more likely to be reused.

### Summary
  - Stratified design helps us organize code into layers of abstraction.
  - The name tells us the intent of the function. We can group it with other functions with
  related intents.
  - The interfaces for important business concepts should not grow or change once they have matured.

## 2. Mini Project - Applying What I Learned in the chapters after Stratified Design

### What I built

I implemented a task scheduler in the functional-version folder and added unit tests.

- purpose: a small, functional task scheduler that manages tasks by priority and due date using pure, composable functions.
- structure:
  - scheduler core: pure functions to add, remove, update, and retrieve scheduled tasks.
  - domain helpers: small utilities for comparing dates, merging updates, and immutably updating the task list.
  - tests: unit tests that validate scheduling behavior, priority sorting, and edge cases (e.g., overdue tasks, recurring tasks).
- highlights:
  - stratified design: high-level scheduler functions compose lower-level helpers without leaking implementation details.
  - immutable updates and predictable, testable behavior.
  - clear tests that exercise both the scheduler core and the domain helpers.
