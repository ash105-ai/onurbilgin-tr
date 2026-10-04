import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'

import bgImage from './assets/bg-image.jpg'

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const startX = useRef(0)
  const currentX = useRef(0)

  // Her 7 saniyede bir sonraki ekrana geç
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0))
    }, 7000)

    return () => clearTimeout(timer)
  }, [currentSlide])

  // Mouse / parmak hareketinin başladığı nokta
  const handlePointerDown = (e) => {
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  // Mouse / parmak hareketi
  const handlePointerMove = (e) => {
    if (!isDragging) return

    currentX.current = e.clientX
  }

  // Mouse / parmak bırakıldığında
  const handlePointerUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)

    const difference = startX.current - currentX.current

    // En az 50px kaydırıldıysa slide değiştir
    if (Math.abs(difference) > 50) {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0))
    }
  }

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">

      {/* ARKA PLAN */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Lacivert / siyah karartma */}
        <div className="absolute inset-0 bg-slate-950/85" />

      </div>

      {/* SİTE İÇERİĞİ */}
      <div className="relative z-10">

        <Navbar />

        {/* Karşılama / Hakkımda Slider */}
        <main
          className="relative min-h-screen pt-20 overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
        >

          {/* Slider */}
          <div
            className={`flex min-h-screen ${
              isDragging
                ? ''
                : 'transition-transform duration-700 ease-in-out'
            }`}
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >

            {/* MERHABA */}
            <div className="min-w-full min-h-screen flex flex-col items-center justify-center px-4">

              <h1 className="w-full text-center text-5xl md:text-7xl font-bold text-amber-400 mb-6">
                Merhaba, Ben Onur Bilgin
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 text-center max-w-2xl">
                Elektrik-Elektronik, Gömülü Sistemler ve Web Teknolojileri
                üzerine çalışan bir mühendisim.
              </p>

            </div>

            {/* KISACA BEN */}
            <div className="min-w-full min-h-screen">

              <About />

            </div>

          </div>

          {/* Slider göstergeleri */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">

            <button
              onClick={() => setCurrentSlide(0)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === 0
                  ? 'bg-amber-400 scale-125'
                  : 'bg-slate-600'
              }`}
              aria-label="Merhaba"
            />

            <button
              onClick={() => setCurrentSlide(1)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === 1
                  ? 'bg-amber-400 scale-125'
                  : 'bg-slate-600'
              }`}
              aria-label="Hakkımda"
            />

          </div>

        </main>

        {/* Diğer bölümler */}
        <Projects />
        <Contact />

      </div>

    </div>
  )
}

export default App