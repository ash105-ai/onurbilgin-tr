import ProjectCard from './ProjectCard'
import { projects } from '../data/projects'

export default function Projects() {
  return (
    <section id="projeler" className="w-full py-20 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          Öne Çıkan <span className="text-amber-400">Projelerim</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <ProjectCard key={p.slug} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
