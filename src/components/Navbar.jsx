export default function Navbar() {
  return (
    <nav className="w-full p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md fixed top-0 z-10 border-b border-slate-800">
      
      <a
        href="/"
        className="text-2xl font-bold text-amber-400 cursor-pointer"
      >
        Onur<span className="text-white">.bilgin</span>
      </a>

      <div className="space-x-8 text-slate-300 hidden md:block">
        <a
          href="#hakkimda"
          className="hover:text-amber-400 transition-colors"
        >
          Hakkımda
        </a>

        <a
          href="#projeler"
          className="hover:text-amber-400 transition-colors"
        >
          Projeler
        </a>

        <a
          href="#iletisim"
          className="hover:text-amber-400 transition-colors"
        >
          İletişim
        </a>
      </div>

    </nav>
  )
}
```
