"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionDrawer } from "./transaction-drawer"

interface NewTransactionButtonProps {
    label: string
    locale: string
}

export function NewTransactionButton({ label, locale }: NewTransactionButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                {label}
            </Button>
            <TransactionDrawer
                open={open}
                onOpenChange={setOpen}
                locale={locale}
            />
        </>
    )
}
