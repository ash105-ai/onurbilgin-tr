// Kartın tamamı tıklanabilir; proje sayfası yeni sekmede açılır.
export default function ProjectCard({ slug, title, summary, tags, category, cover }) {
  return (
    <a
      href={`/#/proje/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:shadow-amber-500/20 hover:-translate-y-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
    >
      <div className="aspect-video w-full bg-slate-700 flex items-center justify-center overflow-hidden">
        {cover ? (
          <img src={cover} alt={`${title} kapak görseli`} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-500 font-medium">{category}</span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        <p className="text-sm text-amber-400/80 mb-1">{category}</p>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-4">{summary}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full border border-amber-800/50">
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-auto text-sm font-semibold text-amber-400 group-hover:underline">
          Projeyi incele
        </span>
      </div>
    </a>
  )
}
