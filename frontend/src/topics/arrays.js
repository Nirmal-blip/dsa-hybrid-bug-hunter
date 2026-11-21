export const ARRAYS_TOPIC = {
  topic: "Arrays",
  problems: [
    {
      id: "arr-move-zeros",
      number: 1,
      section: "Logic Building",
      title: "Move Zeros to End",
      difficulty: "Basic",
      bugType: "Relative Order / Swap Pointer Bug",
      problem:
        "Move Zeros to End: Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements in-place.",
      testCases: [{ input: "5\n0 1 0 3 12", expectedOutput: "1 3 12 0 0" }],
      starterCode: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution().moveZeroes(nums);
    for (int i = 0; i < n; i++) cout << nums[i] << (i + 1 == n ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int left = 0, right = (int)nums.size() - 1;
        // Logical Bug: Two-pointer swap from ends breaks relative order of non-zero elements
        while (left < right) {
            if (nums[left] == 0 && nums[right] != 0) {
                swap(nums[left++], nums[right--]);
            } else {
                if (nums[left] != 0) left++;
                if (nums[right] == 0) right--;
            }
        }
    }
};`,
    },
    {
      id: "arr-remove-duplicates",
      number: 2,
      section: "Logic Building",
      title: "Remove Duplicates from Sorted Array",
      difficulty: "Basic",
      bugType: "Off-by-One Loop Bound / Empty Check",
      problem:
        "Remove Duplicates from Sorted Array: Given a sorted integer array nums, remove the duplicates in-place such that each unique element appears only once and return the number of unique elements K.",
      testCases: [{ input: "5\n1 1 2 2 3", expectedOutput: "3\n1 2 3" }],
      starterCode: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int k = Solution().removeDuplicates(nums);
    cout << k << "\\n";
    for (int i = 0; i < k; i++) cout << nums[i] << (i + 1 == k ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int j = 0, n = nums.size();
        // Logical Bug: Comparing nums[i] with nums[i+1] reads out-of-bounds at i = n - 1
        for (int i = 0; i < n; i++) {
            if (nums[i] != nums[i + 1]) {
                nums[j++] = nums[i];
            }
        }
        return j;
    }
};`,
    },
    {
      id: "arr-missing-number",
      number: 3,
      section: "Logic Building",
      title: "Find Missing Number",
      difficulty: "Basic",
      bugType: "Integer Overflow in Sum Formula",
      problem:
        "Find Missing Number: Given an array nums containing N distinct numbers in the range [0, N], return the only number in the range that is missing from the array.",
      testCases: [{ input: "3\n3 0 1", expectedOutput: "2" }],
      starterCode: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << Solution().missingNumber(nums) << endl;
    return 0;
}`,
      code: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        int actualSum = 0;
        for (int x : nums) actualSum += x;
        // Logical Bug: n * (n + 1) overflows 32-bit int when n >= 46341
        int expectedSum = (n * (n + 1)) / 2;
        return expectedSum - actualSum;
    }
};`,
    },
    {
      id: "arr-union-sorted",
      number: 4,
      section: "Logic Building",
      title: "Union of Two Sorted Arrays",
      difficulty: "Core",
      bugType: "Duplicate Insertion Across Arrays",
      problem:
        "Union of Two Sorted Arrays: Given two sorted arrays a and b, return their union (all distinct elements present in either array) in sorted order.",
      testCases: [{ input: "5 4\n1 2 3 4 5\n2 3 6 7", expectedOutput: "1 2 3 4 5 6 7" }],
      starterCode: `class Solution {
public:
    vector<int> unionArray(vector<int>& a, vector<int>& b) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<int> a(n), b(m);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < m; i++) cin >> b[i];
    vector<int> res = Solution().unionArray(a, b);
    for (size_t k = 0; k < res.size(); k++) cout << res[k] << (k + 1 == res.size() ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> unionArray(vector<int>& a, vector<int>& b) {
        vector<int> res;
        int i = 0, j = 0, n = a.size(), m = b.size();
        // Logical Bug: Does not deduplicate repeated elements within 'a' or 'b' itself
        while (i < n && j < m) {
            if (a[i] < b[j]) res.push_back(a[i++]);
            else if (b[j] < a[i]) res.push_back(b[j++]);
            else { res.push_back(a[i]); i++; j++; }
        }
        while (i < n) res.push_back(a[i++]);
        while (j < m) res.push_back(b[j++]);
        return res;
    }
};`,
    },
    {
      id: "arr-intersection-sorted",
      number: 5,
      section: "Logic Building",
      title: "Intersection of Two Sorted Arrays",
      difficulty: "Core",
      bugType: "Pointer Increment on Match",
      problem:
        "Intersection of Two Sorted Arrays: Given two sorted arrays a and b, return the elements present in both arrays (including duplicates as many times as they appear in both).",
      testCases: [{ input: "4 3\n1 2 2 3\n2 2 4", expectedOutput: "2 2" }],
      starterCode: `class Solution {
public:
    vector<int> intersectionArray(vector<int>& a, vector<int>& b) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<int> a(n), b(m);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < m; i++) cin >> b[i];
    vector<int> ans = Solution().intersectionArray(a, b);
    for (size_t k = 0; k < ans.size(); k++) cout << ans[k] << (k + 1 == ans.size() ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> intersectionArray(vector<int>& a, vector<int>& b) {
        vector<int> ans;
        int i = 0, j = 0, n = a.size(), m = b.size();
        while (i < n && j < m) {
            if (a[i] < b[j]) i++;
            else if (b[j] < a[i]) j++;
            else {
                ans.push_back(a[i]);
                // Logical Bug: Only increments i, forgetting j++
                i++;
            }
        }
        return ans;
    }
};`,
    },
    {
      id: "arr-majority-element-1",
      number: 6,
      section: "FAQs (Medium)",
      title: "Majority Element-I",
      difficulty: "Core",
      bugType: "Missing Verification / Reset Bug",
      problem:
        "Majority Element-I: Given an array nums of size N, return the majority element (appears strictly more than N/2 times), or -1 if none exists.",
      testCases: [{ input: "7\n2 2 1 1 1 2 2", expectedOutput: "2" }],
      starterCode: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << Solution().majorityElement(nums) << endl;
    return 0;
}`,
      code: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }
        // Logical Bug: Candidate is not verified to actually occur > N/2 times
        return candidate;
    }
};`,
    },
    {
      id: "arr-leaders",
      number: 7,
      section: "FAQs (Medium)",
      title: "Leaders in an Array",
      difficulty: "Core",
      bugType: "Output Order / Strict Comparison Bug",
      problem:
        "Leaders in an Array: An element is a leader if it is greater than or equal to all elements to its right. Return all leaders in left-to-right order.",
      testCases: [{ input: "6\n16 17 4 3 5 2", expectedOutput: "17 5 2" }],
      starterCode: `class Solution {
public:
    vector<int> leaders(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> res = Solution().leaders(nums);
    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 == res.size() ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> leaders(vector<int>& nums) {
        int n = nums.size();
        vector<int> res;
        int maxRight = nums[n - 1];
        res.push_back(maxRight);
        // Logical Bug: Returns in reverse order and uses strict '>' instead of '>='
        for (int i = n - 2; i >= 0; i--) {
            if (nums[i] > maxRight) {
                maxRight = nums[i];
                res.push_back(maxRight);
            }
        }
        return res;
    }
};`,
    },
    {
      id: "arr-rearrange-sign",
      number: 8,
      section: "FAQs (Medium)",
      title: "Rearrange Array Elements by Sign",
      difficulty: "Core",
      bugType: "Out-of-Bounds Index Increment",
      problem:
        "Rearrange Array Elements by Sign: Given an even-length array nums with equal positive and negative integers, rearrange them so every consecutive pair has opposite signs starting with positive.",
      testCases: [{ input: "6\n3 1 -2 -5 2 -4", expectedOutput: "3 -2 1 -5 2 -4" }],
      starterCode: `class Solution {
public:
    vector<int> rearrangeArray(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> ans = Solution().rearrangeArray(nums);
    for (int i = 0; i < n; i++) cout << ans[i] << (i + 1 == n ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> rearrangeArray(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n);
        int posIdx = 0, negIdx = 1;
        for (int x : nums) {
            if (x > 0) {
                ans[posIdx] = x;
                posIdx += 2;
            } else {
                ans[negIdx] = x;
                // Logical Bug: Increments by 1 instead of 2
                negIdx += 1;
            }
        }
        return ans;
    }
};`,
    },
    {
      id: "arr-spiral-matrix",
      number: 9,
      section: "FAQs (Medium)",
      title: "Print the Matrix in Spiral Manner",
      difficulty: "Core",
      bugType: "Single Row / Column Duplicate Traversal",
      problem:
        "Spiral Matrix: Given an R x C matrix, return all elements of the matrix in clockwise spiral order.",
      testCases: [
        { input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5" },
      ],
      starterCode: `class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int r, c;
    if (!(cin >> r >> c)) return 0;
    vector<vector<int>> mat(r, vector<int>(c));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) cin >> mat[i][j];
    vector<int> res = Solution().spiralOrder(mat);
    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 == res.size() ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& mat) {
        int r = mat.size(), c = mat[0].size();
        int top = 0, bottom = r - 1, left = 0, right = c - 1;
        vector<int> res;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.push_back(mat[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.push_back(mat[i][right]);
            right--;
            // Logical Bug: Missing (top <= bottom) and (left <= right) guards on rectangular matrices
            for (int j = right; j >= left; j--) res.push_back(mat[bottom][j]);
            bottom--;
            for (int i = bottom; i >= top; i--) res.push_back(mat[i][left]);
            left++;
        }
        return res;
    }
};`,
    },
    {
      id: "arr-pascal-1",
      number: 10,
      section: "FAQs (Medium)",
      title: "Pascal's Triangle I (Element at R, C)",
      difficulty: "Core",
      bugType: "1-Based vs 0-Based Indexing / Overflow",
      problem:
        "Pascal's Triangle I: Given 1-based row R and column C, return the element at position (R, C) in Pascal's Triangle.",
      testCases: [{ input: "5 3", expectedOutput: "6" }],
      starterCode: `class Solution {
public:
    long long pascalElement(int r, int c) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int r, c;
    if (!(cin >> r >> c)) return 0;
    cout << Solution().pascalElement(r, c) << endl;
    return 0;
}`,
      code: `class Solution {
public:
    long long pascalElement(int r, int c) {
        // Logical Bug: Computes C(r, c) instead of C(r - 1, c - 1) for 1-based indexing
        long long ans = 1;
        for (int i = 0; i < c; i++) {
            ans = ans * (r - i) / (i + 1);
        }
        return ans;
    }
};`,
    },
    {
      id: "arr-pascal-2",
      number: 11,
      section: "FAQs (Medium)",
      title: "Pascal's Triangle II (Nth Row)",
      difficulty: "Core",
      bugType: "Integer Division Truncation Order",
      problem:
        "Pascal's Triangle II: Given 1-based row index N, return all N elements of the Nth row of Pascal's Triangle.",
      testCases: [{ input: "4", expectedOutput: "1 3 3 1" }],
      starterCode: `class Solution {
public:
    vector<long long> getRow(int n) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> row = Solution().getRow(n);
    for (size_t i = 0; i < row.size(); i++) cout << row[i] << (i + 1 == row.size() ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<long long> getRow(int n) {
        vector<long long> row = {1};
        long long val = 1;
        for (int col = 1; col < n; col++) {
            // Logical Bug: Integer division (n - col) / col before multiplying truncates to 0
            val = val * ((n - col) / col);
            row.push_back(val);
        }
        return row;
    }
};`,
    },
    {
      id: "arr-pascal-3",
      number: 12,
      section: "FAQs (Medium)",
      title: "Pascal's Triangle III (First N Rows)",
      difficulty: "Core",
      bugType: "Row Column Loop Bound Off-by-One",
      problem:
        "Pascal's Triangle III: Given an integer N, return the first N rows of Pascal's Triangle.",
      testCases: [{ input: "3", expectedOutput: "1\n1 1\n1 2 1" }],
      starterCode: `class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> tri = Solution().generate(n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < (int)tri[i].size(); j++) cout << tri[i][j] << (j + 1 == (int)tri[i].size() ? "" : " ");
        cout << "\\n";
    }
    return 0;
}`,
      code: `class Solution {
public:
    vector<vector<int>> generate(int n) {
        vector<vector<int>> tri(n);
        for (int i = 0; i < n; i++) {
            tri[i].resize(i + 1, 1);
            // Logical Bug: j <= i reads tri[i - 1][i] out of bounds
            for (int j = 1; j <= i; j++) {
                tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
            }
        }
        return tri;
    }
};`,
    },
    {
      id: "arr-rotate-90",
      number: 13,
      section: "FAQs (Medium)",
      title: "Rotate Matrix by 90 Degrees",
      difficulty: "Core",
      bugType: "Full Matrix Transpose Double-Swap",
      problem:
        "Rotate Matrix by 90 Degrees: Given an N x N 2D matrix, rotate the matrix by 90 degrees clockwise in-place.",
      testCases: [
        { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "7 4 1\n8 5 2\n9 6 3" },
      ],
      starterCode: `class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> mat(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> mat[i][j];
    Solution().rotate(mat);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) cout << mat[i][j] << (j + 1 == n ? "" : " ");
        cout << "\\n";
    }
    return 0;
}`,
      code: `class Solution {
public:
    void rotate(vector<vector<int>>& mat) {
        int n = mat.size();
        // Logical Bug: j runs from 0 to n - 1, swapping every pair twice
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                swap(mat[i][j], mat[j][i]);
            }
        }
        for (int i = 0; i < n; i++) reverse(mat[i].begin(), mat[i].end());
    }
};`,
    },
    {
      id: "arr-set-matrix-zeroes",
      number: 14,
      section: "FAQs (Medium)",
      title: "Set Matrix Zeroes",
      difficulty: "Core",
      bugType: "In-Place Zero Contamination",
      problem:
        "Set Matrix Zeroes: Given an R x C integer matrix, if an element is 0, set its entire row and column to 0's in-place.",
      testCases: [
        { input: "3 3\n1 1 1\n1 0 1\n1 1 1", expectedOutput: "1 0 1\n0 0 0\n1 0 1" },
      ],
      starterCode: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int r, c;
    if (!(cin >> r >> c)) return 0;
    vector<vector<int>> mat(r, vector<int>(c));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) cin >> mat[i][j];
    Solution().setZeroes(mat);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) cout << mat[i][j] << (j + 1 == c ? "" : " ");
        cout << "\\n";
    }
    return 0;
}`,
      code: `class Solution {
public:
    void setZeroes(vector<vector<int>>& mat) {
        int r = mat.size(), c = mat[0].size();
        // Logical Bug: Mutating zeroes immediately during scan cascades across the matrix
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (mat[i][j] == 0) {
                    for (int k = 0; k < c; k++) mat[i][k] = 0;
                    for (int k = 0; k < r; k++) mat[k][j] = 0;
                }
            }
        }
    }
};`,
    },
    {
      id: "arr-two-sum",
      number: 15,
      section: "FAQs (Medium)",
      title: "Two Sum",
      difficulty: "Basic",
      bugType: "Same Element Self-Pairing Bug",
      problem:
        "Two Sum: Given an array of N integers and a target, return the 0-based indices [i, j] (with i < j) of the two distinct elements that add up to target.",
      testCases: [{ input: "4 9\n2 7 11 15", expectedOutput: "0 1" }],
      starterCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> res = Solution().twoSum(nums, target);
    if (res.size() >= 2) cout << res[0] << " " << res[1] << endl;
    return 0;
}`,
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < (int)nums.size(); i++) mp[nums[i]] = i;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            // Logical Bug: Allows pairing nums[i] with itself when nums[i] * 2 == target
            if (mp.count(need)) return {i, mp[need]};
        }
        return {};
    }
};`,
    },
    {
      id: "arr-three-sum",
      number: 16,
      section: "FAQs (Medium)",
      title: "3 Sum",
      difficulty: "Core",
      bugType: "Duplicate Triplets Not Skipped",
      problem:
        "3 Sum: Given an integer array nums of size N, return all unique triplets [a, b, c] such that a + b + c == 0.",
      testCases: [{ input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1" }],
      starterCode: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<vector<int>> res = Solution().threeSum(nums);
    for (auto& t : res) cout << t[0] << " " << t[1] << " " << t[2] << "\\n";
    return 0;
}`,
      code: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        int n = nums.size();
        // Logical Bug: Fails to skip duplicate values for i, left, and right
        for (int i = 0; i < n - 2; i++) {
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.push_back({nums[i], nums[left], nums[right]});
                    left++;
                    right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return res;
    }
};`,
    },
    {
      id: "arr-four-sum",
      number: 17,
      section: "FAQs (Medium)",
      title: "4 Sum",
      difficulty: "Pro",
      bugType: "32-Bit Signed Integer Overflow",
      problem:
        "4 Sum: Given an array nums of N integers and an integer target, return all unique quadruplets [a, b, c, d] such that a + b + c + d == target.",
      testCases: [{ input: "6 0\n1 0 -1 0 -2 2", expectedOutput: "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1" }],
      starterCode: `class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<vector<int>> res = Solution().fourSum(nums, target);
    for (auto& q : res) cout << q[0] << " " << q[1] << " " << q[2] << " " << q[3] << "\\n";
    return 0;
}`,
      code: `class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        int n = nums.size();
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1, right = n - 1;
                while (left < right) {
                    // Logical Bug: 4 * 10^9 overflows 32-bit signed int
                    int sum = nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum == target) {
                        res.push_back({nums[i], nums[j], nums[left], nums[right]});
                        while (left < right && nums[left] == nums[left + 1]) left++;
                        while (left < right && nums[right] == nums[right - 1]) right--;
                        left++;
                        right--;
                    } else if (sum < target) left++;
                    else right--;
                }
            }
        }
        return res;
    }
};`,
    },
    {
      id: "arr-sort-012",
      number: 18,
      section: "FAQs (Medium)",
      title: "Sort an Array of 0's, 1's and 2's",
      difficulty: "Core",
      bugType: "Dutch National Flag Mid-Increment Bug",
      problem:
        "Sort Colors (0s, 1s, 2s): Given an array nums with N objects colored 0, 1, or 2, sort them in-place.",
      testCases: [{ input: "6\n2 0 2 1 1 0", expectedOutput: "0 0 1 1 2 2" }],
      starterCode: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution().sortColors(nums);
    for (int i = 0; i < n; i++) cout << nums[i] << (i + 1 == n ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        int low = 0, mid = 0, high = (int)nums.size() - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low++], nums[mid++]);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                // Logical Bug: Incrementing mid skips inspecting the swapped element from high
                swap(nums[mid++], nums[high--]);
            }
        }
    }
};`,
    },
    {
      id: "arr-kadane",
      number: 19,
      section: "FAQs (Medium)",
      title: "Kadane's Algorithm (Maximum Subarray)",
      difficulty: "Core",
      bugType: "All-Negative Array Edge Case",
      problem:
        "Kadane's Algorithm: Given an integer array nums of size N, find the contiguous non-empty subarray with the largest sum and return its sum.",
      testCases: [{ input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" }],
      starterCode: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << Solution().maxSubArray(nums) << endl;
    return 0;
}`,
      code: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Logical Bug: Initializing maxSum to 0 returns 0 instead of largest negative number when all elements < 0
        int maxSum = 0, currSum = 0;
        for (int x : nums) {
            currSum = max(0, currSum + x);
            maxSum = max(maxSum, currSum);
        }
        return maxSum;
    }
};`,
    },
    {
      id: "arr-next-permutation",
      number: 20,
      section: "FAQs (Medium)",
      title: "Next Permutation",
      difficulty: "Core",
      bugType: "Strictly Greater vs Greater-Equal Pivot Swap",
      problem:
        "Next Permutation: Given an array of N integers, rearrange it into the lexicographically next greater permutation of numbers in-place.",
      testCases: [{ input: "3\n1 2 3", expectedOutput: "1 3 2" }],
      starterCode: `class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        // Write your code here
        
    }
};`,
      driverCode: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution().nextPermutation(nums);
    for (int k = 0; k < n; k++) cout << nums[k] << (k + 1 == n ? "" : " ");
    cout << endl;
    return 0;
}`,
      code: `class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int n = nums.size(), i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            // Logical Bug: Using '<' instead of '<=' swaps with equal element when duplicates exist
            while (nums[j] < nums[i]) j--;
            swap(nums[i], nums[j]);
        }
        reverse(nums.begin() + i + 1, nums.end());
    }
};`,
    },
  ],
};