import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatCurrency } from "@/lib/utils"

interface PaymentTableProps {
  transactions: any[]
}

export function PaymentTable({ transactions }: PaymentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
              <TableCell>{transaction.user.name || transaction.user.email}</TableCell>
              <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transaction.status === "COMPLETED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : transaction.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

