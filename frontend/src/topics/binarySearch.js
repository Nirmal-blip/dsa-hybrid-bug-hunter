export const BINARY_SEARCH_TOPIC = {
    topic: "Binary Search",
    problems: [
      {
        id: "bs-search-x",
        number: 1,
        section: "Fundamentals",
        title: "Search X in Sorted Array",
        difficulty: "Basic",
        bugType: "Infinite Loop / Boundary Update Bug",
        problem:
          "Search X in Sorted Array: Given a sorted array of N integers and a target X, return the 0-based index of X if present, otherwise return -1.",
        testCases: [{ input: "6 9\n-1 0 3 5 9 12", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int search(vector<int>& nums, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().search(a, x) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int search(vector<int>& a, int x) {
          int low = 0, high = a.size();
          // Logical Bug: low = mid causes infinite loop when high = low + 1 and a[mid] < x
          while (low < high) {
              int mid = (low + high) / 2;
              if (a[mid] == x) return mid;
              if (a[mid] < x) low = mid;
              else high = mid - 1;
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-lower-bound",
        number: 2,
        section: "Fundamentals",
        title: "Lower Bound",
        difficulty: "Core",
        bugType: "Default Answer N Missing / Strict Inequality",
        problem:
          "Lower Bound: Given a sorted array of N integers and an integer X, return the smallest index idx such that arr[idx] >= X, or N if none exists.",
        testCases: [{ input: "5 9\n3 5 8 15 19", expectedOutput: "3" }],
        starterCode: `class Solution {
  public:
      int lowerBound(vector<int>& arr, int x) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().lowerBound(a, x) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int lowerBound(vector<int>& a, int x) {
          int low = 0, high = (int)a.size() - 1, ans = -1;
          // Logical Bug: Initializes ans = -1 instead of n when all elements are smaller than x
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] >= x) {
                  ans = mid;
                  high = mid - 1;
              } else {
                  low = mid + 1;
              }
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-upper-bound",
        number: 3,
        section: "Fundamentals",
        title: "Upper Bound",
        difficulty: "Core",
        bugType: "Greater-Equal vs Strictly Greater Bug",
        problem:
          "Upper Bound: Given a sorted array of N integers and an integer X, return the smallest index idx such that arr[idx] > X, or N if none exists.",
        testCases: [{ input: "5 7\n3 5 8 9 15", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int upperBound(vector<int>& arr, int x) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().upperBound(a, x) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int upperBound(vector<int>& a, int x) {
          int n = a.size(), low = 0, high = n - 1, ans = n;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              // Logical Bug: Uses '>=' instead of strictly '>'
              if (a[mid] >= x) {
                  ans = mid;
                  high = mid - 1;
              } else {
                  low = mid + 1;
              }
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-search-insert",
        number: 4,
        section: "Logic Building",
        title: "Search Insert Position",
        difficulty: "Basic",
        bugType: "Off-by-One Insertion Index at End",
        problem:
          "Search Insert Position: Given a sorted array of N distinct integers and a target value, return the index if found, or the index where it would be inserted in order.",
        testCases: [{ input: "4 5\n1 3 5 6", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int searchInsert(vector<int>& nums, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, target;
      if (!(cin >> n >> target)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().searchInsert(nums, target) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int searchInsert(vector<int>& nums, int target) {
          int low = 0, high = (int)nums.size() - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] == target) return mid;
              else if (nums[mid] < target) low = mid + 1;
              else high = mid - 1;
          }
          // Logical Bug: Returns high instead of low when target is not present
          return high;
      }
  };`,
      },
      {
        id: "bs-floor-ceil",
        number: 5,
        section: "Logic Building",
        title: "Floor and Ceil in Sorted Array",
        difficulty: "Core",
        bugType: "Pointer Direction Inversion on Floor/Ceil",
        problem:
          "Floor and Ceil in Sorted Array: Given a sorted array of N integers and an integer X, return {floor, ceil} (use -1 if either does not exist).",
        testCases: [{ input: "6 5\n3 4 4 7 8 10", expectedOutput: "4 7" }],
        starterCode: `class Solution {
  public:
      pair<int, int> getFloorAndCeil(vector<int>& a, int x) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      auto ans = Solution().getFloorAndCeil(a, x);
      cout << ans.first << " " << ans.second << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      pair<int, int> getFloorAndCeil(vector<int>& a, int x) {
          int low = 0, high = (int)a.size() - 1, fl = -1, cl = -1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] == x) return {a[mid], a[mid]};
              else if (a[mid] < x) {
                  fl = a[mid];
                  // Logical Bug: Moves high = mid - 1 instead of low = mid + 1
                  high = mid - 1;
              } else {
                  cl = a[mid];
                  high = mid - 1;
              }
          }
          return {fl, cl};
      }
  };`,
      },
      {
        id: "bs-first-last-occurrence",
        number: 6,
        section: "Logic Building",
        title: "First and Last Occurrence",
        difficulty: "Core",
        bugType: "Last Occurrence Loop Direction Bug",
        problem:
          "First and Last Occurrence: Given a sorted array of N integers and a target X, return the first and last 0-based index of X, or {-1, -1} if not found.",
        testCases: [{ input: "6 8\n5 7 7 8 8 10", expectedOutput: "3 4" }],
        starterCode: `class Solution {
  public:
      vector<int> searchRange(vector<int>& nums, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      vector<int> res = Solution().searchRange(a, x);
      cout << res[0] << " " << res[1] << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      vector<int> searchRange(vector<int>& a, int x) {
          int n = a.size(), first = -1, last = -1;
          int low = 0, high = n - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] == x) { first = mid; high = mid - 1; }
              else if (a[mid] < x) low = mid + 1;
              else high = mid - 1;
          }
          low = 0; high = n - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] == x) {
                  last = mid;
                  // Logical Bug: Moves high = mid - 1 instead of low = mid + 1
                  high = mid - 1;
              } else if (a[mid] < x) low = mid + 1;
              else high = mid - 1;
          }
          return {first, last};
      }
  };`,
      },
      {
        id: "bs-rotated-1",
        number: 7,
        section: "Logic Building",
        title: "Search in Rotated Sorted Array-I",
        difficulty: "Core",
        bugType: "Strict Inequality When low == mid",
        problem:
          "Search in Rotated Sorted Array-I: Given a rotated sorted array nums of N distinct integers and a target, return the index of target if present, otherwise return -1.",
        testCases: [{ input: "7 0\n4 5 6 7 0 1 2", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int search(vector<int>& nums, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, target;
      if (!(cin >> n >> target)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().search(nums, target) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int search(vector<int>& nums, int target) {
          int low = 0, high = (int)nums.size() - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] == target) return mid;
              // Logical Bug: Strict '<' instead of '<=' fails when low == mid (e.g. [3, 1], target = 1)
              if (nums[low] < nums[mid]) {
                  if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                  else low = mid + 1;
              } else {
                  if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                  else high = mid - 1;
              }
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-rotated-2",
        number: 8,
        section: "Logic Building",
        title: "Search in Rotated Sorted Array-II (With Duplicates)",
        difficulty: "Core",
        bugType: "Ambiguous Duplicate Endpoints Not Shrunk",
        problem:
          "Search in Rotated Sorted Array-II: Given a rotated sorted array nums of N integers (may contain duplicates) and a target, return true if target is in nums, otherwise false.",
        testCases: [{ input: "7 0\n2 5 6 0 0 1 2", expectedOutput: "true" }],
        starterCode: `class Solution {
  public:
      bool search(vector<int>& nums, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, target;
      if (!(cin >> n >> target)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << (Solution().search(nums, target) ? "true" : "false") << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      bool search(vector<int>& nums, int target) {
          int low = 0, high = (int)nums.size() - 1;
          // Logical Bug: Missing (nums[low] == nums[mid] && nums[mid] == nums[high]) shrink step
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] == target) return true;
              if (nums[low] <= nums[mid]) {
                  if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                  else low = mid + 1;
              } else {
                  if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                  else high = mid - 1;
              }
          }
          return false;
      }
  };`,
      },
      {
        id: "bs-find-min-rotated",
        number: 9,
        section: "Logic Building",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "Core",
        bugType: "Mid Discarded When Right Half Unsorted",
        problem:
          "Find Minimum in Rotated Sorted Array: Given a rotated sorted array of N unique elements, return the minimum element.",
        testCases: [{ input: "5\n3 4 5 1 2", expectedOutput: "1" }],
        starterCode: `class Solution {
  public:
      int findMin(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().findMin(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int findMin(vector<int>& nums) {
          int low = 0, high = (int)nums.size() - 1;
          while (low < high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] > nums[high]) low = mid + 1;
              // Logical Bug: high = mid - 1 skips nums[mid] when mid itself is the minimum
              else high = mid - 1;
          }
          return nums[low];
      }
  };`,
      },
      {
        id: "bs-rotation-count",
        number: 10,
        section: "Logic Building",
        title: "Find Out How Many Times the Array is Rotated",
        difficulty: "Core",
        bugType: "Duplicate Minimum Index / Non-Rotated Check",
        problem:
          "Rotation Count: Given a strictly increasing array of N distinct integers rotated right K times (0 <= K < N), return the value of K.",
        testCases: [{ input: "5\n4 5 1 2 3", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int findKRotation(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().findKRotation(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int findKRotation(vector<int>& nums) {
          int low = 0, high = (int)nums.size() - 1, ansIdx = 0;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[low] <= nums[mid]) {
                  // Logical Bug: Unconditionally overwrites ansIdx without checking nums[low] < nums[ansIdx]
                  ansIdx = low;
                  low = mid + 1;
              } else {
                  ansIdx = mid;
                  high = mid - 1;
              }
          }
          return ansIdx;
      }
  };`,
      },
      {
        id: "bs-single-element",
        number: 11,
        section: "Logic Building",
        title: "Single Element in Sorted Array",
        difficulty: "Core",
        bugType: "Out-of-Bounds Neighbor Read on Boundary",
        problem:
          "Single Element in a Sorted Array: Given a sorted array where every element appears twice except for one element which appears once, return that single element.",
        testCases: [{ input: "9\n1 1 2 3 3 4 4 8 8", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int singleNonDuplicate(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().singleNonDuplicate(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int singleNonDuplicate(vector<int>& nums) {
          int low = 0, high = (int)nums.size() - 1;
          // Logical Bug: Reading nums[mid - 1] / nums[mid + 1] without boundary guards goes out of bounds
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] != nums[mid - 1] && nums[mid] != nums[mid + 1]) return nums[mid];
              if ((mid % 2 == 1 && nums[mid] == nums[mid - 1]) ||
                  (mid % 2 == 0 && nums[mid] == nums[mid + 1])) low = mid + 1;
              else high = mid - 1;
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-count-occurrences",
        number: 12,
        section: "Logic Building",
        title: "Count Occurrences in a Sorted Array",
        difficulty: "Core",
        bugType: "Off-by-One Count When Target Missing",
        problem:
          "Count Occurrences in a Sorted Array: Given a sorted array of N integers and a target X, return the total number of times X appears in the array.",
        testCases: [{ input: "7 3\n1 1 2 2 2 2 3", expectedOutput: "1" }],
        starterCode: `class Solution {
  public:
      int countOccurrences(vector<int>& arr, int target) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, x;
      if (!(cin >> n >> x)) return 0;
      vector<int> a(n);
      for (int i = 0; i < n; i++) cin >> a[i];
      cout << Solution().countOccurrences(a, x) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int countOccurrences(vector<int>& a, int x) {
          int n = a.size(), first = -1, last = -1, low = 0, high = n - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] == x) { first = mid; high = mid - 1; }
              else if (a[mid] < x) low = mid + 1;
              else high = mid - 1;
          }
          low = 0; high = n - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (a[mid] == x) { last = mid; low = mid + 1; }
              else if (a[mid] < x) low = mid + 1;
              else high = mid - 1;
          }
          // Logical Bug: Returns (last - first + 1) = 1 instead of 0 when x is missing
          return last - first + 1;
      }
  };`,
      },
      {
        id: "bs-sqrt-number",
        number: 13,
        section: "On Answers",
        title: "Find Square Root of a Number",
        difficulty: "Core",
        bugType: "32-Bit Signed Overflow in mid * mid",
        problem:
          "Find Square Root: Given a non-negative integer N, return the floor of the square root of N.",
        testCases: [{ input: "28", expectedOutput: "5" }],
        starterCode: `class Solution {
  public:
      int mySqrt(int n) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      cout << Solution().mySqrt(n) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int mySqrt(int n) {
          int low = 1, high = n, ans = 0;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              // Logical Bug: int * int overflows 32-bit signed integer when mid > 46340
              int sq = mid * mid;
              if (sq <= n) {
                  ans = mid;
                  low = mid + 1;
              } else {
                  high = mid - 1;
              }
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-nth-root",
        number: 14,
        section: "On Answers",
        title: "Find Nth Root of a Number",
        difficulty: "Core",
        bugType: "Exponentiation Overflow Without Early Exit",
        problem:
          "Find Nth Root of M: Given two integers N and M, return the integer X such that X^N == M, or -1 if no such integer exists.",
        testCases: [{ input: "3 27", expectedOutput: "3" }],
        starterCode: `class Solution {
  public:
      long long nthRoot(int n, long long m) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      long long m;
      if (!(cin >> n >> m)) return 0;
      cout << Solution().nthRoot(n, m) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      long long nthRoot(int n, long long m) {
          long long low = 1, high = m;
          while (low <= high) {
              long long mid = low + (high - low) / 2;
              long long p = 1;
              // Logical Bug: Computing mid^n without early break overflows long long
              for (int i = 0; i < n; i++) p *= mid;
              if (p == m) return mid;
              else if (p < m) low = mid + 1;
              else high = mid - 1;
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-smallest-divisor",
        number: 15,
        section: "On Answers",
        title: "Find the Smallest Divisor Given a Threshold",
        difficulty: "Core",
        bugType: "Floor Division Instead of Ceil Division",
        problem:
          "Smallest Divisor: Given an array of N positive integers nums and an integer threshold, return the smallest positive integer divisor such that sum(ceil(nums[i] / divisor)) <= threshold.",
        testCases: [{ input: "4 6\n1 2 5 9", expectedOutput: "5" }],
        starterCode: `class Solution {
  public:
      int smallestDivisor(vector<int>& nums, int threshold) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, threshold;
      if (!(cin >> n >> threshold)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().smallestDivisor(nums, threshold) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int smallestDivisor(vector<int>& nums, int threshold) {
          int maxVal = *max_element(nums.begin(), nums.end());
          int low = 1, high = maxVal, ans = maxVal;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              long long sum = 0;
              // Logical Bug: Uses floor division (x / mid) instead of ceil division
              for (int x : nums) sum += (x / mid);
              if (sum <= threshold) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-koko-bananas",
        number: 16,
        section: "On Answers",
        title: "Koko Eating Bananas",
        difficulty: "Pro",
        bugType: "32-Bit Hours Accumulator Overflow",
        problem:
          "Koko Eating Bananas: Given N piles of bananas and H hours, return the minimum integer eating speed K such that Koko can eat all bananas within H hours.",
        testCases: [{ input: "4 8\n3 6 7 11", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int minEatingSpeed(vector<int>& piles, int h) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, h;
      if (!(cin >> n >> h)) return 0;
      vector<int> piles(n);
      for (int i = 0; i < n; i++) cin >> piles[i];
      cout << Solution().minEatingSpeed(piles, h) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int minEatingSpeed(vector<int>& piles, int h) {
          int low = 1, high = *max_element(piles.begin(), piles.end()), ans = high;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              // Logical Bug: 32-bit int 'hours' overflows when piles[i] ~ 10^9 and mid = 1
              int hours = 0;
              for (int p : piles) hours += (p + mid - 1) / mid;
              if (hours <= h) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-min-days-bouquets",
        number: 17,
        section: "On Answers",
        title: "Minimum Days to Make M Bouquets",
        difficulty: "Pro",
        bugType: "Non-Adjacent Bouquet Counting Bug",
        problem:
          "Minimum Days to Make M Bouquets: Given N flower bloom days, M bouquets required, and K adjacent flowers per bouquet, return the minimum days needed, or -1 if impossible.",
        testCases: [{ input: "5 3 1\n1 10 3 10 2", expectedOutput: "3" }],
        starterCode: `class Solution {
  public:
      int minDays(vector<int>& bloomDay, int m, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, m, k;
      if (!(cin >> n >> m >> k)) return 0;
      vector<int> bloom(n);
      for (int i = 0; i < n; i++) cin >> bloom[i];
      cout << Solution().minDays(bloom, m, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int minDays(vector<int>& bloom, int m, int k) {
          if (1LL * m * k > (long long)bloom.size()) return -1;
          int low = *min_element(bloom.begin(), bloom.end());
          int high = *max_element(bloom.begin(), bloom.end()), ans = -1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              int bloomed = 0;
              // Logical Bug: Counts total bloomed / k instead of requiring k ADJACENT bloomed flowers
              for (int d : bloom) if (d <= mid) bloomed++;
              if (bloomed / k >= m) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-ship-packages",
        number: 18,
        section: "On Answers",
        title: "Capacity to Ship Packages Within D Days",
        difficulty: "Pro",
        bugType: "Wrong Lower Bound (1 Instead of max(weights))",
        problem:
          "Capacity to Ship Packages: Given N package weights in order and D days, return the least weight capacity of the ship that will ship all packages within D days.",
        testCases: [{ input: "10 5\n1 2 3 4 5 6 7 8 9 10", expectedOutput: "15" }],
        starterCode: `class Solution {
  public:
      int shipWithinDays(vector<int>& weights, int days) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, days;
      if (!(cin >> n >> days)) return 0;
      vector<int> w(n);
      for (int i = 0; i < n; i++) cin >> w[i];
      cout << Solution().shipWithinDays(w, days) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int shipWithinDays(vector<int>& w, int days) {
          // Logical Bug: Starts low = 1 instead of max_element(w)
          int low = 1, high = accumulate(w.begin(), w.end(), 0), ans = high;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              int d = 1, load = 0;
              for (int x : w) {
                  if (load + x > mid) { d++; load = x; }
                  else load += x;
              }
              if (d <= days) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-kth-missing-positive",
        number: 19,
        section: "On Answers",
        title: "Kth Missing Positive Number",
        difficulty: "Pro",
        bugType: "Off-by-One Formula (low + k vs high + k)",
        problem:
          "Kth Missing Positive Number: Given a strictly increasing array arr of N positive integers and an integer K, return the Kth missing positive integer.",
        testCases: [{ input: "5 5\n2 3 4 7 11", expectedOutput: "9" }],
        starterCode: `class Solution {
  public:
      int findKthPositive(vector<int>& arr, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> arr(n);
      for (int i = 0; i < n; i++) cin >> arr[i];
      cout << Solution().findKthPositive(arr, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int findKthPositive(vector<int>& arr, int k) {
          int low = 0, high = (int)arr.size() - 1;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              int missing = arr[mid] - (mid + 1);
              if (missing < k) low = mid + 1;
              else high = mid - 1;
          }
          // Logical Bug: Returns high + k instead of low + k
          return high + k;
      }
  };`,
      },
      {
        id: "bs-painters-partition",
        number: 20,
        section: "On Answers",
        title: "Painter's Partition Problem",
        difficulty: "Pro",
        bugType: "Subarray Partition Count Initialization (0 vs 1)",
        problem:
          "Painter's Partition: Given N boards of given lengths and K painters, return the minimum time to paint all boards where each painter paints contiguous sections.",
        testCases: [{ input: "4 2\n10 20 30 40", expectedOutput: "60" }],
        starterCode: `class Solution {
  public:
      long long minTime(vector<int>& boards, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> boards(n);
      for (int i = 0; i < n; i++) cin >> boards[i];
      cout << Solution().minTime(boards, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      long long minTime(vector<int>& boards, int k) {
          long long low = *max_element(boards.begin(), boards.end());
          long long high = accumulate(boards.begin(), boards.end(), 0LL), ans = high;
          while (low <= high) {
              long long mid = low + (high - low) / 2;
              // Logical Bug: Initializes painters = 0 instead of 1
              int painters = 0;
              long long curr = 0;
              for (int b : boards) {
                  if (curr + b > mid) { painters++; curr = b; }
                  else curr += b;
              }
              if (painters <= k) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-aggressive-cows",
        number: 21,
        section: "FAQs",
        title: "Aggressive Cows",
        difficulty: "Pro",
        bugType: "Missing Sort Before Greedy Placement",
        problem:
          "Aggressive Cows: Given N stall positions and K cows, assign cows to stalls maximizing the minimum distance between any two cows.",
        testCases: [{ input: "5 3\n1 2 4 8 9", expectedOutput: "3" }],
        starterCode: `class Solution {
  public:
      int aggressiveCows(vector<int>& stalls, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> stalls(n);
      for (int i = 0; i < n; i++) cin >> stalls[i];
      cout << Solution().aggressiveCows(stalls, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int aggressiveCows(vector<int>& stalls, int k) {
          // Logical Bug: Forgot sort(stalls.begin(), stalls.end()) before greedy distance check
          int low = 1, high = *max_element(stalls.begin(), stalls.end()) - *min_element(stalls.begin(), stalls.end());
          int ans = 0;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              int cows = 1, lastPos = stalls[0];
              for (int i = 1; i < (int)stalls.size(); i++) {
                  if (stalls[i] - lastPos >= mid) { cows++; lastPos = stalls[i]; }
              }
              if (cows >= k) { ans = mid; low = mid + 1; }
              else high = mid - 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-book-allocation",
        number: 22,
        section: "FAQs",
        title: "Book Allocation Problem",
        difficulty: "Pro",
        bugType: "Missing M > N Impossible Check",
        problem:
          "Book Allocation Problem: Given N books with pages[i] and M students, allocate contiguous books to all M students minimizing the maximum pages assigned to a student, or -1 if impossible.",
        testCases: [{ input: "4 2\n12 34 67 90", expectedOutput: "113" }],
        starterCode: `class Solution {
  public:
      int findPages(vector<int>& pages, int m) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, m;
      if (!(cin >> n >> m)) return 0;
      vector<int> pages(n);
      for (int i = 0; i < n; i++) cin >> pages[i];
      cout << Solution().findPages(pages, m) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int findPages(vector<int>& pages, int m) {
          // Logical Bug: Does not check if (m > pages.size()) to return -1
          int low = *max_element(pages.begin(), pages.end());
          int high = accumulate(pages.begin(), pages.end(), 0), ans = high;
          while (low <= high) {
              int mid = low + (high - low) / 2;
              int students = 1, currPages = 0;
              for (int p : pages) {
                  if (currPages + p > mid) { students++; currPages = p; }
                  else currPages += p;
              }
              if (students <= m) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
      {
        id: "bs-find-peak-element",
        number: 23,
        section: "FAQs",
        title: "Find Peak Element",
        difficulty: "Core",
        bugType: "Out-of-Bounds Read at Index 0 or N-1",
        problem:
          "Find Peak Element: Given an array nums of N integers, return the 0-based index of any peak element (strictly greater than its neighbors).",
        testCases: [{ input: "4\n1 2 3 1", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int findPeakElement(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().findPeakElement(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int findPeakElement(vector<int>& nums) {
          int low = 0, high = (int)nums.size() - 1;
          // Logical Bug: Accesses nums[mid - 1] and nums[mid + 1] without handling boundary indices
          while (low <= high) {
              int mid = low + (high - low) / 2;
              if (nums[mid] > nums[mid - 1] && nums[mid] > nums[mid + 1]) return mid;
              else if (nums[mid] < nums[mid + 1]) low = mid + 1;
              else high = mid - 1;
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-median-two-sorted",
        number: 24,
        section: "FAQs",
        title: "Median of 2 Sorted Arrays",
        difficulty: "Pro",
        bugType: "Integer Division Truncation on Even Combined Length",
        problem:
          "Median of Two Sorted Arrays: Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
        testCases: [{ input: "2 1\n1 3\n2", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, m;
      if (!(cin >> n >> m)) return 0;
      vector<int> a(n), b(m);
      for (int i = 0; i < n; i++) cin >> a[i];
      for (int i = 0; i < m; i++) cin >> b[i];
      cout << Solution().findMedianSortedArrays(a, b) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
          if (a.size() > b.size()) swap(a, b);
          int n = a.size(), m = b.size(), low = 0, high = n, leftHalf = (n + m + 1) / 2;
          while (low <= high) {
              int cut1 = (low + high) / 2, cut2 = leftHalf - cut1;
              int l1 = (cut1 == 0) ? INT_MIN : a[cut1 - 1];
              int l2 = (cut2 == 0) ? INT_MIN : b[cut2 - 1];
              int r1 = (cut1 == n) ? INT_MAX : a[cut1];
              int r2 = (cut2 == m) ? INT_MAX : b[cut2];
              if (l1 <= r2 && l2 <= r1) {
                  if ((n + m) % 2 == 1) return max(l1, l2);
                  // Logical Bug: Integer division '/ 2' truncates '.5' fractional median
                  return (max(l1, l2) + min(r1, r2)) / 2;
              } else if (l1 > r2) high = cut1 - 1;
              else low = cut1 + 1;
          }
          return 0.0;
      }
  };`,
      },
      {
        id: "bs-kth-element-two-sorted",
        number: 25,
        section: "FAQs",
        title: "Kth Element of 2 Sorted Arrays",
        difficulty: "Pro",
        bugType: "Wrong Partition Search Bounds (0 to N Instead of max(0, K-M) to min(K, N))",
        problem:
          "Kth Element of Two Sorted Arrays: Given two sorted arrays a and b and an integer K, return the Kth smallest element of the combined sorted array.",
        testCases: [{ input: "5 4 5\n2 3 6 7 9\n1 4 8 10", expectedOutput: "6" }],
        starterCode: `class Solution {
  public:
      int kthElement(vector<int>& a, vector<int>& b, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, m, k;
      if (!(cin >> n >> m >> k)) return 0;
      vector<int> a(n), b(m);
      for (int i = 0; i < n; i++) cin >> a[i];
      for (int i = 0; i < m; i++) cin >> b[i];
      cout << Solution().kthElement(a, b, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int kthElement(vector<int>& a, vector<int>& b, int k) {
          int n = a.size(), m = b.size();
          // Logical Bug: low = 0 and high = n ignores 0 <= k - cut1 <= m
          int low = 0, high = n;
          while (low <= high) {
              int cut1 = (low + high) / 2, cut2 = k - cut1;
              int l1 = (cut1 == 0) ? INT_MIN : a[cut1 - 1];
              int l2 = (cut2 == 0) ? INT_MIN : b[cut2 - 1];
              int r1 = (cut1 == n) ? INT_MAX : a[cut1];
              int r2 = (cut2 == m) ? INT_MAX : b[cut2];
              if (l1 <= r2 && l2 <= r1) return max(l1, l2);
              else if (l1 > r2) high = cut1 - 1;
              else low = cut1 + 1;
          }
          return -1;
      }
  };`,
      },
      {
        id: "bs-gas-stations",
        number: 26,
        section: "FAQs",
        title: "Minimize Max Distance to Gas Station",
        difficulty: "Pro",
        bugType: "Exact Multiple Division Off-by-One",
        problem:
          "Minimize Max Distance to Gas Station: Given N sorted gas station positions and K new stations to add, return the minimized maximum distance between adjacent stations.",
        testCases: [{ input: "5 4\n1 2 3 4 5", expectedOutput: "0.50" }],
        starterCode: `class Solution {
  public:
      double minmaxGasDist(vector<int>& stations, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> st(n);
      for (int i = 0; i < n; i++) cin >> st[i];
      cout << fixed << setprecision(2) << Solution().minmaxGasDist(st, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      double minmaxGasDist(vector<int>& st, int k) {
          double low = 0.0, high = st.back() - st.front();
          while (high - low > 1e-6) {
              double mid = (low + high) / 2.0;
              int needed = 0;
              // Logical Bug: Exact multiple of mid overcounts required stations by 1
              for (int i = 1; i < (int)st.size(); i++) {
                  needed += (int)((st[i] - st[i - 1]) / mid);
              }
              if (needed <= k) high = mid;
              else low = mid;
          }
          return high;
      }
  };`,
      },
      {
        id: "bs-split-array-largest-sum",
        number: 27,
        section: "FAQs",
        title: "Split Array - Largest Sum",
        difficulty: "Pro",
        bugType: "Strict Inequality Boundary Bug",
        problem:
          "Split Array Largest Sum: Given an integer array nums and an integer K, split nums into K non-empty continuous subarrays to minimize the largest sum among these K subarrays.",
        testCases: [{ input: "5 2\n7 2 5 10 8", expectedOutput: "18" }],
        starterCode: `class Solution {
  public:
      int splitArray(vector<int>& nums, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().splitArray(nums, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int splitArray(vector<int>& nums, int k) {
          int low = *max_element(nums.begin(), nums.end());
          int high = accumulate(nums.begin(), nums.end(), 0), ans = high;
          // Logical Bug: Strict '<' skips final candidate when low == high
          while (low < high) {
              int mid = low + (high - low) / 2;
              int parts = 1, curr = 0;
              for (int x : nums) {
                  if (curr + x > mid) { parts++; curr = x; }
                  else curr += x;
              }
              if (parts <= k) { ans = mid; high = mid - 1; }
              else low = mid + 1;
          }
          return ans;
      }
  };`,
      },
    ],
  };