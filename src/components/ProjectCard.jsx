export default function ProjectCard({ title, description, tags, category }) {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700">
      {/* Resim alanı (Şimdilik yer tutucu, ileride kendi görsellerini ekleyeceğiz) */}
      <div className="h-48 bg-slate-700 w-full flex items-center justify-center">
        <span className="text-slate-500 font-medium">{category}</span>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        {/* Etiketler (Kullanılan Teknolojiler) */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full border border-amber-800/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}