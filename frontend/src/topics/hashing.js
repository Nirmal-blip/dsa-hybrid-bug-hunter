export const HASHING_TOPIC = {
    topic: "Hashing",
    problems: [
      {
        id: "hash-longest-consecutive",
        number: 1,
        section: "FAQs",
        title: "Longest Consecutive Sequence in an Array",
        difficulty: "Core",
        bugType: "Duplicates / Sorting Gap Reset Bug",
        problem:
          "Longest Consecutive Sequence: Given an unsorted array of N integers nums, return the length of the longest consecutive elements sequence.",
        testCases: [{ input: "6\n100 4 200 1 3 2", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int longestConsecutive(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().longestConsecutive(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int longestConsecutive(vector<int>& nums) {
          if (nums.empty()) return 0;
          sort(nums.begin(), nums.end());
          int longest = 1, curr = 1;
          // Logical Bug: Duplicate elements reset curr = 1 instead of being skipped
          for (int i = 1; i < (int)nums.size(); i++) {
              if (nums[i] == nums[i - 1] + 1) {
                  curr++;
                  longest = max(longest, curr);
              } else {
                  curr = 1;
              }
          }
          return longest;
      }
  };`,
      },
      {
        id: "hash-longest-subarray-sum-k",
        number: 2,
        section: "FAQs",
        title: "Longest Subarray with Sum K",
        difficulty: "Core",
        bugType: "Overwriting Earliest Prefix Sum Index",
        problem:
          "Longest Subarray with Sum K: Given an array nums of N integers and an integer K, return the length of the longest subarray that sums to K.",
        testCases: [{ input: "6 15\n10 5 2 7 1 9", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int longestSubarray(vector<int>& nums, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().longestSubarray(nums, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int longestSubarray(vector<int>& nums, int k) {
          unordered_map<long long, int> prefixIdx;
          long long sum = 0;
          int maxLen = 0;
          for (int i = 0; i < (int)nums.size(); i++) {
              sum += nums[i];
              if (sum == k) maxLen = max(maxLen, i + 1);
              if (prefixIdx.count(sum - k)) {
                  maxLen = max(maxLen, i - prefixIdx[sum - k]);
              }
              // Logical Bug: Overwrites earliest index when 0s or negative numbers cause duplicate prefix sums
              prefixIdx[sum] = i;
          }
          return maxLen;
      }
  };`,
      },
      {
        id: "hash-largest-subarray-zero-sum",
        number: 3,
        section: "FAQs",
        title: "Largest Subarray with Sum 0",
        difficulty: "Core",
        bugType: "Missing Prefix Sum 0 Base Case",
        problem:
          "Largest Subarray with Sum 0: Given an array nums of N integers, return the length of the largest contiguous subarray with sum equal to 0.",
        testCases: [{ input: "8\n15 -2 2 -8 1 7 10 23", expectedOutput: "5" }],
        starterCode: `class Solution {
  public:
      int maxLen(vector<int>& nums) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().maxLen(nums) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int maxLen(vector<int>& nums) {
          unordered_map<long long, int> firstSeen;
          long long sum = 0;
          int ans = 0;
          // Logical Bug: Fails when a valid zero-sum subarray starts at index 0
          for (int i = 0; i < (int)nums.size(); i++) {
              sum += nums[i];
              if (firstSeen.count(sum)) {
                  ans = max(ans, i - firstSeen[sum]);
              } else {
                  firstSeen[sum] = i;
              }
          }
          return ans;
      }
  };`,
      },
      {
        id: "hash-count-subarrays-sum-k",
        number: 4,
        section: "FAQs",
        title: "Count Subarrays with Given Sum",
        difficulty: "Core",
        bugType: "32-Bit Prefix Sum Overflow & Self-Count",
        problem:
          "Count Subarrays with Given Sum: Given an integer array nums and an integer K, return the total number of continuous subarrays whose sum equals K.",
        testCases: [{ input: "3 2\n1 1 1", expectedOutput: "2" }],
        starterCode: `class Solution {
  public:
      int subarraySum(vector<int>& nums, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().subarraySum(nums, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int subarraySum(vector<int>& nums, int k) {
          unordered_map<int, int> freq;
          freq[0] = 1;
          // Logical Bug: Updating freq[prefixSum] BEFORE querying freq[prefixSum - k] fails when k == 0
          int prefixSum = 0, count = 0;
          for (int x : nums) {
              prefixSum += x;
              freq[prefixSum]++;
              count += freq[prefixSum - k];
          }
          return count;
      }
  };`,
      },
      {
        id: "hash-count-subarrays-xor-k",
        number: 5,
        section: "FAQs",
        title: "Count Subarrays with Given XOR K",
        difficulty: "Pro",
        bugType: "Missing Initial Prefix XOR (0 -> 1)",
        problem:
          "Count Subarrays with Given XOR K: Given an array of N integers and an integer K, return the total number of subarrays having bitwise XOR equal to K.",
        testCases: [{ input: "5 6\n4 2 2 6 4", expectedOutput: "4" }],
        starterCode: `class Solution {
  public:
      int subarraysWithXorK(vector<int>& nums, int k) {
          // Write your code here
          
      }
  };`,
        driverCode: `int main() {
      int n, k;
      if (!(cin >> n >> k)) return 0;
      vector<int> nums(n);
      for (int i = 0; i < n; i++) cin >> nums[i];
      cout << Solution().subarraysWithXorK(nums, k) << endl;
      return 0;
  }`,
        code: `class Solution {
  public:
      int subarraysWithXorK(vector<int>& nums, int k) {
          unordered_map<int, int> xorFreq;
          // Logical Bug: Forgot xorFreq[0] = 1, missing subarrays starting from index 0
          int xr = 0, count = 0;
          for (int x : nums) {
              xr ^= x;
              int need = xr ^ k;
              if (xorFreq.count(need)) count += xorFreq[need];
              xorFreq[xr]++;
          }
          return count;
      }
  };`,
      },
    ],
  };