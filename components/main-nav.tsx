import * as React from "react"
import Link from "next/link"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="logo hidden select-none text-xl font-black leading-none text-black dark:text-slate-200 sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
    </div>
  )
}
