"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TransactionsList } from "./transactions-list"

interface Transaction {
    id: string
    type: string
    amount: number
    description: string | null
    date: string
    account_id: string
    accounts: { name: string; color: string | null } | null
    categories: { name: string; color: string | null; icon: string | null } | null
}

interface TransactionsClientProps {
    initialTransactions: Transaction[]
    totalCount: number
    userId: string
    permissions?: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

export function TransactionsClient({
    initialTransactions,
    totalCount,
    userId,
    permissions,
}: TransactionsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Get pagination from URL or use defaults
    const currentPage = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 10

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", newPage.toString())
        startTransition(() => {
            router.push(`?${params.toString()}`)
        })
    }

    const handlePageSizeChange = (newSize: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("pageSize", newSize.toString())
        params.set("page", "1") // Reset to page 1 when changing page size
        startTransition(() => {
            router.push(`?${params.toString()}`)
        })
    }

    return (
        <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
            <TransactionsList
                transactions={initialTransactions}
                userId={userId}
                permissions={permissions}
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    )
}
