export const CPP_PRESETS = [
    {
      name: "1. Binary Search Infinite Loop (Boundary Bug)",
      problem: "Given a sorted array of N integers and a target, print the 0-based index of target or -1 if not found.",
      testCases: [{ input: "5 4\n1 2 3 4 5", expectedOutput: "3" }],
      code: `#include <iostream>
  #include <vector>
  using namespace std;
  
  int binarySearch(vector<int>& arr, int target) {
      int left = 0, right = arr.size(); 
      while (left < right) {
          int mid = (left + right) / 2;
          if (arr[mid] == target) return mid;
          if (arr[mid] < target) left = mid;
          else right = mid - 1;
      }
      return -1;
  }
  
  int main() {
      int n, target;
      if (!(cin >> n >> target)) return 0;
      vector<int> arr(n);
      for (int i = 0; i < n; i++) cin >> arr[i];
      cout << binarySearch(arr, target) << endl;
      return 0;
  }`
    },
    {
      name: "2. Subarray Sum (Integer Overflow Bug)",
      problem: "Given N integers (up to 10^9 each), print the total sum of all elements.",
      testCases: [{ input: "3\n10 20 30", expectedOutput: "60" }],
      code: `#include <iostream>
  using namespace std;
  
  int main() {
      int n;
      cin >> n;
      int sum = 0; // Overflow when sum > 2*10^9
      for (int i = 0; i < n; i++) {
          int x;
          cin >> x;
          sum += x;
      }
      cout << sum << endl;
      return 0;
  }`
    },
    {
      name: "3. Factorial Modulo (Wrong Identity / Base Case)",
      problem: "Compute N! % 1000000007 for 0 <= N <= 20.",
      testCases: [{ input: "5", expectedOutput: "120" }],
      code: `#include <iostream>
  using namespace std;
  
  int main() {
      int n;
      cin >> n;
      long long ans = 0; // Logical bug: initialized to 0 instead of 1
      for (int i = 1; i <= n; i++) {
          ans = (ans * i) % 1000000007;
      }
      cout << ans << endl;
      return 0;
  }`
    }
  ];