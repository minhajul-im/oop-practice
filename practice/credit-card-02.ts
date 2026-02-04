class Customer {
  constructor(
    private name: string,
    private email: string,
    private contact: string,
  ) {
    this.validateDetails(name, email, contact);
  }

  private validateDetails(name: string, email: string, contact: string): void {
    if (!name || name.trim() === "") {
      throw new Error("Name is required and cannot be empty.");
    }
    if (!email || email.trim() === "") {
      throw new Error("Valid email is required.");
    }
    if (!contact || contact.trim() === "") {
      throw new Error("Contact is required and cannot be empty.");
    }
  }

  getName(): string {
    return this.name;
  }
  getEmail(): string {
    return this.email;
  }
  getContact(): string {
    return this.contact;
  }
}

enum CardStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  DELETED = "deleted",
}

class CreditCard {
  private customer: Customer;
  private cvv: string;
  private expiryDate: Date;
  private cardNumber: string;
  private owedBalance: number = 0;
  private maxCreditLimit: number = 100000;
  private cardStatus: CardStatus = CardStatus.ACTIVE;
  private cashWithdrawLimitPercentage: number = 10;

  constructor(
    customer: Customer,
    expiryDate: Date,
    cardNumber: string,
    cvv: string,
  ) {
    this.customer = customer;
    this.expiryDate = expiryDate;
    this.cardNumber = cardNumber;
    this.cvv = cvv;
    this.validateCardDetails(expiryDate, cardNumber, cvv);
  }

  private validateCardDetails(
    expiryDate: Date,
    cardNumber: string,
    cvv: string,
  ): void {
    if (expiryDate <= new Date()) {
      throw new Error("Expiry date must be in the future.");
    }
    if (!cardNumber || cardNumber.length !== 16) {
      throw new Error("Card number must be 16 digits.");
    }
    if (!cvv || cvv.length !== 3) {
      throw new Error("CVV must be 3 digits.");
    }
  }

  getCardHolder(): Customer {
    return this.customer;
  }
  getExpiryDate(): Date {
    return this.expiryDate;
  }
  getCardNumber(): string {
    return this.cardNumber;
  }
  getCvv(): string {
    return this.cvv;
  }
  getMaxCreditLimit(): number {
    return this.maxCreditLimit;
  }
  getOwedBalance(): number {
    return this.owedBalance;
  }
  setOwedBalance(amount: number): void {
    if (amount <= 0) {
      throw new Error("Owed balance must be positive.");
    }
    this.owedBalance = amount;
  }

  getAvailableCredit(): number {
    return this.maxCreditLimit - this.owedBalance;
  }
  getCardStatus(): CardStatus {
    return this.cardStatus;
  }
  setCardStatus(cardStatus: CardStatus): void {
    this.cardStatus = cardStatus;
  }
  isActiveAndValid(): boolean {
    return (
      this.cardStatus === CardStatus.ACTIVE && new Date() < this.expiryDate
    );
  }
  getCashWithdrawLimit(): number {
    return (this.getAvailableCredit() * this.cashWithdrawLimitPercentage) / 100;
  }
}

enum TransactionType {
  WITHDRAW = "withdraw",
  PURCHASE = "purchase",
  PAYMENT = "payment",
  TRANSFER = "transfer",
  INTEREST = "interest",
  DEPOSIT = "deposit",
}

class Transaction {
  private amount: number;
  private transactionDate: Date;
  private transactionType: TransactionType;
  private description: string;
  constructor(
    amount: number,
    date: Date,
    type: TransactionType,
    description: string = "",
  ) {
    this.amount = amount;
    this.transactionDate = date;
    this.transactionType = type;
    this.description = description;
  }

  getAmount(): number {
    return this.amount;
  }
  getTransactionDate(): Date {
    return this.transactionDate;
  }
  getTransactionType(): TransactionType {
    return this.transactionType;
  }
  getDescription(): string {
    return this.description;
  }
}

class CreditCardService {
  private creditCard: CreditCard;
  private transactions: Transaction[] = [];

  constructor(creditCard: CreditCard) {
    this.creditCard = creditCard;
  }

  pay(amount: number, type: TransactionType, description: string = ""): void {
    this.validateAmount(amount, type);

    if (!this.creditCard.isActiveAndValid()) {
      throw new Error("Card is not active or has expired.");
    }

    switch (type) {
      case TransactionType.WITHDRAW:
        this.withdraw(amount, description);
        break;
      case TransactionType.PURCHASE:
        this.purchase(amount, description);
        break;
      case TransactionType.PAYMENT:
        this.payment(amount, description);
        break;
      case TransactionType.TRANSFER:
        this.transfer(amount, description);
        break;
      default:
        throw new Error("Unsupported transaction type.");
    }
  }

  private positiveAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error("Amount must be positive.");
    }
  }
  private validateAmount(amount: number, type: TransactionType): void {
    this.positiveAmount(amount);
    if (
      type === TransactionType.WITHDRAW ||
      type === TransactionType.PURCHASE ||
      type === TransactionType.TRANSFER
    ) {
      if (amount > this.creditCard.getAvailableCredit()) {
        throw new Error("Insufficient available credit.");
      }
    }
    if (
      type === TransactionType.PAYMENT &&
      amount > this.creditCard.getMaxCreditLimit()
    ) {
      throw new Error("Payment exceeds max credit limit.");
    }
  }
  private addTransaction(
    amount: number,
    date: Date,
    type: TransactionType,
    description: string = "",
  ): void {
    const transaction = new Transaction(amount, date, type, description);

    this.transactions.push(transaction);
  }
  getOwedBalance(): number {
    return this.creditCard.getOwedBalance();
  }

  setOwedBalance(amount: number): void {
    this.positiveAmount(amount);
    this.creditCard.setOwedBalance(amount);
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getTransactionsByType(type: TransactionType): Transaction[] {
    return this.transactions.filter((t) => t.getTransactionType() === type);
  }

  getTotalAmountByType(type: TransactionType): number {
    return this.transactions
      ?.filter((t) => t.getTransactionType() === type)
      ?.reduce((total, t) => total + t.getAmount(), 0);
  }

  getTransactionsSince(date: Date): Transaction[] {
    return this.transactions.filter((t) => t.getTransactionDate() > date);
  }

  private withdraw(amount: number, description: string): void {
    if (amount > this.creditCard.getCashWithdrawLimit()) {
      throw new Error("Exceeds cash withdraw limit.");
    }
    const newBalance = this.creditCard.getOwedBalance() + amount;
    this.creditCard.setOwedBalance(newBalance);
    this.addTransaction(
      amount,
      new Date(),
      TransactionType.WITHDRAW,
      description,
    );
  }

  private purchase(amount: number, description: string): void {
    const newBalance = this.creditCard.getOwedBalance() + amount;
    this.creditCard.setOwedBalance(newBalance);
    this.addTransaction(
      amount,
      new Date(),
      TransactionType.PURCHASE,
      description,
    );
  }

  private payment(amount: number, description: string): void {
    const newBalance = this.creditCard.getOwedBalance() - amount;
    this.creditCard.setOwedBalance(newBalance);
    this.addTransaction(
      amount,
      new Date(),
      TransactionType.PAYMENT,
      description,
    );
  }

  private transfer(amount: number, description: string): void {
    const newBalance = this.creditCard.getOwedBalance() + amount;
    this.creditCard.setOwedBalance(newBalance);
    this.addTransaction(
      amount,
      new Date(),
      TransactionType.TRANSFER,
      description,
    );
  }

  addInterest(amount: number, description: string): void {
    this.positiveAmount(amount);

    const newBalance = this.creditCard.getOwedBalance() + amount;
    this.creditCard.setOwedBalance(newBalance);
    this.addTransaction(
      amount,
      new Date(),
      TransactionType.INTEREST,
      description,
    );
  }
}

class BillingService {
  private creditCardService: CreditCardService;
  private minPaymentPercentage: number = 5;
  private interestRateMonthly: number = 1.5;

  constructor(creditCardService: CreditCardService) {
    this.creditCardService = creditCardService;
  }

  generateMonthlyBill(lastBillDate: Date): {
    totalDue: number;
    minPayment: number;
    dueDate: Date;
  } {
    if (lastBillDate >= new Date()) {
      throw new Error("Last bill date must be in the past.");
    }
    // here might be some logic to calculate the due date for the business policy
    const now = new Date();
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const totalDue = this.creditCardService.getOwedBalance();
    const minPayment = Math.max(
      (totalDue * this.minPaymentPercentage) / 100,
      0,
    );
    return { totalDue, minPayment, dueDate };
  }

  applyInterestIfLate(dueDate: Date): void {
    if (new Date() <= dueDate) {
      return;
    }
    const owed = this.creditCardService.getOwedBalance();
    if (owed <= 0) {
      return;
    }
    const interest = (owed * this.interestRateMonthly) / 100;
    this.creditCardService.addInterest(interest, "Monthly interest charge");
  }

  payBill(amount: number): void {
    this.creditCardService.pay(amount, TransactionType.PAYMENT, "Bill payment");
  }
}

try {
  const customer = new Customer("Minhaj", "minhaj@example.com", "123-456-7890");
  const card = new CreditCard(
    customer,
    new Date("2026-12-31"),
    "1234567890123456",
    "123",
  );
  const service = new CreditCardService(card);
  const billing = new BillingService(service);

  service.pay(100, TransactionType.PAYMENT, "Bill payment");
  service.pay(100, TransactionType.PURCHASE, "Purchase");
  console.log(
    "Monthly bill:",
    billing.generateMonthlyBill(new Date("2026-01-01")),
  );
  billing.payBill(100);

  console.log(service.getTransactions());
} catch (error) {
  console.error("Error:", error);
}
