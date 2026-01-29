import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard, DollarSign, PieChart as PieChartIcon, ArrowRightLeft, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, isSameMonth } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { BudgetCategory, BudgetTransaction, BudgetAccount } from "@shared/schema";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Budget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BudgetAccount | null>(null);
  const [editAccountBalance, setEditAccountBalance] = useState("");

  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    categoryId: "",
    accountId: "",
    description: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "expense" as "income" | "expense",
  });

  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "checking",
    balance: "",
  });

  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const isCurrentMonth = isSameMonth(selectedMonth, new Date());

  const { data: transactions = [] } = useQuery<BudgetTransaction[]>({
    queryKey: ["/api/budget/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/budget/transactions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<BudgetCategory[]>({
    queryKey: ["/api/budget/categories"],
    queryFn: async () => {
      const res = await fetch("/api/budget/categories", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: accounts = [] } = useQuery<BudgetAccount[]>({
    queryKey: ["/api/budget/accounts"],
    queryFn: async () => {
      const res = await fetch("/api/budget/accounts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/budget/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      setIsTransactionOpen(false);
      setTransactionForm({ amount: "", type: "expense", categoryId: "", accountId: "", description: "" });
      toast({ title: "Transaction added" });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/budget/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/categories"] });
      setIsCategoryOpen(false);
      setCategoryForm({ name: "", type: "expense" });
      toast({ title: "Category created" });
    },
  });

  const createAccount = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/budget/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      setIsAccountOpen(false);
      setAccountForm({ name: "", type: "checking", balance: "" });
      toast({ title: "Account added" });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/budget/transactions/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      toast({ title: "Transaction deleted" });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { fromAccountId: number; toAccountId: number; amount: string; description?: string }) => {
      return apiRequest("POST", "/api/budget/accounts/transfer", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      setIsTransferOpen(false);
      setTransferForm({ fromAccountId: "", toAccountId: "", amount: "", description: "" });
      toast({ title: "Transfer completed" });
    },
    onError: () => {
      toast({ title: "Transfer failed", variant: "destructive" });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/budget/accounts/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      toast({ title: "Account deleted" });
    },
  });

  const updateAccountBalance = useMutation({
    mutationFn: async (data: { id: number; balance: string }) => {
      return apiRequest("PUT", `/api/budget/accounts/${data.id}`, { balance: data.balance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget/accounts"] });
      setIsEditAccountOpen(false);
      setEditingAccount(null);
      setEditAccountBalance("");
      toast({ title: "Balance updated" });
    },
  });

  const monthlyData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    const monthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start, end })
    );

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return { income, expenses, balance: income - expenses, transactions: monthTransactions };
  }, [transactions, selectedMonth]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals: Record<number, number> = {};
    monthlyData.transactions
      .filter(t => t.type === "expense" && t.categoryId)
      .forEach(t => {
        categoryTotals[t.categoryId!] = (categoryTotals[t.categoryId!] || 0) + parseFloat(t.amount);
      });

    return Object.entries(categoryTotals).map(([catId, total]) => {
      const cat = categories.find(c => c.id === parseInt(catId));
      return { name: cat?.name || "Unknown", value: total };
    });
  }, [monthlyData.transactions, categories]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  }, [accounts]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground">Master your finances like a warrior</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
                <DialogTrigger asChild>
                  <Button className="warrior-gradient accent-text" data-testid="button-add-transaction">
                    <Plus className="h-4 w-4 mr-2" /> Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={transactionForm.type} onValueChange={(v: "income" | "expense") => setTransactionForm({ ...transactionForm, type: v })}>
                        <SelectTrigger data-testid="select-transaction-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} className="pl-10" data-testid="input-transaction-amount" />
                      </div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={transactionForm.categoryId} onValueChange={(v) => setTransactionForm({ ...transactionForm, categoryId: v })}>
                        <SelectTrigger data-testid="select-transaction-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c.type === transactionForm.type).map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.filter(c => c.type === transactionForm.type).length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">No {transactionForm.type} categories yet. Create one first!</p>
                      )}
                    </div>
                    <div>
                      <Label>Account</Label>
                      <Select value={transactionForm.accountId} onValueChange={(v) => setTransactionForm({ ...transactionForm, accountId: v })}>
                        <SelectTrigger data-testid="select-transaction-account">
                          <SelectValue placeholder="Select account (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} (${parseFloat(acc.balance).toFixed(2)})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {accounts.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">No accounts yet. Add one to track balances!</p>
                      )}
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={transactionForm.description} onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })} placeholder="What was this for?" data-testid="input-transaction-description" />
                    </div>
                    <Button onClick={() => createTransaction.mutate({ 
                      ...transactionForm, 
                      categoryId: parseInt(transactionForm.categoryId) || null, 
                      accountId: parseInt(transactionForm.accountId) || null,
                      date: new Date().toISOString() 
                    })} disabled={!transactionForm.amount} className="w-full warrior-gradient accent-text" data-testid="button-submit-transaction">
                      {createTransaction.isPending ? "Adding..." : "Add Transaction"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-add-category">
                    <Plus className="h-4 w-4 mr-2" /> Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Groceries, Salary..." data-testid="input-category-name" />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={categoryForm.type} onValueChange={(v: "income" | "expense") => setCategoryForm({ ...categoryForm, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => createCategory.mutate(categoryForm)} disabled={!categoryForm.name} className="w-full warrior-gradient accent-text" data-testid="button-submit-category">
                      {createCategory.isPending ? "Creating..." : "Create Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-add-account">
                    <Plus className="h-4 w-4 mr-2" /> Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} placeholder="e.g., Main Checking..." data-testid="input-account-name" />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={accountForm.type} onValueChange={(v) => setAccountForm({ ...accountForm, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current Balance</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" value={accountForm.balance} onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })} className="pl-10" data-testid="input-account-balance" />
                      </div>
                    </div>
                    <Button onClick={() => createAccount.mutate(accountForm)} disabled={!accountForm.name || !accountForm.balance} className="w-full warrior-gradient accent-text" data-testid="button-submit-account">
                      {createAccount.isPending ? "Adding..." : "Add Account"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-transfer">
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Between Accounts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>From Account</Label>
                      <Select value={transferForm.fromAccountId} onValueChange={(v) => setTransferForm({ ...transferForm, fromAccountId: v })}>
                        <SelectTrigger data-testid="select-transfer-from">
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.id.toString() !== transferForm.toAccountId).map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} (${parseFloat(acc.balance).toFixed(2)})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>To Account</Label>
                      <Select value={transferForm.toAccountId} onValueChange={(v) => setTransferForm({ ...transferForm, toAccountId: v })}>
                        <SelectTrigger data-testid="select-transfer-to">
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.id.toString() !== transferForm.fromAccountId).map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} (${parseFloat(acc.balance).toFixed(2)})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className="pl-10" data-testid="input-transfer-amount" />
                      </div>
                    </div>
                    <div>
                      <Label>Description (optional)</Label>
                      <Input value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} placeholder="e.g., Moving to savings..." data-testid="input-transfer-description" />
                    </div>
                    {accounts.length < 2 && (
                      <p className="text-xs text-muted-foreground">You need at least 2 accounts to make a transfer.</p>
                    )}
                    <Button 
                      onClick={() => transferMutation.mutate({ 
                        fromAccountId: parseInt(transferForm.fromAccountId), 
                        toAccountId: parseInt(transferForm.toAccountId),
                        amount: transferForm.amount,
                        description: transferForm.description || undefined
                      })} 
                      disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || accounts.length < 2} 
                      className="w-full warrior-gradient accent-text" 
                      data-testid="button-submit-transfer"
                    >
                      {transferMutation.isPending ? "Transferring..." : "Transfer Money"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[150px]">
              <span className="font-medium">{format(selectedMonth, "MMMM yyyy")}</span>
              {isCurrentMonth && <span className="text-xs text-muted-foreground ml-2">(This Month)</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isCurrentMonth && (
              <Button variant="outline" size="sm" onClick={() => setSelectedMonth(new Date())} data-testid="button-this-month">
                This Month
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="warrior-gradient border-2 accent-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 accent-text" />
                  <div>
                    <p className="text-xs text-white/70">Total Balance</p>
                    <p className="text-xl font-bold accent-text" data-testid="text-total-balance">${totalBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Income</p>
                    <p className="text-xl font-bold text-green-500" data-testid="text-monthly-income">${monthlyData.income.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Expenses</p>
                    <p className="text-xl font-bold text-red-500" data-testid="text-monthly-expenses">${monthlyData.expenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <PiggyBank className={`h-6 w-6 ${monthlyData.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly {monthlyData.balance >= 0 ? 'Surplus' : 'Deficit'}</p>
                    <p className={`text-xl font-bold ${monthlyData.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-monthly-balance">
                      ${Math.abs(monthlyData.balance).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 20).map((t) => {
                        const cat = categories.find(c => c.id === t.categoryId);
                        const acc = accounts.find(a => a.id === t.accountId);
                        return (
                          <div key={t.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`transaction-${t.id}`}>
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                {t.type === 'income' ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{t.description || 'Transaction'}</p>
                                  {cat && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted border">{cat.name}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">{format(new Date(t.date), "MMM d, yyyy")}</span>
                                  {acc && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {acc.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                              </span>
                              <Button variant="ghost" size="icon" onClick={() => deleteTransaction.mutate(t.id)} data-testid={`button-delete-transaction-${t.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No transactions yet. Add your first transaction to get started!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                  <Card key={acc.id} data-testid={`account-${acc.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full warrior-gradient flex items-center justify-center">
                            <CreditCard className="h-6 w-6 accent-text" />
                          </div>
                          <div>
                            <p className="font-bold">{acc.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{acc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold accent-text">${parseFloat(acc.balance).toFixed(2)}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setEditingAccount(acc);
                              setEditAccountBalance(acc.balance);
                              setIsEditAccountOpen(true);
                            }}
                            data-testid={`button-edit-account-${acc.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteAccount.mutate(acc.id)}
                            data-testid={`button-delete-account-${acc.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {accounts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground col-span-2">No accounts added yet</p>
                )}
              </div>

              <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Account Balance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {editingAccount && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Editing balance for <span className="font-bold">{editingAccount.name}</span>
                        </p>
                        <div>
                          <Label>New Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              step="0.01" 
                              value={editAccountBalance} 
                              onChange={(e) => setEditAccountBalance(e.target.value)} 
                              className="pl-10" 
                              data-testid="input-edit-account-balance" 
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => updateAccountBalance.mutate({ id: editingAccount.id, balance: editAccountBalance })} 
                          disabled={!editAccountBalance} 
                          className="w-full warrior-gradient accent-text" 
                          data-testid="button-submit-edit-account"
                        >
                          {updateAccountBalance.isPending ? "Saving..." : "Save Balance"}
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 accent-text" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expensesByCategory.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No expense data to display</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
