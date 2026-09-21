export default function About() {
  return (
    <section id="hakkimda" className="w-full py-20 px-6 bg-slate-900">
      <div className="max-w-4xl mx-auto text-center border-t border-slate-800 pt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Kısaca <span className="text-amber-400">Ben</span>
        </h2>
        <p className="text-lg text-slate-300 leading-relaxed mb-6">
          Bandırma Onyedi Eylül Üniversitesi'nde Elektrik-Elektronik Mühendisliği bölümünden mezun oldum. Yazılımın sadece ekranda kalmasından ziyade, donanımla birleşip gerçek dünyada fiziksel bir tepkiye dönüşmesi beni her zaman daha çok heyecanlandırdı.
        </p>
        <p className="text-lg text-slate-300 leading-relaxed">
          Bu yüzden projelerimde C/C++, Python ve modern web teknolojilerini harmanlayarak; gömülü sistemler, yapay zeka destekli arayüzler (HMI) ve endüstriyel otomasyon sistemleri tasarlıyorum. Amacım, donanımın gücünü modern yazılımın esnekliğiyle buluşturmak.
        </p>
      </div>
    </section>
  )
}