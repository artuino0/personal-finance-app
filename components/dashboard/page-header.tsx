"use client"

import type { ReactNode } from "react"
import { AccountSelector } from "./account-selector"
import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  currentUserId: string
  currentUserName: string
  currentUserEmail: string
  selectedAccountId?: string
  isSharedAccount?: boolean
  permissions?: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
}

export function PageHeader({
  title,
  description,
  actions,
  currentUserId,
  currentUserName,
  currentUserEmail,
  selectedAccountId,
  isSharedAccount,
  permissions,
}: PageHeaderProps) {
  const showCreateButton = !isSharedAccount || (permissions?.create ?? false)

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {isSharedAccount && (
              <Badge variant="secondary" className="text-xs">
                Compartido
              </Badge>
            )}
          </div>
          {description && <p className="text-slate-600">{description}</p>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <AccountSelector
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserEmail={currentUserEmail}
            selectedAccountId={selectedAccountId}
          />
          {showCreateButton && actions}
        </div>
      </div>
    </div>
  )
}
