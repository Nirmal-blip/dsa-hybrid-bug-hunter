import { ARRAYS_TOPIC } from "./arrays.js";
import { BINARY_SEARCH_TOPIC } from "./binarySearch.js";
import { HASHING_TOPIC } from "./hashing.js";
import { STACK_AND_QUEUES_TOPIC } from "./stackAndQueues.js";
import { attach25TestCases } from "./testSuiteGenerator.js";

export const PROBLEM_TOPICS = [
  attach25TestCases(ARRAYS_TOPIC),
  attach25TestCases(BINARY_SEARCH_TOPIC),
  attach25TestCases(HASHING_TOPIC),
  attach25TestCases(STACK_AND_QUEUES_TOPIC),
];