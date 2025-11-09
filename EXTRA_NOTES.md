# Parsing Strategy and Design Choices

This document provides additional details on the parsing strategy and other design choices made in this project.

## Parsing Strategy (No Regex)

The decision to avoid regular expressions in the parsing module (`src/parser.js`) was a deliberate one, based on the following rationale:

*   **Clarity and Maintainability:** For the given instruction format, a manual, token-based parsing approach is more explicit and easier to follow than a complex regex. Each step of the parsing process is a clear, imperative action (e.g., "find the 'FROM' keyword," "extract the next token as the account ID"), which makes the code easier to debug and maintain.
*   **Performance:** While modern regex engines are highly optimized, for a relatively simple and fixed grammar like the one specified, a direct string manipulation approach can be faster. It avoids the overhead of compiling the regex and the backtracking that can occur with complex patterns.
*   **Security:** While not a primary concern for this specific problem, avoiding regex can be a good practice to prevent ReDoS (Regular Expression Denial of Service) attacks, where a specially crafted input can cause a regex to take a very long time to execute.

The parsing algorithm is as follows:

1.  **Normalization:** The input string is trimmed of leading/trailing whitespace.
2.  **Tokenization:** The string is split into an array of tokens based on whitespace. This handles multiple spaces between words gracefully.
3.  **Format Identification:** The first token is checked to determine if the instruction is `DEBIT` or `CREDIT` format.
4.  **Keyword Scanning:** The parser then looks for the required keywords in the expected order for the identified format. It uses `indexOf` on the token array to find the positions of keywords like `FROM`, `TO`, `ACCOUNT`, and `ON`.
5.  **Data Extraction:** Once the keywords are located, the parser extracts the data (amount, currency, account IDs, date) from the tokens at the expected positions relative to the keywords.
6.  **Validation:** Basic structural validation (e.g., checking if the amount is a valid integer, checking the date format) is performed during the parsing process.

## Known Trade-offs

*   **Less Flexible:** The current parsing approach is tightly coupled to the specified instruction format. If the format were to become more complex or flexible, a more sophisticated parsing technique (like a parser generator) might be more appropriate. However, for the current requirements, this approach is a good balance of simplicity and robustness.
*   **Verbose:** A manual parser can be more verbose than a regex-based one. However, this verbosity contributes to the clarity of the code.

## How to Run Tests

To run the automated tests, use the following command:

```bash
npm test
```

The tests include:

*   **Unit tests** for the parser, validator, and executor modules, covering all the specified test cases and additional edge cases.
*   **Integration tests** for the `POST /payment-instructions` endpoint to ensure the entire request/response flow works as expected.

## Integration Testing Notes

During development, I encountered a persistent issue with the `chai-http` library that prevented the integration tests from running. After several attempts to resolve the issue, I switched to `supertest`, which is another popular library for testing HTTP servers. This resolved the issue and the integration tests are now running successfully.

The final integration test setup uses `supertest` to make requests to the application and `chai` for assertions. The server is started before the tests run and stopped after they complete, ensuring a clean test environment.