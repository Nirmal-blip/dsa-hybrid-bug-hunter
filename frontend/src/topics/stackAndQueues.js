export const STACK_AND_QUEUES_TOPIC = {
    topic: "Stack and Queues",
    problems: [
      // ===================== IMPLEMENTATION =====================
      {
        id: "sq-stack-array",
        number: 1,
        section: "Implementation",
        title: "Implement Stack using Arrays",
        difficulty: "Basic",
        bugType: "Top Pointer Off-by-One / Empty Underflow",
        problem:
          "Implement Stack using Arrays: Process Q operations on a stack ('push x', 'pop', 'top', 'empty'). Print result for 'pop' (-1 if empty), 'top' (-1 if empty), and 'empty' ('true'/'false').",
        testCases: [
          { input: "5\npush 10\npush 20\ntop\npop\ntop", expectedOutput: "20\n20\n10" },
        ],
        starterCode: `class ArrayStack {
  public:
      void push(int x) {
          // Write your code here
      }
      int pop() {
          // Write your code here
      }
      int top() {
          // Write your code here
      }
      bool empty() {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      ArrayStack st;
      while (q--) {
          string op;
          cin >> op;
          if (op == "push") {
              int x; cin >> x;
              st.push(x);
          } else if (op == "pop") {
              cout << st.pop() << "\\n";
          } else if (op == "top") {
              cout << st.top() << "\\n";
          } else if (op == "empty") {
              cout << (st.empty() ? "true" : "false") << "\\n";
          }
      }
      return 0;
  }`,
        code: `class ArrayStack {
      vector<int> arr;
  public:
      void push(int x) { arr.push_back(x); }
      int pop() {
          // Logical Bug: Does not check empty() before back() / pop_back()
          int v = arr.back();
          arr.pop_back();
          return v;
      }
      int top() { return arr.empty() ? -1 : arr.back(); }
      bool empty() { return arr.empty(); }
  };`,
      },
      {
        id: "sq-queue-array",
        number: 2,
        section: "Implementation",
        title: "Implement Queue using Arrays",
        difficulty: "Basic",
        bugType: "Linear Front Index Drift / Underflow",
        problem:
          "Implement Queue using Arrays: Process Q operations ('push x', 'pop', 'front', 'empty'). Return -1 on 'pop' or 'front' if empty, and 'true'/'false' on 'empty'.",
        testCases: [
          { input: "5\npush 5\npush 15\nfront\npop\nfront", expectedOutput: "5\n5\n15" },
        ],
        starterCode: `class ArrayQueue {
  public:
      void push(int x) {
          // Write your code here
      }
      int pop() {
          // Write your code here
      }
      int front() {
          // Write your code here
      }
      bool empty() {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      ArrayQueue qu;
      while (q--) {
          string op;
          cin >> op;
          if (op == "push") {
              int x; cin >> x;
              qu.push(x);
          } else if (op == "pop") {
              cout << qu.pop() << "\\n";
          } else if (op == "front") {
              cout << qu.front() << "\\n";
          } else if (op == "empty") {
              cout << (qu.empty() ? "true" : "false") << "\\n";
          }
      }
      return 0;
  }`,
        code: `class ArrayQueue {
      vector<int> data;
      int head = 0;
  public:
      void push(int x) { data.push_back(x); }
      int pop() {
          if (empty()) return -1;
          // Logical Bug: Uses 'head++ < data.size()' instead of 'head >= data.size()' for empty()
          return data[head++];
      }
      int front() { return empty() ? -1 : data[head]; }
      bool empty() { return head > (int)data.size(); }
  };`,
      },
      {
        id: "sq-stack-ll",
        number: 3,
        section: "Implementation",
        title: "Implement Stack using Linked List",
        difficulty: "Basic",
        bugType: "Head Pointer Not Updated on Pop",
        problem:
          "Implement Stack using Linked List: Support 'push x', 'pop', 'top', and 'empty' over Q queries.",
        testCases: [
          { input: "4\npush 1\npush 2\npop\ntop", expectedOutput: "2\n1" },
        ],
        starterCode: `class LLStack {
  public:
      void push(int x) {}
      int pop() { return -1; }
      int top() { return -1; }
      bool empty() { return true; }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      LLStack st;
      while (q--) {
          string op; cin >> op;
          if (op == "push") { int x; cin >> x; st.push(x); }
          else if (op == "pop") cout << st.pop() << "\\n";
          else if (op == "top") cout << st.top() << "\\n";
          else if (op == "empty") cout << (st.empty() ? "true" : "false") << "\\n";
      }
      return 0;
  }`,
        code: `class LLStack {
      struct Node { int val; Node* next; Node(int v, Node* n): val(v), next(n) {} };
      Node* head = nullptr;
  public:
      void push(int x) { head = new Node(x, head); }
      int pop() {
          if (!head) return -1;
          int val = head->val;
          // Logical Bug: Forgot to advance head = head->next
          return val;
      }
      int top() { return head ? head->val : -1; }
      bool empty() { return head == nullptr; }
  };`,
      },
      {
        id: "sq-queue-ll",
        number: 4,
        section: "Implementation",
        title: "Implement Queue using Linked List",
        difficulty: "Basic",
        bugType: "Tail Pointer Not Reset When Queue Becomes Empty",
        problem:
          "Implement Queue using Linked List: Support 'push x', 'pop', 'front', and 'empty' over Q queries.",
        testCases: [
          { input: "5\npush 7\npop\npush 9\nfront\nempty", expectedOutput: "7\n9\nfalse" },
        ],
        starterCode: `class LLQueue {
  public:
      void push(int x) {}
      int pop() { return -1; }
      int front() { return -1; }
      bool empty() { return true; }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      LLQueue qu;
      while (q--) {
          string op; cin >> op;
          if (op == "push") { int x; cin >> x; qu.push(x); }
          else if (op == "pop") cout << qu.pop() << "\\n";
          else if (op == "front") cout << qu.front() << "\\n";
          else if (op == "empty") cout << (qu.empty() ? "true" : "false") << "\\n";
      }
      return 0;
  }`,
        code: `class LLQueue {
      struct Node { int val; Node* next; Node(int v): val(v), next(nullptr) {} };
      Node* head = nullptr;
      Node* tail = nullptr;
  public:
      void push(int x) {
          Node* n = new Node(x);
          if (!tail) { head = tail = n; }
          else { tail->next = n; tail = n; }
      }
      int pop() {
          if (!head) return -1;
          int val = head->val;
          head = head->next;
          // Logical Bug: When head becomes nullptr, tail still points to the old popped node
          return val;
      }
      int front() { return head ? head->val : -1; }
      bool empty() { return head == nullptr; }
  };`,
      },
      {
        id: "sq-queue-using-stack",
        number: 5,
        section: "Implementation",
        title: "Implement Queue using Stack",
        difficulty: "Core",
        bugType: "Transferring Out-Stack Before It Empties",
        problem:
          "Implement Queue using Stack: Implement FIFO queue operations ('push x', 'pop', 'front', 'empty') using LIFO stacks.",
        testCases: [
          { input: "5\npush 1\npush 2\nfront\npop\nfront", expectedOutput: "1\n1\n2" },
        ],
        starterCode: `class MyQueue {
  public:
      void push(int x) {}
      int pop() { return -1; }
      int peek() { return -1; }
      bool empty() { return true; }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      MyQueue mq;
      while (q--) {
          string op; cin >> op;
          if (op == "push") { int x; cin >> x; mq.push(x); }
          else if (op == "pop") cout << mq.pop() << "\\n";
          else if (op == "front") cout << mq.peek() << "\\n";
          else if (op == "empty") cout << (mq.empty() ? "true" : "false") << "\\n";
      }
      return 0;
  }`,
        code: `class MyQueue {
      stack<int> inSt, outSt;
      void shift() {
          // Logical Bug: Refills outSt even when outSt is non-empty, reversing FIFO order
          while (!inSt.empty()) { outSt.push(inSt.top()); inSt.pop(); }
      }
  public:
      void push(int x) { inSt.push(x); }
      int pop() {
          if (empty()) return -1;
          shift();
          int v = outSt.top(); outSt.pop();
          return v;
      }
      int peek() {
          if (empty()) return -1;
          shift();
          return outSt.top();
      }
      bool empty() { return inSt.empty() && outSt.empty(); }
  };`,
      },
      {
        id: "sq-stack-using-queue",
        number: 6,
        section: "Implementation",
        title: "Implement Stack using Queue",
        difficulty: "Core",
        bugType: "Rotation Count Off-by-One on Push",
        problem:
          "Implement Stack using Queue: Implement LIFO stack operations ('push x', 'pop', 'top', 'empty') using queues.",
        testCases: [
          { input: "5\npush 3\npush 8\ntop\npop\ntop", expectedOutput: "8\n8\n3" },
        ],
        starterCode: `class MyStack {
  public:
      void push(int x) {}
      int pop() { return -1; }
      int top() { return -1; }
      bool empty() { return true; }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      MyStack ms;
      while (q--) {
          string op; cin >> op;
          if (op == "push") { int x; cin >> x; ms.push(x); }
          else if (op == "pop") cout << ms.pop() << "\\n";
          else if (op == "top") cout << ms.top() << "\\n";
          else if (op == "empty") cout << (ms.empty() ? "true" : "false") << "\\n";
      }
      return 0;
  }`,
        code: `class MyStack {
      queue<int> qu;
  public:
      void push(int x) {
          qu.push(x);
          int sz = (int)qu.size();
          // Logical Bug: Rotates 'sz' times instead of 'sz - 1', leaving 'x' back at the front
          for (int i = 0; i < sz; i++) {
              qu.push(qu.front());
              qu.pop();
          }
      }
      int pop() {
          if (qu.empty()) return -1;
          int v = qu.front(); qu.pop();
          return v;
      }
      int top() { return qu.empty() ? -1 : qu.front(); }
      bool empty() { return qu.empty(); }
  };`,
      },
      {
        id: "sq-balanced-parentheses",
        number: 7,
        section: "Implementation",
        title: "Check for Balanced Parentheses",
        difficulty: "Basic",
        bugType: "Unmatched Opening Brackets Left on Stack",
        problem:
          "Balanced Parentheses: Given a string s containing '(', ')', '{', '}', '[', ']', print 'true' if valid and balanced, else 'false'.",
        testCases: [{ input: "()[]{}", expectedOutput: "true" }],
        starterCode: `class Solution {
  public:
      bool isValid(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << (Solution().isValid(s) ? "true" : "false") << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      bool isValid(string s) {
          stack<char> st;
          for (char c : s) {
              if (c == '(' || c == '{' || c == '[') st.push(c);
              else {
                  if (st.empty()) return false;
                  char t = st.top(); st.pop();
                  if ((c == ')' && t != '(') || (c == '}' && t != '{') || (c == ']' && t != '['))
                      return false;
              }
          }
          // Logical Bug: Ignores leftover opening brackets in stack
          return true;
      }
  };`,
      },
      {
        id: "sq-implement-deque",
        number: 8,
        section: "Implementation",
        title: "Implement Deque",
        difficulty: "Core",
        bugType: "Empty Pop Front/Back Guard Missing",
        problem:
          "Implement Deque: Support 'push_front x', 'push_back x', 'pop_front', 'pop_back', 'front', 'back'. Return -1 if popping/reading empty.",
        testCases: [
          { input: "5\npush_back 10\npush_front 20\nfront\nback\npop_back", expectedOutput: "20\n10\n10" },
        ],
        starterCode: `class Deque {
  public:
      void pushFront(int x) {}
      void pushBack(int x) {}
      int popFront() { return -1; }
      int popBack() { return -1; }
      int front() { return -1; }
      int back() { return -1; }
  };`,
        driverCode: `int main() {
      int q;
      if (!(cin >> q)) return 0;
      Deque dq;
      while (q--) {
          string op; cin >> op;
          if (op == "push_front") { int x; cin >> x; dq.pushFront(x); }
          else if (op == "push_back") { int x; cin >> x; dq.pushBack(x); }
          else if (op == "pop_front") cout << dq.popFront() << "\\n";
          else if (op == "pop_back") cout << dq.popBack() << "\\n";
          else if (op == "front") cout << dq.front() << "\\n";
          else if (op == "back") cout << dq.back() << "\\n";
      }
      return 0;
  }`,
        code: `class Deque {
      deque<int> d;
  public:
      void pushFront(int x) { d.push_front(x); }
      void pushBack(int x) { d.push_back(x); }
      int popFront() {
          // Logical Bug: Does not check empty before pop_front
          int v = d.front(); d.pop_front(); return v;
      }
      int popBack() {
          if (d.empty()) return -1;
          int v = d.back(); d.pop_back(); return v;
      }
      int front() { return d.empty() ? -1 : d.front(); }
      int back() { return d.empty() ? -1 : d.back(); }
  };`,
      },
  
      // ===================== CONVERSIONS =====================
      {
        id: "sq-infix-to-postfix",
        number: 9,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Infix to Postfix Conversion",
        difficulty: "Core",
        bugType: "Operator Precedence / Associativity Bug",
        problem:
          "Infix to Postfix Conversion: Convert a valid infix expression (single-letter operands, +, -, *, /, ^, parentheses) to postfix.",
        testCases: [{ input: "a+b*(c^d-e)^(f+g*h)-i", expectedOutput: "abcd^e-fgh*+^*+i-" }],
        starterCode: `class Solution {
  public:
      string infixToPostfix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().infixToPostfix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
      int prec(char c) {
          if (c == '^') return 3;
          if (c == '*' || c == '/') return 2;
          if (c == '+' || c == '-') return 1;
          return -1;
      }
  public:
      string infixToPostfix(string s) {
          stack<char> st;
          string out;
          for (char c : s) {
              if (isalnum((unsigned char)c)) out += c;
              else if (c == '(') st.push(c);
              else if (c == ')') {
                  while (!st.empty() && st.top() != '(') { out += st.top(); st.pop(); }
                  if (!st.empty()) st.pop();
              } else {
                  // Logical Bug: Pops '^' even when incoming is also '^' (right-associative)
                  while (!st.empty() && prec(st.top()) >= prec(c)) {
                      out += st.top(); st.pop();
                  }
                  st.push(c);
              }
          }
          while (!st.empty()) { out += st.top(); st.pop(); }
          return out;
      }
  };`,
      },
      {
        id: "sq-infix-to-prefix",
        number: 10,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Infix to Prefix Conversion",
        difficulty: "Core",
        bugType: "Parenthesis Flip Missing After Reverse",
        problem:
          "Infix to Prefix Conversion: Convert a valid infix expression to prefix notation.",
        testCases: [{ input: "(A-B/C)*(A/K-L)", expectedOutput: "*-A/BC-/AKL" }],
        starterCode: `class Solution {
  public:
      string infixToPrefix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().infixToPrefix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
      int prec(char c) {
          if (c == '^') return 3;
          if (c == '*' || c == '/') return 2;
          if (c == '+' || c == '-') return 1;
          return -1;
      }
  public:
      string infixToPrefix(string s) {
          reverse(s.begin(), s.end());
          // Logical Bug: Forgot to swap '(' with ')' and ')' with '(' after reversing
          stack<char> st;
          string res;
          for (char c : s) {
              if (isalnum((unsigned char)c)) res += c;
              else if (c == '(') st.push(c);
              else if (c == ')') {
                  while (!st.empty() && st.top() != '(') { res += st.top(); st.pop(); }
                  if (!st.empty()) st.pop();
              } else {
                  while (!st.empty() && prec(st.top()) > prec(c)) { res += st.top(); st.pop(); }
                  st.push(c);
              }
          }
          while (!st.empty()) { res += st.top(); st.pop(); }
          reverse(res.begin(), res.end());
          return res;
      }
  };`,
      },
      {
        id: "sq-prefix-to-infix",
        number: 11,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Prefix to Infix Conversion",
        difficulty: "Core",
        bugType: "Operand Pop Order Reversed",
        problem:
          "Prefix to Infix Conversion: Convert a prefix expression into a parenthesized infix expression.",
        testCases: [{ input: "*-A/BC-/AKL", expectedOutput: "((A-(B/C))*((A/K)-L))" }],
        starterCode: `class Solution {
  public:
      string prefixToInfix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().prefixToInfix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      string prefixToInfix(string s) {
          stack<string> st;
          for (int i = (int)s.size() - 1; i >= 0; i--) {
              char c = s[i];
              if (isalnum((unsigned char)c)) st.push(string(1, c));
              else {
                  string op1 = st.top(); st.pop();
                  string op2 = st.top(); st.pop();
                  // Logical Bug: Swapped op1 and op2 order
                  st.push("(" + op2 + c + op1 + ")");
              }
          }
          return st.top();
      }
  };`,
      },
      {
        id: "sq-prefix-to-postfix",
        number: 12,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Prefix to Postfix Conversion",
        difficulty: "Core",
        bugType: "Operator Appended Before Second Operand",
        problem:
          "Prefix to Postfix Conversion: Convert a prefix expression into postfix notation.",
        testCases: [{ input: "*-A/BC-/AKL", expectedOutput: "ABC/-AK/L-*" }],
        starterCode: `class Solution {
  public:
      string prefixToPostfix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().prefixToPostfix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      string prefixToPostfix(string s) {
          stack<string> st;
          for (int i = (int)s.size() - 1; i >= 0; i--) {
              char c = s[i];
              if (isalnum((unsigned char)c)) st.push(string(1, c));
              else {
                  string t1 = st.top(); st.pop();
                  string t2 = st.top(); st.pop();
                  // Logical Bug: Places operator 'c' before 't2'
                  st.push(t1 + c + t2);
              }
          }
          return st.top();
      }
  };`,
      },
      {
        id: "sq-postfix-to-infix",
        number: 13,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Postfix to Infix Conversion",
        difficulty: "Core",
        bugType: "First Popped Operand Placed on Right",
        problem:
          "Postfix to Infix Conversion: Convert a postfix expression into a parenthesized infix expression.",
        testCases: [{ input: "ab*c+", expectedOutput: "((a*b)+c)" }],
        starterCode: `class Solution {
  public:
      string postfixToInfix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().postfixToInfix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      string postfixToInfix(string s) {
          stack<string> st;
          for (char c : s) {
              if (isalnum((unsigned char)c)) st.push(string(1, c));
              else {
                  string op2 = st.top(); st.pop();
                  string op1 = st.top(); st.pop();
                  // Logical Bug: Puts op2 first instead of op1
                  st.push("(" + op2 + c + op1 + ")");
              }
          }
          return st.top();
      }
  };`,
      },
      {
        id: "sq-postfix-to-prefix",
        number: 14,
        section: "Prefix, Infix and Postfix Conversions",
        title: "Postfix to Prefix Conversion",
        difficulty: "Core",
        bugType: "Operand Concatenation Order Bug",
        problem:
          "Postfix to Prefix Conversion: Convert a postfix expression into prefix notation.",
        testCases: [{ input: "ABC/-AK/L-*", expectedOutput: "*-A/BC-/AKL" }],
        starterCode: `class Solution {
  public:
      string postfixToPrefix(string s) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string s;
      if (!(cin >> s)) return 0;
      cout << Solution().postfixToPrefix(s) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      string postfixToPrefix(string s) {
          stack<string> st;
          for (char c : s) {
              if (isalnum((unsigned char)c)) st.push(string(1, c));
              else {
                  string t2 = st.top(); st.pop();
                  string t1 = st.top(); st.pop();
                  // Logical Bug: Uses t2 + t1 instead of t1 + t2
                  st.push(string(1, c) + t2 + t1);
              }
          }
          return st.top();
      }
  };`,
      },
  
      // ===================== MONOTONIC STACK =====================
      {
        id: "sq-nge-1",
        number: 15,
        section: "Monotonic Stack",
        title: "Next Greater Element",
        difficulty: "Core",
        bugType: "Strict vs Non-Strict Stack Pop Condition",
        problem:
          "Next Greater Element: Given an array of N integers, find for each element the first greater element to its right, or -1 if none exists.",
        testCases: [{ input: "4\n4 5 2 25", expectedOutput: "5 25 25 -1" }],
        starterCode: `class Solution {
  public:
      vector<int> nextGreater(vector<int>& nums) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().nextGreater(a);
      for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> nextGreater(vector<int>& nums) {
          int n = nums.size();
          vector<int> ans(n, -1);
          stack<int> st;
          for (int i = n - 1; i >= 0; i--) {
              // Logical Bug: '<' instead of '<=' keeps equal elements and misses next strictly greater
              while (!st.empty() && st.top() < nums[i]) st.pop();
              if (!st.empty()) ans[i] = st.top();
              st.push(nums[i]);
          }
          return ans;
      }
  };`,
      },
      {
        id: "sq-nge-2",
        number: 16,
        section: "Monotonic Stack",
        title: "Next Greater Element - 2",
        difficulty: "Core",
        bugType: "Circular Modulo Index Missing",
        problem:
          "Next Greater Element - 2: Given a circular integer array nums of size N, return the next greater element for every element in circular order, or -1 if none exists.",
        testCases: [{ input: "3\n1 2 1", expectedOutput: "2 -1 2" }],
        starterCode: `class Solution {
  public:
      vector<int> nextGreaterElements(vector<int>& nums) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().nextGreaterElements(a);
      for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> nextGreaterElements(vector<int>& nums) {
          int n = nums.size();
          vector<int> ans(n, -1);
          stack<int> st;
          // Logical Bug: Single pass without modulo wrap-around misses circular greater elements
          for (int i = n - 1; i >= 0; i--) {
              while (!st.empty() && st.top() <= nums[i]) st.pop();
              if (!st.empty()) ans[i] = st.top();
              st.push(nums[i]);
          }
          return ans;
      }
  };`,
      },
      {
        id: "sq-asteroid-collision",
        number: 17,
        section: "Monotonic Stack",
        title: "Asteroid Collision",
        difficulty: "Core",
        bugType: "Equal Magnitude Collision Not Popping Both",
        problem:
          "Asteroid Collision: Given integer array asteroids (sign = direction, abs = size), return surviving asteroids after all collisions.",
        testCases: [{ input: "3\n5 10 -5", expectedOutput: "5 10" }],
        starterCode: `class Solution {
  public:
      vector<int> asteroidCollision(vector<int>& asteroids) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().asteroidCollision(a);
      for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 == res.size() ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> asteroidCollision(vector<int>& asteroids) {
          vector<int> st;
          for (int x : asteroids) {
              bool alive = true;
              while (!st.empty() && st.back() > 0 && x < 0) {
                  if (st.back() < -x) { st.pop_back(); }
                  else if (st.back() == -x) {
                      // Logical Bug: Only pops st.back() and forgets to destroy incoming 'x'
                      st.pop_back();
                      break;
                  } else { alive = false; break; }
              }
              if (alive) st.push_back(x);
          }
          return st;
      }
  };`,
      },
      {
        id: "sq-sum-subarray-minimums",
        number: 18,
        section: "Monotonic Stack",
        title: "Sum of Subarray Minimums",
        difficulty: "Core",
        bugType: "Double-Counting Equal Elements on Both Sides",
        problem:
          "Sum of Subarray Minimums: Given an array of N integers, return the sum of min(b) over every contiguous subarray b, modulo 10^9 + 7.",
        testCases: [{ input: "4\n3 1 2 4", expectedOutput: "17" }],
        starterCode: `class Solution {
  public:
      int sumSubarrayMins(vector<int>& arr) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().sumSubarrayMins(a) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int sumSubarrayMins(vector<int>& arr) {
          const long long MOD = 1e9 + 7;
          int n = arr.size();
          vector<int> left(n), right(n);
          stack<int> st;
          for (int i = 0; i < n; i++) {
              // Logical Bug: Uses '>=' on both left and right, double counting duplicate minimums
              while (!st.empty() && arr[st.top()] >= arr[i]) st.pop();
              left[i] = st.empty() ? i + 1 : i - st.top();
              st.push(i);
          }
          while (!st.empty()) st.pop();
          for (int i = n - 1; i >= 0; i--) {
              while (!st.empty() && arr[st.top()] >= arr[i]) st.pop();
              right[i] = st.empty() ? n - i : st.top() - i;
              st.push(i);
          }
          long long ans = 0;
          for (int i = 0; i < n; i++) ans = (ans + 1LL * arr[i] * left[i] * right[i]) % MOD;
          return (int)ans;
      }
  };`,
      },
      {
        id: "sq-sum-subarray-ranges",
        number: 19,
        section: "Monotonic Stack",
        title: "Sum of Subarray Ranges",
        difficulty: "Core",
        bugType: "32-Bit Signed Overflow in Range Sum",
        problem:
          "Sum of Subarray Ranges: Given an integer array nums of size N, return the sum of (max(subarray) - min(subarray)) over all non-empty subarrays.",
        testCases: [{ input: "3\n1 2 3", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      long long subArrayRanges(vector<int>& nums) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().subArrayRanges(a) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      long long subArrayRanges(vector<int>& nums) {
          int n = nums.size();
          // Logical Bug: 32-bit int accumulator overflows for larger arrays/values
          int total = 0;
          for (int i = 0; i < n; i++) {
              int mn = nums[i], mx = nums[i];
              for (int j = i; j < n; j++) {
                  mn = min(mn, nums[j]);
                  mx = max(mx, nums[j]);
                  total += (mx - mn);
              }
          }
          return total;
      }
  };`,
      },
      {
        id: "sq-remove-k-digits",
        number: 20,
        section: "Monotonic Stack",
        title: "Remove K Digits",
        difficulty: "Core",
        bugType: "Leading Zeros Not Stripped / Remaining K Not Popped",
        problem:
          "Remove K Digits: Given string num representing a non-negative integer and integer k, remove k digits to make the smallest possible number (no leading zeros, or '0' if empty).",
        testCases: [{ input: "1432219 3", expectedOutput: "1219" }],
        starterCode: `class Solution {
  public:
      string removeKdigits(string num, int k) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      string num; int k;
      if (!(cin >> num >> k)) return 0;
      cout << Solution().removeKdigits(num, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      string removeKdigits(string num, int k) {
          string st;
          for (char c : num) {
              while (!st.empty() && k > 0 && st.back() > c) { st.pop_back(); k--; }
              st.push_back(c);
          }
          // Logical Bug: Does not trim remaining k digits from end or strip leading zeros
          return st.empty() ? "0" : st;
      }
  };`,
      },
      {
        id: "sq-next-smaller",
        number: 21,
        section: "Monotonic Stack",
        title: "Next Smaller Element",
        difficulty: "Core",
        bugType: "Reversed Comparison Direction (> Instead of >=)",
        problem:
          "Next Smaller Element: Given an array of N integers, find for each element the first smaller element to its right, or -1 if none exists.",
        testCases: [{ input: "5\n4 8 5 2 25", expectedOutput: "2 5 2 -1 -1" }],
        starterCode: `class Solution {
  public:
      vector<int> nextSmaller(vector<int>& nums) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().nextSmaller(a);
      for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> nextSmaller(vector<int>& nums) {
          int n = nums.size();
          vector<int> ans(n, -1);
          stack<int> st;
          for (int i = n - 1; i >= 0; i--) {
              // Logical Bug: Pops greater elements instead of smaller/equal elements
              while (!st.empty() && st.top() > nums[i]) st.pop();
              if (!st.empty()) ans[i] = st.top();
              st.push(nums[i]);
          }
          return ans;
      }
  };`,
      },
  
      // ===================== FAQS =====================
      {
        id: "sq-min-stack",
        number: 22,
        section: "FAQs",
        title: "Implement Min Stack",
        difficulty: "Core",
        bugType: "Min Stack Not Popped When Minimum Leaves",
        problem:
          "Implement Min Stack: Support 'push x', 'pop', 'top', and 'getMin' in O(1) time per operation.",
        testCases: [
          { input: "6\npush -2\npush 0\npush -3\ngetMin\npop\ngetMin", expectedOutput: "-3\n-2" },
        ],
        starterCode: `class MinStack {
  public:
      void push(int val) {}
      void pop() {}
      int top() { return 0; }
      int getMin() { return 0; }
  };`,
        driverCode: `int main() {
      int q; if (!(cin >> q)) return 0;
      MinStack ms;
      while (q--) {
          string op; cin >> op;
          if (op == "push") { int x; cin >> x; ms.push(x); }
          else if (op == "pop") ms.pop();
          else if (op == "top") cout << ms.top() << "\\n";
          else if (op == "getMin") cout << ms.getMin() << "\\n";
      }
      return 0;
  }`,
        code: `class MinStack {
      stack<int> st, minSt;
  public:
      void push(int val) {
          st.push(val);
          if (minSt.empty() || val <= minSt.top()) minSt.push(val);
      }
      void pop() {
          if (st.empty()) return;
          // Logical Bug: Never pops minSt when st.top() == minSt.top()
          st.pop();
      }
      int top() { return st.top(); }
      int getMin() { return minSt.top(); }
  };`,
      },
      {
        id: "sq-sliding-window-max",
        number: 23,
        section: "FAQs",
        title: "Sliding Window Maximum",
        difficulty: "Pro",
        bugType: "Stale Out-of-Window Indices Not Evicted",
        problem:
          "Sliding Window Maximum: Given array nums of size N and window size K, return the maximum of each sliding window of size K.",
        testCases: [{ input: "8 3\n1 3 -1 -3 5 3 6 7", expectedOutput: "3 3 5 5 6 7" }],
        starterCode: `class Solution {
  public:
      vector<int> maxSlidingWindow(vector<int>& nums, int k) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n, k; if (!(cin >> n >> k)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().maxSlidingWindow(a, k);
      for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 == res.size() ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> maxSlidingWindow(vector<int>& nums, int k) {
          deque<int> dq;
          vector<int> ans;
          for (int i = 0; i < (int)nums.size(); i++) {
              // Logical Bug: Missing front eviction when dq.front() <= i - k
              while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
              dq.push_back(i);
              if (i >= k - 1) ans.push_back(nums[dq.front()]);
          }
          return ans;
      }
  };`,
      },
      {
        id: "sq-trapping-rainwater",
        number: 24,
        section: "FAQs",
        title: "Trapping Rainwater",
        difficulty: "Pro",
        bugType: "Wrong Pointer Moved on Height Comparison",
        problem:
          "Trapping Rainwater: Given N non-negative elevation heights, compute how much water can be trapped after raining.",
        testCases: [{ input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" }],
        starterCode: `class Solution {
  public:
      int trap(vector<int>& height) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> h(n); for (int i = 0; i < n; i++) cin >> h[i];
      cout << Solution().trap(h) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int trap(vector<int>& h) {
          int l = 0, r = (int)h.size() - 1, lMax = 0, rMax = 0, water = 0;
          while (l < r) {
              if (h[l] < h[r]) {
                  lMax = max(lMax, h[l]);
                  water += lMax - h[l];
                  l++;
              } else {
                  rMax = max(rMax, h[r]);
                  water += rMax - h[r];
                  // Logical Bug: Increments l instead of decrementing r
                  l++;
              }
          }
          return water;
      }
  };`,
      },
      {
        id: "sq-largest-rectangle-histogram",
        number: 25,
        section: "FAQs",
        title: "Largest rectangle in a histogram",
        difficulty: "Pro",
        bugType: "Width Calculation Uses Wrong Left Boundary Index",
        problem:
          "Largest Rectangle in Histogram: Given an array of bar heights of size N (width = 1), return the area of the largest rectangle in the histogram.",
        testCases: [{ input: "6\n2 1 5 6 2 3", expectedOutput: "10" }],
        starterCode: `class Solution {
  public:
      int largestRectangleArea(vector<int>& heights) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> h(n); for (int i = 0; i < n; i++) cin >> h[i];
      cout << Solution().largestRectangleArea(h) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int largestRectangleArea(vector<int>& heights) {
          int n = heights.size(), best = 0;
          stack<int> st;
          for (int i = 0; i <= n; i++) {
              int curH = (i == n) ? 0 : heights[i];
              while (!st.empty() && heights[st.top()] >= curH) {
                  int h = heights[st.top()]; st.pop();
                  // Logical Bug: Uses 'i' instead of 'i - (st.empty() ? -1 : st.top()) - 1'
                  int w = st.empty() ? i : i - st.top();
                  best = max(best, h * w);
              }
              st.push(i);
          }
          return best;
      }
  };`,
      },
      {
        id: "sq-maximal-rectangles",
        number: 26,
        section: "FAQs",
        title: "Maximum Rectangles",
        difficulty: "Pro",
        bugType: "Histogram Height Not Reset to Zero on '0'",
        problem:
          "Maximum Rectangles: Given an R x C binary matrix of '0's and '1's, find the largest area of a rectangle containing only '1's.",
        testCases: [
          { input: "4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0", expectedOutput: "6" },
        ],
        starterCode: `class Solution {
  public:
      int maximalRectangle(vector<vector<int>>& matrix) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int r, c; if (!(cin >> r >> c)) return 0;
      vector<vector<int>> m(r, vector<int>(c));
      for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) cin >> m[i][j];
      cout << Solution().maximalRectangle(m) << endl;
      return 0;
  }`,
        code: `class Solution {
      int hist(vector<int>& h) {
          int n = h.size(), res = 0;
          stack<int> st;
          for (int i = 0; i <= n; i++) {
              int ch = (i == n) ? 0 : h[i];
              while (!st.empty() && h[st.top()] >= ch) {
                  int bar = h[st.top()]; st.pop();
                  int w = st.empty() ? i : i - st.top() - 1;
                  res = max(res, bar * w);
              }
              st.push(i);
          }
          return res;
      }
  public:
      int maximalRectangle(vector<vector<int>>& m) {
          if (m.empty() || m[0].empty()) return 0;
          vector<int> h(m[0].size(), 0);
          int ans = 0;
          for (auto& row : m) {
              for (size_t j = 0; j < row.size(); j++) {
                  // Logical Bug: Accumulates even when row[j] == 0
                  h[j] += row[j];
              }
              ans = max(ans, hist(h));
          }
          return ans;
      }
  };`,
      },
      {
        id: "sq-stock-span",
        number: 27,
        section: "FAQs",
        title: "Stock span problem",
        difficulty: "Core",
        bugType: "Span Reset to 0 Instead of 1",
        problem:
          "Stock Span Problem: Given daily stock prices of length N, return the span (consecutive days up to today with price <= today's price) for each day.",
        testCases: [{ input: "7\n100 80 60 70 60 75 85", expectedOutput: "1 1 1 2 1 4 6" }],
        starterCode: `class Solution {
  public:
      vector<int> calculateSpan(vector<int>& price) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> p(n); for (int i = 0; i < n; i++) cin >> p[i];
      auto res = Solution().calculateSpan(p);
      for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> calculateSpan(vector<int>& price) {
          int n = price.size();
          vector<int> ans(n);
          stack<pair<int, int>> st;
          for (int i = 0; i < n; i++) {
              // Logical Bug: Starts span at 0 instead of counting today's day (1)
              int span = 0;
              while (!st.empty() && st.top().first <= price[i]) {
                  span += st.top().second;
                  st.pop();
              }
              st.push({price[i], span});
              ans[i] = span;
          }
          return ans;
      }
  };`,
      },
      {
        id: "sq-celebrity-problem",
        number: 28,
        section: "FAQs",
        title: "Celebrity Problem",
        difficulty: "Core",
        bugType: "Candidate Not Verified Against All Rows/Columns",
        problem:
          "Celebrity Problem: Given an N x N matrix M where M[i][j] == 1 means i knows j, find the celebrity index (known by all N-1 others, knows nobody), or -1 if none exists.",
        testCases: [{ input: "3\n0 1 0\n0 0 0\n0 1 0", expectedOutput: "1" }],
        starterCode: `class Solution {
  public:
      int celebrity(vector<vector<int>>& m) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<vector<int>> m(n, vector<int>(n));
      for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) cin >> m[i][j];
      cout << Solution().celebrity(m) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int celebrity(vector<vector<int>>& m) {
          int n = m.size(), top = 0, down = n - 1;
          while (top < down) {
              if (m[top][down] == 1) top++;
              else if (m[down][top] == 1) down--;
              else { top++; down--; }
          }
          if (top > down) return -1;
          // Logical Bug: Skips verification loop confirming candidate knows nobody and everyone knows candidate
          return top;
      }
  };`,
      },
      {
        id: "sq-lru-cache",
        number: 29,
        section: "FAQs",
        title: "LRU Cache",
        difficulty: "Pro",
        bugType: "Get Operation Does Not Mark Key Recently Used",
        problem:
          "LRU Cache: Given capacity C and Q operations ('get k', 'put k v'), print returned values for 'get' (-1 if missing) under Least Recently Used eviction.",
        testCases: [
          { input: "2 5\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expectedOutput: "1\n-1" },
        ],
        starterCode: `class LRUCache {
  public:
      LRUCache(int capacity) {}
      int get(int key) { return -1; }
      void put(int key, int value) {}
  };`,
        driverCode: `int main() {
      int cap, q; if (!(cin >> cap >> q)) return 0;
      LRUCache cache(cap);
      while (q--) {
          string op; cin >> op;
          if (op == "get") { int k; cin >> k; cout << cache.get(k) << "\\n"; }
          else if (op == "put") { int k, v; cin >> k >> v; cache.put(k, v); }
      }
      return 0;
  }`,
        code: `class LRUCache {
      int cap;
      list<pair<int, int>> dll;
      unordered_map<int, list<pair<int, int>>::iterator> mp;
  public:
      LRUCache(int capacity) : cap(capacity) {}
      int get(int key) {
          auto it = mp.find(key);
          if (it == mp.end()) return -1;
          // Logical Bug: Does not splice accessed node to front of DLL
          return it->second->second;
      }
      void put(int key, int value) {
          auto it = mp.find(key);
          if (it != mp.end()) {
              it->second->second = value;
              dll.splice(dll.begin(), dll, it->second);
              return;
          }
          if ((int)dll.size() == cap) {
              auto last = dll.back();
              mp.erase(last.first);
              dll.pop_back();
          }
          dll.push_front({key, value});
          mp[key] = dll.begin();
      }
  };`,
      },
      {
        id: "sq-lfu-cache",
        number: 30,
        section: "FAQs",
        title: "LFU Cache",
        difficulty: "Pro",
        bugType: "minFreq Not Updated When Frequency List Empties",
        problem:
          "LFU Cache: Given capacity C and Q operations ('get k', 'put k v'), print returned values for 'get' (-1 if missing) under Least Frequently Used eviction (tie-break by least recent).",
        testCases: [
          { input: "2 6\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3", expectedOutput: "1\n-1\n3" },
        ],
        starterCode: `class LFUCache {
  public:
      LFUCache(int capacity) {}
      int get(int key) { return -1; }
      void put(int key, int value) {}
  };`,
        driverCode: `int main() {
      int cap, q; if (!(cin >> cap >> q)) return 0;
      LFUCache cache(cap);
      while (q--) {
          string op; cin >> op;
          if (op == "get") { int k; cin >> k; cout << cache.get(k) << "\\n"; }
          else if (op == "put") { int k, v; cin >> k >> v; cache.put(k, v); }
      }
      return 0;
  }`,
        code: `class LFUCache {
      struct Entry { int key, val, freq; };
      int cap, minFreq = 0;
      unordered_map<int, list<Entry>::iterator> keyMap;
      unordered_map<int, list<Entry>> freqMap;
      void touch(list<Entry>::iterator it) {
          Entry e = *it;
          int f = e.freq;
          freqMap[f].erase(it);
          // Logical Bug: Forgot to increment minFreq when freqMap[minFreq] becomes empty
          e.freq = f + 1;
          freqMap[e.freq].push_front(e);
          keyMap[e.key] = freqMap[e.freq].begin();
      }
  public:
      LFUCache(int capacity) : cap(capacity) {}
      int get(int key) {
          if (cap <= 0 || !keyMap.count(key)) return -1;
          auto it = keyMap[key];
          int val = it->val;
          touch(it);
          return val;
      }
      void put(int key, int value) {
          if (cap <= 0) return;
          if (keyMap.count(key)) {
              auto it = keyMap[key];
              it->val = value;
              touch(it);
              return;
          }
          if ((int)keyMap.size() == cap) {
              auto& lst = freqMap[minFreq];
              int evictKey = lst.back().key;
              lst.pop_back();
              keyMap.erase(evictKey);
          }
          minFreq = 1;
          freqMap[1].push_front({key, value, 1});
          keyMap[key] = freqMap[1].begin();
      }
  };`,
      },
      {
        id: "sq-count-nge-right",
        number: 31,
        section: "FAQs",
        title: "Number of Greater Elements to the Right",
        difficulty: "Core",
        bugType: "Strict Greater Check Off-by-One",
        problem:
          "Number of Greater Elements to the Right: Given an array of N integers, return for each index i how many elements to its right (j > i) are strictly greater than arr[i].",
        testCases: [{ input: "4\n3 4 2 7", expectedOutput: "2 1 1 0" }],
        starterCode: `class Solution {
  public:
      vector<int> countGreater(vector<int>& arr) {
          // Write your code here
      }
  };`,
        driverCode: `int main() {
      int n; if (!(cin >> n)) return 0;
      vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
      auto res = Solution().countGreater(a);
      for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
      cout << endl; return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> countGreater(vector<int>& arr) {
          int n = arr.size();
          vector<int> ans(n, 0);
          for (int i = 0; i < n; i++) {
              int cnt = 0;
              // Logical Bug: Uses '>=' instead of strictly '>'
              for (int j = i + 1; j < n; j++) {
                  if (arr[j] >= arr[i]) cnt++;
              }
              ans[i] = cnt;
          }
          return ans;
      }
  };`,
      },
    ],
  };