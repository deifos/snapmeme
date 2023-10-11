import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    twitter: string
    github: string
    docs: string
  }
}

export const siteConfig: SiteConfig = {
  name: "SM",
  description:
    "Fastest way to generate memes",
  mainNav: [
    // {
    //   title: "Home",
    //   href: "/",
    // },
  ],
  links: {
    twitter: "https://twitter.com/deifosv",
    github: "https://github.com/deifos/snapmeme",
    docs: "https://github.com/deifos/snapmeme",
  },
}
