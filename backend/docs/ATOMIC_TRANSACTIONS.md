# Atomic Transaction Operations

## Overview

All financial operations that modify multiple database records are now wrapped in database transactions to ensure **ACID** properties (Atomicity, Consistency, Isolation, Durability).

## Why Atomic Transactions?

### Problem: Race Conditions

Without atomic transactions, this sequence can fail:

```go
// ❌ NON-ATOMIC (Bad)
transaction := CreateTransaction(...)  // Step 1
UpdateAccountBalance(...)              // Step 2 - Could fail!
```

**Issues:**
- If Step 2 fails, Step 1 is already committed
- Database is left in inconsistent state
- Transaction exists but balance wasn't updated
- Money appears to have vanished or duplicated

### Solution: Database Transactions

```go
// ✅ ATOMIC (Good)
db.Transaction(func(tx *gorm.DB) error {
    transaction := CreateTransaction(...)  // Step 1
    UpdateAccountBalance(...)              // Step 2
    return nil                             // Both succeed or both rollback
})
```

**Benefits:**
- All operations succeed together or fail together
- No partial updates
- Data integrity guaranteed
- Automatic rollback on error

## Implemented Atomic Operations

### 1. Create Transaction

**Operation:** Create transaction + Update account balance

**Code:**
```go
func (s *TransactionService) Create(userID uint, req *TransactionRequest) (*Transaction, error) {
    var transaction *Transaction
    
    err := s.db.Transaction(func(tx *gorm.DB) error {
        // Step 1: Validate account
        account, err := s.accountRepo.GetByID(req.AccountID, userID)
        if err != nil {
            return err
        }
        
        // Step 2: Create transaction record
        transaction = &Transaction{...}
        if err := tx.Create(transaction).Error; err != nil {
            return err
        }
        
        // Step 3: Update account balance
        account.Balance += transaction.Amount
        if err := tx.Save(account).Error; err != nil {
            return err
        }
        
        return nil // Commit
    })
    
    return transaction, err
}
```

**Rollback Scenarios:**
- Account not found → Rollback
- Transaction creation fails → Rollback
- Balance update fails → Rollback, transaction not created

### 2. Update Transaction

**Operation:** Revert old balance + Update transaction + Apply new balance

**Code:**
```go
func (s *TransactionService) Update(id uint, userID uint, req *TransactionRequest) (*Transaction, error) {
    err := s.db.Transaction(func(tx *gorm.DB) error {
        // Step 1: Get existing transaction
        transaction, err := s.transactionRepo.GetByID(id, userID)
        
        // Step 2: Revert old account balance
        oldAccount.Balance -= oldTransaction.Amount
        tx.Save(oldAccount)
        
        // Step 3: Update transaction
        transaction.Amount = req.Amount
        tx.Save(transaction)
        
        // Step 4: Apply new balance
        newAccount.Balance += req.Amount
        tx.Save(newAccount)
        
        return nil
    })
}
```

**Rollback Scenarios:**
- Transaction not found → Rollback
- Old balance revert fails → Rollback
- New balance application fails → Rollback, old balance restored

### 3. Delete Transaction

**Operation:** Delete transaction + Revert account balance

**Code:**
```go
func (s *TransactionService) Delete(id uint, userID uint) error {
    return s.db.Transaction(func(tx *gorm.DB) error {
        // Step 1: Get transaction
        transaction, err := s.transactionRepo.GetByID(id, userID)
        
        // Step 2: Revert balance
        account.Balance -= transaction.Amount
        tx.Save(account)
        
        // Step 3: Delete transaction
        tx.Delete(&Transaction{}, id)
        
        return nil
    })
}
```

**Rollback Scenarios:**
- Transaction not found → Rollback
- Balance revert fails → Rollback
- Delete fails → Rollback, balance unchanged

### 4. Transfer Between Accounts

**Operation:** Create 2 transactions + Update 2 account balances

**Code:**
```go
func (s *TransactionService) Transfer(userID uint, req *TransferRequest) (*TransferResponse, error) {
    err := s.db.Transaction(func(tx *gorm.DB) error {
        // Step 1: Validate accounts
        fromAccount, err := s.accountRepo.GetByID(req.FromAccountID, userID)
        toAccount, err := s.accountRepo.GetByID(req.ToAccountID, userID)
        
        // Step 2: Check sufficient balance
        if fromAccount.Balance < req.Amount {
            return errors.New("insufficient balance")
        }
        
        // Step 3: Create outgoing transaction
        fromTx := &Transaction{...}
        tx.Create(fromTx)
        
        // Step 4: Create incoming transaction
        toTx := &Transaction{...}
        tx.Create(toTx)
        
        // Step 5: Update both balances
        fromAccount.Balance -= req.Amount
        toAccount.Balance += req.Amount
        tx.Save(fromAccount)
        tx.Save(toAccount)
        
        return nil
    })
}
```

**Rollback Scenarios:**
- Source account not found → Rollback
- Destination account not found → Rollback
- Insufficient balance → Rollback
- Transaction creation fails → Rollback
- Balance update fails → Rollback, both balances unchanged

## GORM Transaction API

### Basic Usage

```go
// Automatic commit/rollback
err := db.Transaction(func(tx *gorm.DB) error {
    // Use tx instead of db for all operations
    if err := tx.Create(&user).Error; err != nil {
        return err // Rollback
    }
    
    if err := tx.Create(&account).Error; err != nil {
        return err // Rollback
    }
    
    return nil // Commit
})
```

### Manual Transaction Control

```go
// Begin transaction
tx := db.Begin()

// Perform operations
if err := tx.Create(&record).Error; err != nil {
    tx.Rollback()
    return err
}

// Commit
tx.Commit()
```

### Nested Transactions (SavePoints)

```go
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&user)
    
    // Nested transaction (creates savepoint)
    tx.Transaction(func(tx2 *gorm.DB) error {
        tx2.Create(&account)
        return errors.New("rollback to savepoint")
    })
    
    return nil // User is created, account is not
})
```

## Best Practices

### 1. Keep Transactions Short

```go
// ✅ Good - Short transaction
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&transaction)
    tx.Save(&account)
    return nil
})

// ❌ Bad - Long transaction
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&transaction)
    time.Sleep(5 * time.Second) // Holds lock!
    sendEmail()                 // External call!
    tx.Save(&account)
    return nil
})
```

### 2. External Calls Outside Transactions

```go
// ✅ Good
var transaction *Transaction

db.Transaction(func(tx *gorm.DB) error {
    transaction = &Transaction{...}
    tx.Create(transaction)
    tx.Save(&account)
    return nil
})

// Send email after transaction commits
sendEmail(transaction)
```

### 3. Use Explicit Error Returns

```go
// ✅ Good
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&record).Error; err != nil {
        return err // Explicit rollback
    }
    return nil
})

// ❌ Bad
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&record) // Ignores error!
    return nil
})
```

### 4. Validate Before Transaction

```go
// ✅ Good
if amount <= 0 {
    return errors.New("invalid amount")
}

db.Transaction(func(tx *gorm.DB) error {
    // Proceed with valid data
})

// ❌ Bad
db.Transaction(func(tx *gorm.DB) error {
    if amount <= 0 {
        return errors.New("invalid amount") // Unnecessary transaction
    }
})
```

## Isolation Levels

GORM uses database default isolation levels. For PostgreSQL:

- **Read Committed** (default): Prevents dirty reads
- **Repeatable Read**: Prevents non-repeatable reads
- **Serializable**: Prevents phantom reads

To change isolation level:

```go
db.Exec("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
db.Transaction(func(tx *gorm.DB) error {
    // Your operations
})
```

## Performance Considerations

### Transaction Overhead

- **Short transactions**: Minimal overhead (~1-2ms)
- **Long transactions**: Holds locks, blocks other operations
- **Nested transactions**: Additional savepoint overhead

### Optimization Tips

1. **Batch operations** when possible
2. **Keep transactions short** (< 100ms ideal)
3. **Avoid network calls** inside transactions
4. **Read operations** can be outside transactions
5. **Use read replicas** for read-heavy workloads

## Testing Atomic Operations

### Unit Test Example

```go
func TestCreateTransaction_Atomic(t *testing.T) {
    db := setupTestDB(t)
    service := NewTransactionService(db)
    
    // Create test account with balance
    account := &Account{Balance: 1000}
    db.Create(account)
    
    // Create transaction
    req := &TransactionRequest{
        AccountID: account.ID,
        Amount:    100,
        Type:      "expense",
    }
    
    tx, err := service.Create(1, req)
    
    // Assert both transaction and balance updated
    assert.NoError(t, err)
    assert.NotNil(t, tx)
    
    // Verify account balance updated
    var updatedAccount Account
    db.First(&updatedAccount, account.ID)
    assert.Equal(t, float64(900), updatedAccount.Balance)
}
```

### Test Rollback

```go
func TestCreateTransaction_RollbackOnError(t *testing.T) {
    db := setupTestDB(t)
    service := NewTransactionService(db)
    
    // Try to create transaction for non-existent account
    req := &TransactionRequest{
        AccountID: 999, // Doesn't exist
        Amount:    100,
    }
    
    _, err := service.Create(1, req)
    
    // Assert error and no transaction created
    assert.Error(t, err)
    
    var count int64
    db.Model(&Transaction{}).Count(&count)
    assert.Equal(t, int64(0), count)
}
```

## Monitoring

### Log Transaction Timing

```go
db.Transaction(func(tx *gorm.DB) error {
    start := time.Now()
    defer func() {
        logger.WithFields(logrus.Fields{
            "duration_ms": time.Since(start).Milliseconds(),
            "operation":   "transfer",
        }).Info("Transaction completed")
    }()
    
    // Your operations
    return nil
})
```

### Alert on Long Transactions

```go
const MaxTransactionDuration = 5 * time.Second

db.Transaction(func(tx *gorm.DB) error {
    start := time.Now()
    
    // Your operations
    
    if time.Since(start) > MaxTransactionDuration {
        logger.Warn("Long transaction detected")
    }
    
    return nil
})
```

## Common Pitfalls

### 1. Forgetting to Use tx

```go
// ❌ Wrong - Using db instead of tx
db.Transaction(func(tx *gorm.DB) error {
    db.Create(&record) // Uses db, not tx!
    return nil
})

// ✅ Correct
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&record) // Uses tx
    return nil
})
```

### 2. Committing Twice

```go
// ❌ Wrong
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&record)
    tx.Commit() // Don't manually commit!
    return nil
})

// ✅ Correct
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&record)
    return nil // Auto-commits
})
```

### 3. Ignoring Errors

```go
// ❌ Wrong
db.Transaction(func(tx *gorm.DB) error {
    tx.Create(&record) // Error ignored
    return nil
})

// ✅ Correct
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&record).Error; err != nil {
        return err
    }
    return nil
})
```

## Resources

- [GORM Transactions](https://gorm.io/docs/transactions.html)
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [ACID Properties](https://en.wikipedia.org/wiki/ACID)
