export default function Contact() {
  return (
    <footer id="iletisim" className="w-full py-20 px-6 bg-slate-900 border-t border-slate-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Benimle <span className="text-amber-400">İletişime Geç</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10">
          Yeni bir otomasyon projesi, yazılım-donanım entegrasyonu veya sadece teknoloji üzerine sohbet etmek için bana ulaşabilirsin.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
  <a 
    href="mailto:onurbilgin105@gmail.com" 
    className="w-full sm:w-48 px-4 py-3 bg-slate-800 text-amber-400 font-bold rounded-lg border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all text-center block"
  >
    E-Posta Gönder

  </a>
    <a 
    href="https://www.linkedin.com/in/onur-bilgin-925623369/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-full sm:w-48 px-4 py-3 bg-slate-800 text-amber-400 font-bold rounded-lg border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all text-center block"
  >
    LinkedIn
    
  </a>
  <a 
    href="https://www.instagram.com/0nur.bilgn/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-full sm:w-48 px-4 py-3 bg-slate-800 text-amber-400 font-bold rounded-lg border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all text-center block"
  >
    Instagram
  </a>
  

</div>


        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Onur Bilgin. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}