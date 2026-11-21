function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  
  
  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  
  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  
  function shuffle(rng, arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  
  function build25Cases(problem) {

    const rng = mulberry32(hashString(problem.id));
    const cases = [];
    const seen = new Set();
    const initialCount = (problem.testCases || []).length;
    const id = problem.id;

    const pushUnique = (input, expectedOutput) => {
        const cleanIn = String(input).trim();
        const cleanOut = String(expectedOutput).trim();
        if (!cleanIn || seen.has(cleanIn)) return;
        seen.add(cleanIn);
        cases.push({
          input: cleanIn,
          expectedOutput: cleanOut,
          hidden: cases.length >= 10,
        });
      };

    for (const tc of problem.testCases || []) {
      pushUnique(tc.input, tc.expectedOutput);
    }

    // ===================== ARRAYS =====================
    if (id === "arr-linear-search") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 40));
        const target = rng() < 0.7 ? a[randInt(rng, 0, n - 1)] : randInt(rng, 41, 60);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, String(a.indexOf(target)));
      }
    } else if (id === "arr-largest-element") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 15);
        const a = Array.from({ length: n }, () => randInt(rng, -50, 100));
        pushUnique(`${n}\n${a.join(" ")}`, String(Math.max(...a)));
      }
    } else if (id === "arr-second-largest") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 15);
        const a =
          rng() < 0.25
            ? Array(n).fill(randInt(rng, -10, 20))
            : Array.from({ length: n }, () => randInt(rng, -20, 50));
        const uniq = [...new Set(a)].sort((x, y) => y - x);
        const ans = uniq.length >= 2 ? uniq[1] : -1;
        pushUnique(`${n}\n${a.join(" ")}`, String(ans));
      }
    } else if (id === "arr-max-consecutive-ones") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 18);
        const a = Array.from({ length: n }, () => (rng() < 0.55 ? 1 : 0));
        let best = 0, cur = 0;
        for (const v of a) {
          cur = v === 1 ? cur + 1 : 0;
          best = Math.max(best, cur);
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "arr-left-rotate-one") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 40));
        const rot = n > 1 ? [...a.slice(1), a[0]] : [...a];
        pushUnique(`${n}\n${a.join(" ")}`, rot.join(" "));
      }
    } else if (id === "arr-left-rotate-k") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const k = randInt(rng, 0, n * 2 + 3);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 30));
        const r = k % n;
        const rot = [...a.slice(r), ...a.slice(0, r)];
        pushUnique(`${n} ${k}\n${a.join(" ")}`, rot.join(" "));
      }
    } else if (id === "arr-move-zeros") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 15);
        const a = Array.from({ length: n }, () => (rng() < 0.35 ? 0 : randInt(rng, -10, 25)));
        const nonZero = a.filter((x) => x !== 0);
        const res = [...nonZero, ...Array(n - nonZero.length).fill(0)];
        pushUnique(`${n}\n${a.join(" ")}`, res.join(" "));
      }
    } else if (id === "arr-remove-duplicates") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 16);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 15)).sort((x, y) => x - y);
        const uniq = [...new Set(a)];
        pushUnique(`${n}\n${a.join(" ")}`, `${uniq.length}\n${uniq.join(" ")}`);
      }
    } else if (id === "arr-find-missing") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 16);
        const miss = randInt(rng, 0, n);
        const full = [];
        for (let i = 0; i <= n; i++) if (i !== miss) full.push(i);
        const shuf = shuffle(rng, full);
        pushUnique(`${n}\n${shuf.join(" ")}`, String(miss));
      }
    } else if (id === "arr-union-sorted") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const m = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 20)).sort((x, y) => x - y);
        const b = Array.from({ length: m }, () => randInt(rng, -10, 20)).sort((x, y) => x - y);
        const u = [...new Set([...a, ...b])].sort((x, y) => x - y);
        pushUnique(`${n} ${m}\n${a.join(" ")}\n${b.join(" ")}`, u.join(" "));
      }
    } else if (id === "arr-intersection-sorted") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const m = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, -5, 15)).sort((x, y) => x - y);
        const b = Array.from({ length: m }, () => randInt(rng, -5, 15)).sort((x, y) => x - y);
        let i = 0, j = 0;
        const ans = [];
        while (i < n && j < m) {
          if (a[i] === b[j]) {
            if (ans.length === 0 || ans[ans.length - 1] !== a[i]) ans.push(a[i]);
            i++;
            j++;
          } else if (a[i] < b[j]) i++;
          else j++;
        }
        pushUnique(`${n} ${m}\n${a.join(" ")}\n${b.join(" ")}`, ans.join(" "));
      }
    } else if (id === "arr-leaders") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 40));
        const leaders = [];
        let mx = -Infinity;
        for (let i = n - 1; i >= 0; i--) {
          if (a[i] >= mx) {
            leaders.push(a[i]);
            mx = a[i];
          }
        }
        leaders.reverse();
        pushUnique(`${n}\n${a.join(" ")}`, leaders.join(" "));
      }
    } else if (id === "arr-rearrange-sign") {
      while (cases.length < 25) {
        const half = randInt(rng, 1, 7);
        const pos = Array.from({ length: half }, () => randInt(rng, 1, 30));
        const neg = Array.from({ length: half }, () => -randInt(rng, 1, 30));
        const combined = shuffle(rng, [...pos, ...neg]);
        const pList = combined.filter((x) => x > 0);
        const nList = combined.filter((x) => x < 0);
        const out = [];
        for (let i = 0; i < half; i++) out.push(pList[i], nList[i]);
        pushUnique(`${half * 2}\n${combined.join(" ")}`, out.join(" "));
      }
    } else if (id === "arr-spiral-matrix") {
      while (cases.length < 25) {
        const r = randInt(rng, 1, 5);
        const c = randInt(rng, 1, 5);
        const mat = Array.from({ length: r }, (_, i) =>
          Array.from({ length: c }, (__, j) => i * c + j + 1)
        );
        const res = [];
        let top = 0, bottom = r - 1, left = 0, right = c - 1;
        while (top <= bottom && left <= right) {
          for (let j = left; j <= right; j++) res.push(mat[top][j]);
          top++;
          for (let i = top; i <= bottom; i++) res.push(mat[i][right]);
          right--;
          if (top <= bottom) {
            for (let j = right; j >= left; j--) res.push(mat[bottom][j]);
            bottom--;
          }
          if (left <= right) {
            for (let i = bottom; i >= top; i--) res.push(mat[i][left]);
            left++;
          }
        }
        pushUnique(`${r} ${c}\n${mat.map((row) => row.join(" ")).join("\n")}`, res.join(" "));
      }
    } else if (id === "arr-pascals-triangle") {
      for (let r = 1; r <= 25; r++) {
        const tri = [];
        for (let i = 0; i < r; i++) {
          const row = Array(i + 1).fill(1);
          for (let j = 1; j < i; j++) row[j] = tri[i - 1][j - 1] + tri[i - 1][j];
          tri.push(row);
        }
        pushUnique(String(r), tri.map((row) => row.join(" ")).join("\n"));
      }
    } else if (id === "arr-rotate-matrix-90") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 5);
        const mat = Array.from({ length: n }, () =>
          Array.from({ length: n }, () => randInt(rng, -9, 25))
        );
        const rot = Array.from({ length: n }, (_, i) =>
          Array.from({ length: n }, (__, j) => mat[n - 1 - j][i])
        );
        pushUnique(
          `${n}\n${mat.map((row) => row.join(" ")).join("\n")}`,
          rot.map((row) => row.join(" ")).join("\n")
        );
      }
    } else if (id === "arr-two-sum") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 25));
        const i = randInt(rng, 0, n - 2);
        const j = randInt(rng, i + 1, n - 1);
        const target = a[i] + a[j];
        let ans = "-1 -1";
        outer: for (let x = 0; x < n; x++) {
          for (let y = x + 1; y < n; y++) {
            if (a[x] + a[y] === target) {
              ans = `${x} ${y}`;
              break outer;
            }
          }
        }
        pushUnique(`${n} ${target}\n${a.join(" ")}`, ans);
      }
    } else if (id === "arr-three-sum") {
      while (cases.length < 25) {
        const n = randInt(rng, 3, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -6, 6));
        const sorted = [...a].sort((x, y) => x - y);
        const trips = [];
        for (let i = 0; i < n - 2; i++) {
          if (i > 0 && sorted[i] === sorted[i - 1]) continue;
          let l = i + 1, r = n - 1;
          while (l < r) {
            const s = sorted[i] + sorted[l] + sorted[r];
            if (s === 0) {
              trips.push(`${sorted[i]} ${sorted[l]} ${sorted[r]}`);
              while (l < r && sorted[l] === sorted[l + 1]) l++;
              while (l < r && sorted[r] === sorted[r - 1]) r--;
              l++;
              r--;
            } else if (s < 0) l++;
            else r--;
          }
        }
        pushUnique(`${n}\n${a.join(" ")}`, trips.join("\n"));
      }
    } else if (id === "arr-four-sum") {
      while (cases.length < 25) {
        const n = randInt(rng, 4, 11);
        const a = Array.from({ length: n }, () => randInt(rng, -5, 5));
        const target = randInt(rng, -6, 6);
        const sorted = [...a].sort((x, y) => x - y);
        const quads = [];
        for (let i = 0; i < n - 3; i++) {
          if (i > 0 && sorted[i] === sorted[i - 1]) continue;
          for (let j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && sorted[j] === sorted[j - 1]) continue;
            let l = j + 1, r = n - 1;
            while (l < r) {
              const s = sorted[i] + sorted[j] + sorted[l] + sorted[r];
              if (s === target) {
                quads.push(`${sorted[i]} ${sorted[j]} ${sorted[l]} ${sorted[r]}`);
                while (l < r && sorted[l] === sorted[l + 1]) l++;
                while (l < r && sorted[r] === sorted[r - 1]) r--;
                l++;
                r--;
              } else if (s < target) l++;
              else r--;
            }
          }
        }
        pushUnique(`${n} ${target}\n${a.join(" ")}`, quads.join("\n"));
      }
    } else if (id === "arr-sort-012") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 16);
        const a = Array.from({ length: n }, () => randInt(rng, 0, 2));
        const s = [...a].sort((x, y) => x - y);
        pushUnique(`${n}\n${a.join(" ")}`, s.join(" "));
      }
    } else if (id === "arr-kadane") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 20));
        let best = a[0], cur = a[0];
        for (let i = 1; i < n; i++) {
          cur = Math.max(a[i], cur + a[i]);
          best = Math.max(best, cur);
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "arr-next-permutation") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 8);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 9));
        const res = [...a];
        let i = n - 2;
        while (i >= 0 && res[i] >= res[i + 1]) i--;
        if (i >= 0) {
          let j = n - 1;
          while (res[j] <= res[i]) j--;
          [res[i], res[j]] = [res[j], res[i]];
        }
        let l = i + 1, r = n - 1;
        while (l < r) {
          [res[l], res[r]] = [res[r], res[l]];
          l++;
          r--;
        }
        pushUnique(`${n}\n${a.join(" ")}`, res.join(" "));
      }
    } else if (id === "arr-majority-1") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 15);
        const maj = randInt(rng, -10, 25);
        const cnt = Math.floor(n / 2) + 1;
        const a = Array(cnt).fill(maj);
        while (a.length < n) a.push(randInt(rng, -10, 25));
        const shuf = shuffle(rng, a);
        pushUnique(`${n}\n${shuf.join(" ")}`, String(maj));
      }
    } else if (id === "arr-majority-2") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 4));
        const freq = new Map();
        for (const x of a) freq.set(x, (freq.get(x) || 0) + 1);
        const res = [...freq.entries()]
          .filter(([, c]) => c > Math.floor(n / 3))
          .map(([v]) => v)
          .sort((x, y) => x - y);
        pushUnique(`${n}\n${a.join(" ")}`, res.join(" "));
      }
    } else if (id === "arr-repeating-missing") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 14);
        const rep = randInt(rng, 1, n);
        let miss = randInt(rng, 1, n);
        while (miss === rep) miss = randInt(rng, 1, n);
        const a = [];
        for (let i = 1; i <= n; i++) if (i !== miss) a.push(i);
        a.push(rep);
        const shuf = shuffle(rng, a);
        pushUnique(`${n}\n${shuf.join(" ")}`, `${rep} ${miss}`);
      }
    } else if (id === "arr-count-inversions") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 25));
        let inv = 0;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) if (a[i] > a[j]) inv++;
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(inv));
      }
    } else if (id === "arr-reverse-pairs") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 25));
        let pairs = 0;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) if (a[i] > 2 * a[j]) pairs++;
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(pairs));
      }
    } else if (id === "arr-max-product-subarray") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, -4, 4));
        let best = a[0];
        for (let i = 0; i < n; i++) {
          let p = 1;
          for (let j = i; j < n; j++) {
            p *= a[j];
            best = Math.max(best, p);
          }
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "arr-merge-sorted-inplace") {
      while (cases.length < 25) {
        const m = randInt(rng, 1, 8);
        const n = randInt(rng, 1, 8);
        const a = Array.from({ length: m }, () => randInt(rng, -10, 20)).sort((x, y) => x - y);
        const b = Array.from({ length: n }, () => randInt(rng, -10, 20)).sort((x, y) => x - y);
        const merged = [...a, ...b].sort((x, y) => x - y);
        pushUnique(`${m} ${n}\n${a.join(" ")}\n${b.join(" ")}`, merged.join(" "));
      }
    }
  
    // ===================== BINARY SEARCH =====================
    else if (id === "bs-search-x") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, -30, 50));
        const a = [...set].sort((x, y) => x - y);
        const target = rng() < 0.7 ? a[randInt(rng, 0, n - 1)] : randInt(rng, -35, 55);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, String(a.indexOf(target)));
      }
    } else if (id === "bs-lower-bound") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 25)).sort((x, y) => x - y);
        const x = randInt(rng, -12, 28);
        const idx = a.findIndex((v) => v >= x);
        pushUnique(`${n} ${x}\n${a.join(" ")}`, String(idx === -1 ? n : idx));
      }
    } else if (id === "bs-upper-bound") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 25)).sort((x, y) => x - y);
        const x = randInt(rng, -12, 28);
        const idx = a.findIndex((v) => v > x);
        pushUnique(`${n} ${x}\n${a.join(" ")}`, String(idx === -1 ? n : idx));
      }
    } else if (id === "bs-search-insert") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, -20, 35));
        const a = [...set].sort((x, y) => x - y);
        const target = randInt(rng, -25, 40);
        const idx = a.findIndex((v) => v >= target);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, String(idx === -1 ? n : idx));
      }
    } else if (id === "bs-floor-ceil") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 30)).sort((x, y) => x - y);
        const x = randInt(rng, -15, 35);
        let fl = -1, cl = -1;
        for (const v of a) {
          if (v <= x) fl = v;
          if (v >= x && cl === -1) cl = v;
        }
        pushUnique(`${n} ${x}\n${a.join(" ")}`, `${fl} ${cl}`);
      }
    } else if (id === "bs-first-last-occ") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 15);
        const a = Array.from({ length: n }, () => randInt(rng, -5, 10)).sort((x, y) => x - y);
        const target = rng() < 0.75 ? a[randInt(rng, 0, n - 1)] : randInt(rng, 11, 15);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, `${a.indexOf(target)} ${a.lastIndexOf(target)}`);
      }
    } else if (id === "bs-rotated-1") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, -20, 40));
        const sorted = [...set].sort((x, y) => x - y);
        const rot = randInt(rng, 0, n - 1);
        const a = [...sorted.slice(rot), ...sorted.slice(0, rot)];
        const target = rng() < 0.7 ? a[randInt(rng, 0, n - 1)] : randInt(rng, 41, 55);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, String(a.indexOf(target)));
      }
    } else if (id === "bs-rotated-2") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const sorted = Array.from({ length: n }, () => randInt(rng, -4, 6)).sort((x, y) => x - y);
        const rot = randInt(rng, 0, n - 1);
        const a = [...sorted.slice(rot), ...sorted.slice(0, rot)];
        const target = rng() < 0.7 ? a[randInt(rng, 0, n - 1)] : randInt(rng, 7, 12);
        pushUnique(`${n} ${target}\n${a.join(" ")}`, a.includes(target) ? "true" : "false");
      }
    } else if (id === "bs-min-rotated") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, -25, 45));
        const sorted = [...set].sort((x, y) => x - y);
        const rot = randInt(rng, 0, n - 1);
        const a = [...sorted.slice(rot), ...sorted.slice(0, rot)];
        pushUnique(`${n}\n${a.join(" ")}`, String(sorted[0]));
      }
    } else if (id === "bs-rotation-count") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, -20, 45));
        const sorted = [...set].sort((x, y) => x - y);
        const rot = randInt(rng, 0, n - 1);
        const a = [...sorted.slice(rot), ...sorted.slice(0, rot)];
        const minIdx = a.indexOf(sorted[0]);
        pushUnique(`${n}\n${a.join(" ")}`, String(minIdx));
      }
    } else if (id === "bs-single-element") {
      while (cases.length < 25) {
        const pairs = randInt(rng, 0, 6);
        const set = new Set();
        while (set.size < pairs + 1) set.add(randInt(rng, -20, 40));
        const vals = [...set].sort((x, y) => x - y);
        const singleIdx = randInt(rng, 0, pairs);
        const a = [];
        vals.forEach((v, idx) => {
          a.push(v);
          if (idx !== singleIdx) a.push(v);
        });
        pushUnique(`${a.length}\n${a.join(" ")}`, String(vals[singleIdx]));
      }
    } else if (id === "bs-sqrt") {
      const nums = [0, 1, 2, 3, 4, 8, 9, 15, 16, 24, 25, 26, 35, 36, 48, 49, 63, 64, 80, 81, 99, 100, 143, 144, 10000];
      for (const n of nums) pushUnique(String(n), String(Math.floor(Math.sqrt(n))));
    } else if (id === "bs-nth-root") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 5);
        const root = randInt(rng, 1, 15);
        const m = rng() < 0.7 ? Math.pow(root, n) : Math.pow(root, n) + randInt(rng, 1, 5);
        const exact = Math.round(Math.pow(m, 1 / n));
        const ans = Math.pow(exact, n) === m ? exact : -1;
        pushUnique(`${n} ${m}`, String(ans));
      }
    } else if (id === "bs-smallest-divisor") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 25));
        const limit = randInt(rng, n, n * 6);
        let d = 1;
        while (a.reduce((acc, v) => acc + Math.ceil(v / d), 0) > limit) d++;
        pushUnique(`${n} ${limit}\n${a.join(" ")}`, String(d));
      }
    } else if (id === "bs-koko-bananas") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 30));
        const h = randInt(rng, n, n * 4);
        let k = 1;
        while (a.reduce((acc, v) => acc + Math.ceil(v / k), 0) > h) k++;
        pushUnique(`${n} ${h}\n${a.join(" ")}`, String(k));
      }
    } else if (id === "bs-min-days-bouquets") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const m = randInt(rng, 1, 4);
        const k = randInt(rng, 1, 4);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 20));
        let ans = -1;
        if (m * k <= n) {
          const sortedDays = [...new Set(a)].sort((x, y) => x - y);
          for (const d of sortedDays) {
            let bouq = 0, adj = 0;
            for (const v of a) {
              if (v <= d) {
                adj++;
                if (adj === k) {
                  bouq++;
                  adj = 0;
                }
              } else adj = 0;
            }
            if (bouq >= m) {
              ans = d;
              break;
            }
          }
        }
        pushUnique(`${n} ${m} ${k}\n${a.join(" ")}`, String(ans));
      }
    } else if (id === "bs-aggressive-cows") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 10);
        const k = randInt(rng, 2, n);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, 1, 35));
        const a = [...set].sort((x, y) => x - y);
        let best = 0;
        for (let d = 1; d <= a[n - 1] - a[0]; d++) {
          let cnt = 1, last = a[0];
          for (let i = 1; i < n; i++) {
            if (a[i] - last >= d) {
              cnt++;
              last = a[i];
            }
          }
          if (cnt >= k) best = d;
        }
        pushUnique(`${n} ${k}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "bs-book-allocation") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 10);
        const m = randInt(rng, 1, n + 2);
        const a = Array.from({ length: n }, () => randInt(rng, 5, 40));
        let ans = -1;
        if (m <= n) {
          for (let cap = Math.max(...a); cap <= a.reduce((s, v) => s + v, 0); cap++) {
            let stu = 1, pages = 0;
            for (const p of a) {
              if (pages + p <= cap) pages += p;
              else {
                stu++;
                pages = p;
              }
            }
            if (stu <= m) {
              ans = cap;
              break;
            }
          }
        }
        pushUnique(`${n} ${m}\n${a.join(" ")}`, String(ans));
      }
    } else if (id === "bs-peak-element") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 40));
        const peakIdx = a.indexOf(Math.max(...a));
        pushUnique(`${n}\n${a.join(" ")}`, String(peakIdx));
      }
    } else if (id === "bs-median-two-sorted") {
      while (cases.length < 25) {
        const n = randInt(rng, 0, 8);
        const m = randInt(rng, 1, 8);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 30)).sort((x, y) => x - y);
        const b = Array.from({ length: m }, () => randInt(rng, -15, 30)).sort((x, y) => x - y);
        const merged = [...a, ...b].sort((x, y) => x - y);
        const tot = merged.length;
        const med =
          tot % 2 === 1
            ? merged[(tot - 1) / 2]
            : (merged[tot / 2 - 1] + merged[tot / 2]) / 2;
        pushUnique(`${n} ${m}\n${a.join(" ")}\n${b.join(" ")}`, String(med));
      }
    } else if (id === "bs-gas-stations") {
      while (cases.length < 25) {
        const n = randInt(rng, 2, 7);
        const k = randInt(rng, 1, 8);
        const set = new Set();
        while (set.size < n) set.add(randInt(rng, 1, 40));
        const a = [...set].sort((x, y) => x - y);
        let lo = 0, hi = a[n - 1] - a[0];
        for (let it = 0; it < 60; it++) {
          const mid = (lo + hi) / 2;
          let used = 0;
          for (let i = 0; i < n - 1; i++) used += Math.floor((a[i + 1] - a[i]) / mid);
          if (used > k) lo = mid;
          else hi = mid;
        }
        pushUnique(`${n} ${k}\n${a.join(" ")}`, hi.toFixed(2));
      }
    } else if (id === "bs-kth-two-sorted") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 8);
        const m = randInt(rng, 1, 8);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 30)).sort((x, y) => x - y);
        const b = Array.from({ length: m }, () => randInt(rng, -10, 30)).sort((x, y) => x - y);
        const k = randInt(rng, 1, n + m);
        const merged = [...a, ...b].sort((x, y) => x - y);
        pushUnique(`${n} ${m} ${k}\n${a.join(" ")}\n${b.join(" ")}`, String(merged[k - 1]));
      }
    } else if (id === "bs-row-max-ones") {
      while (cases.length < 25) {
        const r = randInt(rng, 1, 6);
        const c = randInt(rng, 1, 8);
        const mat = Array.from({ length: r }, () => {
          const ones = rng() < 0.25 ? 0 : randInt(rng, 1, c);
          return [...Array(c - ones).fill(0), ...Array(ones).fill(1)];
        });
        let bestRow = -1, bestCnt = 0;
        mat.forEach((row, idx) => {
          const cnt = row.reduce((s, v) => s + v, 0);
          if (cnt > bestCnt) {
            bestCnt = cnt;
            bestRow = idx;
          }
        });
        pushUnique(`${r} ${c}\n${mat.map((row) => row.join(" ")).join("\n")}`, String(bestRow));
      }
    } else if (id === "bs-search-2d-1") {
      while (cases.length < 25) {
        const r = randInt(rng, 1, 5);
        const c = randInt(rng, 1, 5);
        const set = new Set();
        while (set.size < r * c) set.add(randInt(rng, -20, 60));
        const flat = [...set].sort((x, y) => x - y);
        const mat = Array.from({ length: r }, (_, i) => flat.slice(i * c, (i + 1) * c));
        const target = rng() < 0.65 ? flat[randInt(rng, 0, flat.length - 1)] : randInt(rng, 61, 80);
        pushUnique(
          `${r} ${c} ${target}\n${mat.map((row) => row.join(" ")).join("\n")}`,
          flat.includes(target) ? "true" : "false"
        );
      }
    } else if (id === "bs-search-2d-2") {
      while (cases.length < 25) {
        const r = randInt(rng, 1, 5);
        const c = randInt(rng, 1, 5);
        const mat = Array.from({ length: r }, (_, i) =>
          Array.from({ length: c }, (__, j) => (i + 1) * 3 + (j + 1) * 4 + randInt(rng, 0, 1))
        );
        const flat = mat.flat();
        const target = rng() < 0.65 ? flat[randInt(rng, 0, flat.length - 1)] : randInt(rng, 1, 6);
        pushUnique(
          `${r} ${c} ${target}\n${mat.map((row) => row.join(" ")).join("\n")}`,
          flat.includes(target) ? "true" : "false"
        );
      }
    } else if (id === "bs-peak-2d") {
      while (cases.length < 25) {
        const r = randInt(rng, 1, 5);
        const c = randInt(rng, 1, 5);
        const mat = Array.from({ length: r }, () =>
          Array.from({ length: c }, () => randInt(rng, 1, 50))
        );
        let bestR = 0, bestC = 0;
        for (let i = 0; i < r; i++) {
          for (let j = 0; j < c; j++) {
            if (mat[i][j] > mat[bestR][bestC]) {
              bestR = i;
              bestC = j;
            }
          }
        }
        pushUnique(`${r} ${c}\n${mat.map((row) => row.join(" ")).join("\n")}`, `${bestR} ${bestC}`);
      }
    } else if (id === "bs-matrix-median") {
      while (cases.length < 25) {
        const r = [1, 3, 5][randInt(rng, 0, 2)];
        const c = [1, 3, 5][randInt(rng, 0, 2)];
        const mat = Array.from({ length: r }, () =>
          Array.from({ length: c }, () => randInt(rng, 1, 40)).sort((x, y) => x - y)
        );
        const flat = mat.flat().sort((x, y) => x - y);
        const med = flat[(flat.length - 1) / 2];
        pushUnique(`${r} ${c}\n${mat.map((row) => row.join(" ")).join("\n")}`, String(med));
      }
    }
  
    // ===================== HASHING =====================
    else if (id === "hash-longest-consecutive") {
      while (cases.length < 25) {
        const n = randInt(rng, 0, 15);
        const a = Array.from({ length: n }, () => randInt(rng, -8, 12));
        const set = new Set(a);
        let best = 0;
        for (const x of set) {
          if (!set.has(x - 1)) {
            let cur = x, len = 1;
            while (set.has(cur + 1)) {
              cur++;
              len++;
            }
            best = Math.max(best, len);
          }
        }
        pushUnique(`${n}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "hash-longest-subarray-k") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -6, 8));
        const k = randInt(rng, -8, 15);
        let best = 0;
        for (let i = 0; i < n; i++) {
          let s = 0;
          for (let j = i; j < n; j++) {
            s += a[j];
            if (s === k) best = Math.max(best, j - i + 1);
          }
        }
        pushUnique(`${n} ${k}\n${a.join(" ")}`, String(best));
      }
    } else if (id === "hash-count-subarrays-sum-k") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -5, 6));
        const k = randInt(rng, -5, 10);
        let cnt = 0;
        for (let i = 0; i < n; i++) {
          let s = 0;
          for (let j = i; j < n; j++) {
            s += a[j];
            if (s === k) cnt++;
          }
        }
        pushUnique(`${n} ${k}\n${a.join(" ")}`, String(cnt));
      }
    } else if (id === "hash-count-subarrays-xor-k") {
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, 0, 10));
        const k = randInt(rng, 0, 10);
        let cnt = 0;
        for (let i = 0; i < n; i++) {
          let xr = 0;
          for (let j = i; j < n; j++) {
            xr ^= a[j];
            if (xr === k) cnt++;
          }
        }
        pushUnique(`${n} ${k}\n${a.join(" ")}`, String(cnt));
      }
    }
  
    // ===================== STACK AND QUEUES (31) =====================
    else if (id === "sq-stack-array" || id === "sq-stack-ll") {
      const solve = (ops) => {
        const st = [];
        const out = [];
        for (const line of ops) {
          const [cmd, val] = line.split(" ");
          if (cmd === "push") st.push(Number(val));
          else if (cmd === "pop") out.push(st.length ? String(st.pop()) : "-1");
          else if (cmd === "top") out.push(st.length ? String(st[st.length - 1]) : "-1");
          else if (cmd === "empty") out.push(st.length === 0 ? "true" : "false");
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const q = randInt(rng, 3, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const r = rng();
          if (r < 0.45) ops.push(`push ${randInt(rng, -50, 50)}`);
          else if (r < 0.7) ops.push("pop");
          else if (r < 0.9) ops.push("top");
          else ops.push("empty");
        }
        pushUnique(`${q}\n${ops.join("\n")}`, solve(ops));
      }
    } else if (id === "sq-queue-array" || id === "sq-queue-ll" || id === "sq-queue-using-stack") {
      const solve = (ops) => {
        const qu = [];
        const out = [];
        for (const line of ops) {
          const [cmd, val] = line.split(" ");
          if (cmd === "push") qu.push(Number(val));
          else if (cmd === "pop") out.push(qu.length ? String(qu.shift()) : "-1");
          else if (cmd === "front") out.push(qu.length ? String(qu[0]) : "-1");
          else if (cmd === "empty") out.push(qu.length === 0 ? "true" : "false");
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const q = randInt(rng, 3, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const r = rng();
          if (r < 0.45) ops.push(`push ${randInt(rng, -50, 50)}`);
          else if (r < 0.7) ops.push("pop");
          else if (r < 0.9) ops.push("front");
          else ops.push("empty");
        }
        pushUnique(`${q}\n${ops.join("\n")}`, solve(ops));
      }
    } else if (id === "sq-stack-using-queue") {
      const solve = (ops) => {
        const st = [];
        const out = [];
        for (const line of ops) {
          const [cmd, val] = line.split(" ");
          if (cmd === "push") st.push(Number(val));
          else if (cmd === "pop") out.push(st.length ? String(st.pop()) : "-1");
          else if (cmd === "top") out.push(st.length ? String(st[st.length - 1]) : "-1");
          else if (cmd === "empty") out.push(st.length === 0 ? "true" : "false");
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const q = randInt(rng, 3, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const r = rng();
          if (r < 0.45) ops.push(`push ${randInt(rng, -50, 50)}`);
          else if (r < 0.7) ops.push("pop");
          else if (r < 0.9) ops.push("top");
          else ops.push("empty");
        }
        pushUnique(`${q}\n${ops.join("\n")}`, solve(ops));
      }
    } else if (id === "sq-balanced-parentheses") {
      const solve = (s) => {
        const st = [];
        const map = { ")": "(", "}": "{", "]": "[" };
        for (const ch of s) {
          if (ch === "(" || ch === "{" || ch === "[") st.push(ch);
          else {
            if (!st.length || st.pop() !== map[ch]) return "false";
          }
        }
        return st.length === 0 ? "true" : "false";
      };
      const presets = ["()", "([{}])", "((()))", "([)]", "((", "))", "{[]()}"];
      presets.forEach((s) => pushUnique(s, solve(s)));
      const chars = ["(", ")", "{", "}", "[", "]"];
      while (cases.length < 25) {
        const len = randInt(rng, 1, 14);
        const s = Array.from({ length: len }, () => chars[randInt(rng, 0, 5)]).join("");
        pushUnique(s, solve(s));
      }
    } else if (id === "sq-implement-deque") {
      const solve = (ops) => {
        const dq = [];
        const out = [];
        for (const line of ops) {
          const [cmd, val] = line.split(" ");
          if (cmd === "push_front") dq.unshift(Number(val));
          else if (cmd === "push_back") dq.push(Number(val));
          else if (cmd === "pop_front") out.push(dq.length ? String(dq.shift()) : "-1");
          else if (cmd === "pop_back") out.push(dq.length ? String(dq.pop()) : "-1");
          else if (cmd === "front") out.push(dq.length ? String(dq[0]) : "-1");
          else if (cmd === "back") out.push(dq.length ? String(dq[dq.length - 1]) : "-1");
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const q = randInt(rng, 3, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const r = randInt(rng, 0, 5);
          if (r === 0) ops.push(`push_front ${randInt(rng, -30, 30)}`);
          else if (r === 1) ops.push(`push_back ${randInt(rng, -30, 30)}`);
          else if (r === 2) ops.push("pop_front");
          else if (r === 3) ops.push("pop_back");
          else if (r === 4) ops.push("front");
          else ops.push("back");
        }
        pushUnique(`${q}\n${ops.join("\n")}`, solve(ops));
      }
    } else if (
      id === "sq-infix-to-postfix" ||
      id === "sq-infix-to-prefix" ||
      id === "sq-prefix-to-infix" ||
      id === "sq-prefix-to-postfix" ||
      id === "sq-postfix-to-infix" ||
      id === "sq-postfix-to-prefix"
    ) {
      const prec = (c) => (c === "^" ? 3 : c === "*" || c === "/" ? 2 : c === "+" || c === "-" ? 1 : -1);
      const infixToPostfix = (s) => {
        const st = [];
        let out = "";
        for (const c of s) {
          if (/[a-zA-Z0-9]/.test(c)) out += c;
          else if (c === "(") st.push(c);
          else if (c === ")") {
            while (st.length && st[st.length - 1] !== "(") out += st.pop();
            if (st.length) st.pop();
          } else {
            while (
              st.length &&
              st[st.length - 1] !== "(" &&
              (c === "^" ? prec(st[st.length - 1]) > prec(c) : prec(st[st.length - 1]) >= prec(c))
            ) {
              out += st.pop();
            }
            st.push(c);
          }
        }
        while (st.length) out += st.pop();
        return out;
      };
      const infixToPrefix = (s) => {
        const rev = s
          .split("")
          .reverse()
          .map((c) => (c === "(" ? ")" : c === ")" ? "(" : c));
        const st = [];
        let out = "";
        for (const c of rev) {
          if (/[a-zA-Z0-9]/.test(c)) out += c;
          else if (c === "(") st.push(c);
          else if (c === ")") {
            while (st.length && st[st.length - 1] !== "(") out += st.pop();
            if (st.length) st.pop();
          } else {
            while (
              st.length &&
              st[st.length - 1] !== "(" &&
              (c === "^" ? prec(st[st.length - 1]) >= prec(c) : prec(st[st.length - 1]) > prec(c))
            ) {
              out += st.pop();
            }
            st.push(c);
          }
        }
        while (st.length) out += st.pop();
        return out.split("").reverse().join("");
      };
      const prefixToInfix = (s) => {
        const st = [];
        for (let i = s.length - 1; i >= 0; i--) {
          const c = s[i];
          if (/[a-zA-Z0-9]/.test(c)) st.push(c);
          else {
            const a = st.pop(), b = st.pop();
            st.push(`(${a}${c}${b})`);
          }
        }
        return st[0];
      };
      const prefixToPostfix = (s) => {
        const st = [];
        for (let i = s.length - 1; i >= 0; i--) {
          const c = s[i];
          if (/[a-zA-Z0-9]/.test(c)) st.push(c);
          else {
            const a = st.pop(), b = st.pop();
            st.push(`${a}${b}${c}`);
          }
        }
        return st[0];
      };
      const postfixToInfix = (s) => {
        const st = [];
        for (const c of s) {
          if (/[a-zA-Z0-9]/.test(c)) st.push(c);
          else {
            const b = st.pop(), a = st.pop();
            st.push(`(${a}${c}${b})`);
          }
        }
        return st[0];
      };
      const postfixToPrefix = (s) => {
        const st = [];
        for (const c of s) {
          if (/[a-zA-Z0-9]/.test(c)) st.push(c);
          else {
            const b = st.pop(), a = st.pop();
            st.push(`${c}${a}${b}`);
          }
        }
        return st[0];
      };
  
      const infixes = [
        "a+b",
        "a+b*c",
        "(a+b)*c",
        "a^b^c",
        "(a+b)*(c-d)",
        "a+b/c-d",
        "((a+b)*c)^d",
        "a*(b+c/d)",
      ];
      const vars = ["a", "b", "c", "d", "e"];
      const ops = ["+", "-", "*", "/"];
      while (cases.length < 25) {
        const base =
          cases.length - 1 < infixes.length
            ? infixes[cases.length - 1]
            : `(${vars[randInt(rng, 0, 4)]}${ops[randInt(rng, 0, 3)]}${vars[randInt(rng, 0, 4)]})${ops[randInt(rng, 0, 3)]}${vars[randInt(rng, 0, 4)]}`;
        const post = infixToPostfix(base);
        const pre = infixToPrefix(base);
        if (id === "sq-infix-to-postfix") pushUnique(base, post);
        else if (id === "sq-infix-to-prefix") pushUnique(base, pre);
        else if (id === "sq-prefix-to-infix") pushUnique(pre, prefixToInfix(pre));
        else if (id === "sq-prefix-to-postfix") pushUnique(pre, prefixToPostfix(pre));
        else if (id === "sq-postfix-to-infix") pushUnique(post, postfixToInfix(post));
        else if (id === "sq-postfix-to-prefix") pushUnique(post, postfixToPrefix(post));
      }
    } else if (id === "sq-nge-1") {
      const solve = (a) => {
        const st = [], ans = Array(a.length).fill(-1);
        for (let i = a.length - 1; i >= 0; i--) {
          while (st.length && st[st.length - 1] <= a[i]) st.pop();
          if (st.length) ans[i] = st[st.length - 1];
          st.push(a[i]);
        }
        return ans.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 30));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-nge-2") {
      const solve = (a) => {
        const n = a.length, st = [], ans = Array(n).fill(-1);
        for (let i = 2 * n - 1; i >= 0; i--) {
          const idx = i % n;
          while (st.length && st[st.length - 1] <= a[idx]) st.pop();
          if (i < n && st.length) ans[idx] = st[st.length - 1];
          st.push(a[idx]);
        }
        return ans.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 30));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-asteroid-collision") {
      const solve = (a) => {
        const st = [];
        for (const x of a) {
          let alive = true;
          while (st.length && st[st.length - 1] > 0 && x < 0) {
            if (st[st.length - 1] < -x) st.pop();
            else if (st[st.length - 1] === -x) {
              st.pop();
              alive = false;
              break;
            } else {
              alive = false;
              break;
            }
          }
          if (alive) st.push(x);
        }
        return st.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => {
          const mag = randInt(rng, 1, 15);
          return rng() < 0.5 ? mag : -mag;
        });
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-sum-subarray-minimums") {
      const solve = (a) => {
        const MOD = 1e9 + 7;
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          let mn = a[i];
          for (let j = i; j < a.length; j++) {
            mn = Math.min(mn, a[j]);
            sum = (sum + mn) % MOD;
          }
        }
        return String(sum);
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 25));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-sum-subarray-ranges") {
      const solve = (a) => {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          let mn = a[i], mx = a[i];
          for (let j = i; j < a.length; j++) {
            mn = Math.min(mn, a[j]);
            mx = Math.max(mx, a[j]);
            sum += mx - mn;
          }
        }
        return String(sum);
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 30));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-remove-k-digits") {
      const solve = (num, k) => {
        const st = [];
        for (const c of num) {
          while (st.length && k > 0 && st[st.length - 1] > c) {
            st.pop();
            k--;
          }
          st.push(c);
        }
        while (k > 0 && st.length) {
          st.pop();
          k--;
        }
        const res = st.join("").replace(/^0+/, "");
        return res === "" ? "0" : res;
      };
      while (cases.length < 25) {
        const len = randInt(rng, 1, 10);
        const num = Array.from({ length: len }, (_, idx) =>
          idx === 0 ? String(randInt(rng, 1, 9)) : String(randInt(rng, 0, 9))
        ).join("");
        const k = randInt(rng, 0, len);
        pushUnique(`${num} ${k}`, solve(num, k));
      }
    } else if (id === "sq-next-smaller") {
      const solve = (a) => {
        const st = [], ans = Array(a.length).fill(-1);
        for (let i = a.length - 1; i >= 0; i--) {
          while (st.length && st[st.length - 1] >= a[i]) st.pop();
          if (st.length) ans[i] = st[st.length - 1];
          st.push(a[i]);
        }
        return ans.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -15, 30));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    } else if (id === "sq-min-stack") {
      const solve = (ops) => {
        const st = [], mins = [], out = [];
        for (const line of ops) {
          const [cmd, val] = line.split(" ");
          if (cmd === "push") {
            const x = Number(val);
            st.push(x);
            mins.push(mins.length ? Math.min(mins[mins.length - 1], x) : x);
          } else if (cmd === "pop") {
            if (st.length) {
              st.pop();
              mins.pop();
            }
          } else if (cmd === "top") {
            out.push(String(st[st.length - 1]));
          } else if (cmd === "getMin") {
            out.push(String(mins[mins.length - 1]));
          }
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const q = randInt(rng, 3, 12);
        const ops = [];
        let depth = 0;
        for (let i = 0; i < q; i++) {
          if (depth === 0 || rng() < 0.5) {
            ops.push(`push ${randInt(rng, -30, 30)}`);
            depth++;
          } else if (rng() < 0.35) {
            ops.push("pop");
            depth--;
          } else if (rng() < 0.5) {
            ops.push("top");
          } else {
            ops.push("getMin");
          }
        }
        pushUnique(`${q}\n${ops.join("\n")}`, solve(ops));
      }
    } else if (id === "sq-sliding-window-max") {
      const solve = (a, k) => {
        const dq = [], out = [];
        for (let i = 0; i < a.length; i++) {
          while (dq.length && dq[0] <= i - k) dq.shift();
          while (dq.length && a[dq[dq.length - 1]] <= a[i]) dq.pop();
          dq.push(i);
          if (i >= k - 1) out.push(a[dq[0]]);
        }
        return out.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const k = randInt(rng, 1, n);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 30));
        pushUnique(`${n} ${k}\n${a.join(" ")}`, solve(a, k));
      }
    } else if (id === "sq-trapping-rainwater") {
      const solve = (h) => {
        let l = 0, r = h.length - 1, lMax = 0, rMax = 0, water = 0;
        while (l < r) {
          if (h[l] < h[r]) {
            lMax = Math.max(lMax, h[l]);
            water += lMax - h[l++];
          } else {
            rMax = Math.max(rMax, h[r]);
            water += rMax - h[r--];
          }
        }
        return String(water);
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const h = Array.from({ length: n }, () => randInt(rng, 0, 12));
        pushUnique(`${n}\n${h.join(" ")}`, solve(h));
      }
    } else if (id === "sq-largest-rectangle-histogram") {
      const solve = (h) => {
        let best = 0;
        for (let i = 0; i < h.length; i++) {
          let mn = h[i];
          for (let j = i; j < h.length; j++) {
            mn = Math.min(mn, h[j]);
            best = Math.max(best, mn * (j - i + 1));
          }
        }
        return String(best);
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 12);
        const h = Array.from({ length: n }, () => randInt(rng, 0, 12));
        pushUnique(`${n}\n${h.join(" ")}`, solve(h));
      }
    } else if (id === "sq-maximal-rectangles") {
      const solve = (m) => {
        const r = m.length, c = m[0].length;
        const h = Array(c).fill(0);
        let best = 0;
        for (let i = 0; i < r; i++) {
          for (let j = 0; j < c; j++) h[j] = m[i][j] ? h[j] + 1 : 0;
          for (let l = 0; l < c; l++) {
            let mn = h[l];
            for (let rr = l; rr < c; rr++) {
              mn = Math.min(mn, h[rr]);
              best = Math.max(best, mn * (rr - l + 1));
            }
          }
        }
        return String(best);
      };
      while (cases.length < 25) {
        const r = randInt(rng, 1, 6);
        const c = randInt(rng, 1, 6);
        const m = Array.from({ length: r }, () =>
          Array.from({ length: c }, () => (rng() < 0.55 ? 1 : 0))
        );
        pushUnique(`${r} ${c}\n${m.map((row) => row.join(" ")).join("\n")}`, solve(m));
      }
    } else if (id === "sq-stock-span") {
      const solve = (p) => {
        const st = [], ans = [];
        for (let i = 0; i < p.length; i++) {
          while (st.length && p[st[st.length - 1]] <= p[i]) st.pop();
          ans.push(st.length ? i - st[st.length - 1] : i + 1);
          st.push(i);
        }
        return ans.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const p = Array.from({ length: n }, () => randInt(rng, 10, 200));
        pushUnique(`${n}\n${p.join(" ")}`, solve(p));
      }
    } else if (id === "sq-celebrity-problem") {
      const solve = (m) => {
        const n = m.length;
        for (let c = 0; c < n; c++) {
          let knowsSomeone = false;
          for (let j = 0; j < n; j++) if (m[c][j] === 1) knowsSomeone = true;
          if (knowsSomeone) continue;
          let knownByAll = true;
          for (let i = 0; i < n; i++) if (i !== c && m[i][c] !== 1) knownByAll = false;
          if (knownByAll) return String(c);
        }
        return "-1";
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 7);
        const m = Array.from({ length: n }, () =>
          Array.from({ length: n }, () => (rng() < 0.35 ? 1 : 0))
        );
        for (let i = 0; i < n; i++) m[i][i] = 0;
        if (rng() < 0.5) {
          const celeb = randInt(rng, 0, n - 1);
          for (let j = 0; j < n; j++) m[celeb][j] = 0;
          for (let i = 0; i < n; i++) if (i !== celeb) m[i][celeb] = 1;
        }
        pushUnique(`${n}\n${m.map((row) => row.join(" ")).join("\n")}`, solve(m));
      }
    } else if (id === "sq-lru-cache") {
      const solve = (cap, ops) => {
        const map = new Map(), out = [];
        for (const line of ops) {
          const parts = line.split(" ");
          if (parts[0] === "get") {
            const k = Number(parts[1]);
            if (!map.has(k)) out.push("-1");
            else {
              const v = map.get(k);
              map.delete(k);
              map.set(k, v);
              out.push(String(v));
            }
          } else if (parts[0] === "put") {
            const k = Number(parts[1]), v = Number(parts[2]);
            if (map.has(k)) map.delete(k);
            else if (map.size >= cap) {
              const oldest = map.keys().next().value;
              map.delete(oldest);
            }
            map.set(k, v);
          }
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const cap = randInt(rng, 1, 4);
        const q = randInt(rng, 4, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const k = randInt(rng, 1, 5);
          if (rng() < 0.55) ops.push(`put ${k} ${randInt(rng, 1, 50)}`);
          else ops.push(`get ${k}`);
        }
        pushUnique(`${cap} ${q}\n${ops.join("\n")}`, solve(cap, ops));
      }
    } else if (id === "sq-lfu-cache") {
      const solve = (cap, ops) => {
        const vals = new Map(), freqs = new Map(), out = [];
        let tick = 0;
        for (const line of ops) {
          const parts = line.split(" ");
          if (parts[0] === "get") {
            const k = Number(parts[1]);
            if (!vals.has(k)) out.push("-1");
            else {
              out.push(String(vals.get(k)));
              const cur = freqs.get(k);
              freqs.set(k, { freq: cur.freq + 1, time: ++tick });
            }
          } else if (parts[0] === "put") {
            const k = Number(parts[1]), v = Number(parts[2]);
            if (vals.has(k)) {
              vals.set(k, v);
              const cur = freqs.get(k);
              freqs.set(k, { freq: cur.freq + 1, time: ++tick });
            } else {
              if (vals.size >= cap) {
                let victim = null;
                for (const [ek, meta] of freqs) {
                  if (
                    !victim ||
                    meta.freq < victim.freq ||
                    (meta.freq === victim.freq && meta.time < victim.time)
                  ) {
                    victim = { key: ek, freq: meta.freq, time: meta.time };
                  }
                }
                if (victim) {
                  vals.delete(victim.key);
                  freqs.delete(victim.key);
                }
              }
              vals.set(k, v);
              freqs.set(k, { freq: 1, time: ++tick });
            }
          }
        }
        return out.join("\n");
      };
      while (cases.length < 25) {
        const cap = randInt(rng, 1, 4);
        const q = randInt(rng, 4, 12);
        const ops = [];
        for (let i = 0; i < q; i++) {
          const k = randInt(rng, 1, 5);
          if (rng() < 0.55) ops.push(`put ${k} ${randInt(rng, 1, 50)}`);
          else ops.push(`get ${k}`);
        }
        pushUnique(`${cap} ${q}\n${ops.join("\n")}`, solve(cap, ops));
      }
    } else if (id === "sq-count-nge-right") {
      const solve = (a) => {
        const ans = [];
        for (let i = 0; i < a.length; i++) {
          let cnt = 0;
          for (let j = i + 1; j < a.length; j++) if (a[j] > a[i]) cnt++;
          ans.push(cnt);
        }
        return ans.join(" ");
      };
      while (cases.length < 25) {
        const n = randInt(rng, 1, 14);
        const a = Array.from({ length: n }, () => randInt(rng, -10, 25));
        pushUnique(`${n}\n${a.join(" ")}`, solve(a));
      }
    }
  
    return cases.slice(0, 25);
  }
  
  
  export function attach25TestCases(topicObj) {
    return {
      ...topicObj,
      problems: topicObj.problems.map((p) => ({
        ...p,
        testCases: build25Cases(p),
      })),
    };
  }