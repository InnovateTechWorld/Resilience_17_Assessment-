# Payment Instruction Parser and Executor

This project is a REST API that parses payment instructions, validates them against business rules, and executes transactions on provided accounts.

## Table of Contents

- [Endpoint Specification](#endpoint-specification)
- [How to Run](#how-to-run)
- [How to Run Tests](#how-to-run-tests)
- [Example Usage](#example-usage)
- [Parsing Strategy](#parsing-strategy)

---

## Endpoint Specification

**Path:** `POST /payment-instructions`

**Request Format:**
```json
{
  "accounts": [
    {"id": "a", "balance": 230, "currency": "USD"},
    {"id": "b", "balance": 300, "currency": "USD"}
  ],
  "instruction": "DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```

**Response Format (Success):**
```json
{
  "type": "DEBIT",
  "amount": 30,
  "currency": "USD",
  "debit_account": "a",
  "credit_account": "b",
  "execute_by": null,
  "status": "successful",
  "status_reason": "Transaction executed successfully",
  "status_code": "AP00",
  "accounts": [
    {
      "id": "a",
      "balance": 200,
      "balance_before": 230,
      "currency": "USD"
    },
    {
      "id": "b",
      "balance": 330,
      "balance_before": 300,
      "currency": "USD"
    }
  ]
}
```

---

## How to Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the server:**
    ```bash
    node bootstrap.js
    ```
    The server will start on port 3000 by default.

---

## How to Run Tests

```bash
npm test
```

---

## Example Usage

```bash
curl -X POST http://localhost:3000/payment-instructions \
  -H "Content-Type: application/json" \
  -d '{
    "accounts":[{"id":"a","balance":230,"currency":"USD"},{"id":"b","balance":300,"currency":"USD"}],
    "instruction":"DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
  }'
```

---

## Parsing Strategy

The parsing logic is implemented in `src/parser.js` and follows these principles:

-   **No Regular Expressions:** The parser exclusively uses string manipulation methods like `.split()`, `.indexOf()`, and `.substring()` to process the instruction string. This approach was chosen for its clarity, maintainability, and performance in this specific context.
-   **Tokenization:** The instruction is first normalized (trimmed, converted to a consistent case) and then tokenized into an array of words.
-   **Keyword Scanning:** The parser scans the token array for keywords (`DEBIT`, `CREDIT`, `FROM`, `TO`, etc.) in a predefined order to determine the instruction format and extract relevant data.
-   **Structured Output:** The parser returns a structured object containing the parsed data or an error object if the instruction is unparseable.
