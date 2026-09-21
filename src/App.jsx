import Navbar from './components/Navbar'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar />

      <main className="flex flex-col items-center justify-center min-h-screen pt-20">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-6">
          Merhaba, Ben Onur Bilgin
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-10 text-center max-w-2xl px-4">
          Elektrik-Elektronik, Gömülü Sistemler ve Web Teknolojileri üzerine çalışan bir mühendisim.
        </p>
        <a href="#projeler" className="px-8 py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-all transform hover:scale-105 inline-block">
          Projelerimi İncele
        </a>
      </main>

      {/* Projeler Bölümümüzü Buraya Ekledik */}
      <About/>
      <Projects />
      <Contact/>
    </div>
  )
}

export default App