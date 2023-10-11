import { Icons } from "./icons";

const SiteFooter = () => {
    return (
        <footer className=" container flex">
            <div className="container mx-auto flex max-w-7xl flex-col items-center p-8 sm:flex-row text-center">
                <a href="#_" className="logo select-none text-xl font-black leading-none text-black dark:text-slate-400">Snapmeme<span className="text-indigo-600"></span></a>
                <p className="mt-4 text-sm text-gray-500 sm:ml-4 sm:mt-0 sm:border-l sm:border-gray-200 sm:pl-4">made with 💛, 🔨 & <a href="https://ui.shadcn.com/docs/installation" target="_blank" rel="noreferrer"> shadcn/ui</a>, chatGPT-3.5 by Vlad</p>

                <p className="text-third ml-5 mt-4 inline-flex justify-center space-x-5 text-sm sm:ml-auto sm:mt-0 sm:justify-start">
                     
                    Follow me on <a className="ml-3" href="hhtps://twitter.com/deifosv" target="_blank" rel="noreferrer">
                        <Icons.twitter className="inline h-5 w-5 fill-current" />
                    </a>
                </p>
            </div>
        </footer>
    )
}

export default SiteFooter;