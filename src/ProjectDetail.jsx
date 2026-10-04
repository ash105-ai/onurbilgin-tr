import { useEffect, useState } from 'react'
import { projects } from '../data/projects'

// Başlığa tıklanınca dosya doğrudan indirilir; altındaki ok ile kod önizlemesi açılıp kapanır.
function CodeBlock({ name, path, language }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(null)

  useEffect(() => {
    if (!open || text !== null) return
    fetch(path)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((t) => setText(t.trimStart().startsWith('<!doctype') ? 'Dosya bulunamadı.' : t))
      .catch(() => setText('Dosya bulunamadı.'))
  }, [open, path, text])

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80">
        <a
          href={path}
          download
          className="flex items-center gap-3 group"
          title={`${name} dosyasını indir`}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
            ↓
          </span>
          <span>
            <span className="block text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{name}</span>
            <span className="block text-xs text-slate-400">{language} · tıkla ve indir</span>
          </span>
        </a>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm text-amber-400 hover:underline whitespace-nowrap"
        >
          {open ? 'Kodu gizle' : 'Kodu görüntüle'}
        </button>
      </div>
      {open && (
        <pre className="p-4 overflow-x-auto max-h-[32rem] text-sm text-slate-200 leading-relaxed border-t border-slate-700">
          <code>{text ?? 'Yükleniyor...'}</code>
        </pre>
      )}
    </div>
  )
}

// Dosya yoluna bakarak fotoğraf mı video mu olduğunu anlıyoruz.
const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src)

// Tam ekran lightbox: aynı sekmede büyütür, ok butonları ve klavyeyle gezinilir.
function Lightbox({ images, title, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-slate-800/80 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-2xl transition-colors"
      >
        ×
      </button>

      <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-slate-800/80 text-sm text-slate-300">
        {index + 1} / {images.length}
      </span>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Önceki fotoğraf"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-2xl transition-colors"
        >
          ‹
        </button>
      )}

      {isVideo(images[index]) ? (
        <video
          src={images[index]}
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
          className="max-w-[90vw] max-h-[85vh] rounded-lg bg-black"
        />
      ) : (
        <img
          src={images[index]}
          alt={`${title} fotoğrafı ${index + 1}`}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        />
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Sonraki fotoğraf"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-2xl transition-colors"
        >
          ›
        </button>
      )}
    </div>
  )
}

// Fotoğraf karuseli: ok butonları, nokta göstergeleri; tıklanınca aynı sekmede lightbox açılır.
function Gallery({ images, title }) {
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  if (!images.length) return null

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)

  return (
    <div>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
        {isVideo(images[idx]) ? (
          <>
            <video
              key={images[idx]}
              src={images[idx]}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full bg-black"
            />
            <button
              onClick={() => setLightboxOpen(true)}
              aria-label="Büyüt"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-sm transition-colors"
            >
              ⤢
            </button>
          </>
        ) : (
          <button onClick={() => setLightboxOpen(true)} className="w-full h-full cursor-zoom-in">
            <img
              src={images[idx]}
              alt={`${title} fotoğrafı ${idx + 1}`}
              className="w-full h-full object-contain bg-slate-950"
            />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki fotoğraf"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-xl transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Sonraki fotoğraf"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-900 flex items-center justify-center text-xl transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/70 text-xs text-slate-300">
              {idx + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`${i + 1}. fotoğrafa git`}
              className={`h-2.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-amber-400' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          title={title}
          index={idx}
          onClose={() => setLightboxOpen(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  )
}

const Section = ({ title, index, children }) => (
  <section className="mb-16">
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-mono tracking-widest text-amber-500/60">{index}</span>
      <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    {children}
  </section>
)

export default function ProjectDetail({ slug }) {
  const p = projects.find((x) => x.slug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = p ? `${p.title} | Onur Bilgin` : 'Proje bulunamadı'
  }, [p])

  // Sayfadaki tüm bölümleri tek listede toplayıp "01, 02, 03..." numaralarını otomatik veriyoruz.
  const blocks = p
    ? [
        p.purpose && { key: 'purpose', title: 'Projenin amacı', node: <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">{p.purpose}</p> },
        ...p.sections.map((s) => ({ key: s.title, title: s.title, node: <p className="text-lg text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">{s.text}</p> })),
        p.gallery.length > 0 && { key: 'gallery', title: 'Fotoğraflar', node: <Gallery images={p.gallery} title={p.title} /> },
        p.code.length > 0 && {
          key: 'code',
          title: 'Kodlar',
          node: (
            <div className="space-y-6">
              {p.code.map((c) => <CodeBlock key={c.path} {...c} />)}
            </div>
          ),
        },
        p.files.length > 0 && {
          key: 'files',
          title: 'Proje dosyaları',
          node: (
            <ul className="space-y-3">
              {p.files.map((f) => (
                <li key={f.path}>
                  <a href={f.path} download className="inline-block px-4 py-2 rounded-lg bg-slate-800 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-900 transition-colors">
                    {f.name} indir
                  </a>
                </li>
              ))}
            </ul>
          ),
        },
      ].filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
      {/* Dekoratif arka plan: amber parıltılar + ince nokta deseni */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] bg-amber-700/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      <div className="relative z-10">
        <nav className="w-full p-6 flex justify-between items-center border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm sticky top-0">
          <a href="/" className="text-2xl font-bold text-amber-400">
            Onur<span className="text-white">.bilgin</span>
          </a>
          <a href="/#projeler" className="text-slate-300 hover:text-amber-400 transition-colors">
            Tüm projeler
          </a>
        </nav>

        {!p ? (
          <main className="max-w-3xl mx-auto px-6 py-24 text-center">
            <h1 className="text-3xl font-bold mb-4">Proje bulunamadı</h1>
            <a href="/#projeler" className="text-amber-400 hover:underline">Projelere dön</a>
          </main>
        ) : (
          <main className="max-w-4xl mx-auto px-6 py-14">
            <p className="text-amber-400/80 mb-2">{p.category}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
              {p.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-12">
              {p.tags.map((t) => (
                <span key={t} className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full border border-amber-800/50">{t}</span>
              ))}
            </div>

            {p.videos.length > 0 && (
              <div className="mb-16 space-y-8">
                {p.videos.map((v) => (
                  <figure key={v.src}>
                    <video src={v.src} controls playsInline preload="metadata" className="w-full rounded-xl border border-slate-700 bg-black" />
                    {v.title && <figcaption className="mt-2 text-sm text-slate-400">{v.title}</figcaption>}
                  </figure>
                ))}
              </div>
            )}

            {blocks.map((b, i) => (
              <Section key={b.key} title={b.title} index={String(i + 1).padStart(2, '0')}>
                {b.node}
              </Section>
            ))}

            <a href="/#projeler" className="text-amber-400 hover:underline">Diğer projelere dön</a>
          </main>
        )}
      </div>
    </div>
  )
}
