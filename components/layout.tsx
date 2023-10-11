import { SiteHeader } from "@/components/site-header"
import SiteFooter from "./site-footer"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
    <div className="flex flex-col h-screen">
      <SiteHeader />
      <main className="grow">{children}</main>
      <div className="bottom-0 z-50 border-t border-t-slate-200">
        <SiteFooter  />
      </div>
    </div>
    </>
  )
}
