import ProjectCard from './ProjectCard'

export default function Projects() {
  const myProjects = [
    {
      title: "Görüş Tabanlı HMI Prototipi",
      category: "Yapay Zeka & Görüntü İşleme",
      description: "MediaPipe ve OpenCV kullanarak geliştirdiğim, el ve yüz hareketleriyle kontrol edilebilen eller serbest İnsan-Makine Arayüzü projesi.",
      tags: ["Python", "OpenCV", "MediaPipe", "C/C++"]
    },
    {
      title: "RFID Kontrollü Spotify Çalar",
      category: "Gömülü Sistemler & IoT",
      description: "ESP32 mikrodenetleyicisi ile Spotify API entegrasyonu. RFID kart okutarak müzik çalabilen ve OLED ekranda bilgi gösteren donanım projesi.",
      tags: ["ESP32", "C++", "IoT", "RFID", "API"]
    },
    {
      title: "Endüstriyel Renk Ayırma Sistemi",
      category: "Otomasyon",
      description: "Siemens TIA Portal (S7-1200) ve Factory I/O simülasyonu kullanarak geliştirdiğim, ladder logic tabanlı otomasyon projesi.",
      tags: ["TIA Portal", "PLC", "Ladder Logic", "Factory I/O"]
    }
  ]

  return (
    <section id="projeler" className="w-full py-20 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          Öne Çıkan <span className="text-amber-400">Projelerim</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myProjects.map((project, index) => (
            <ProjectCard 
              key={index}
              title={project.title}
              description={project.description}
              tags={project.tags}
              category={project.category}
            />
          ))}
        </div>
      </div>
    </section>
  )
}