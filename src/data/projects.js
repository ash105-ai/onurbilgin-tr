// Her proje için dosyalarını public/projects/<slug>/ klasörüne koy.
// Yollar "/projects/<slug>/..." şeklinde yazılır. Boş bıraktığın alanlar sayfada görünmez.
export const projects = [
  {
    slug: 'hmi',
    title: 'Görüntü İşlemeli Hesap Makinesi',
    category: 'Bilgisayarlı Görü & Gömülü Sistemler',
    summary:
      'El hareketleriyle temassız kullanılan, QR kodla iki aşamalı doğrulama (2FA) ve sesli geri bildirimle güçlendirilmiş bir hesap makinesi. Bandırma Onyedi Eylül Üniversitesi bitirme projem.',
    tags: ['Python', 'OpenCV', 'MediaPipe', 'Arduino', 'PySerial', '2FA / QR', 'pyttsx3'],
    cover: '/projects/hmi/cover.jpg',
    purpose:
      'Fiziksel tuşlara dokunmadan, yalnızca işaret parmağının havadaki hareketiyle çalışan bir hesap makinesi kurmak istedim: Kamera elin 21 eklem noktasını MediaPipe ile takip ediyor, parmak ucu sanal bir imlece dönüşüyor ve "Havada Tıklama" (dwell time) ile tuşlar seçiliyor. Yazılımda hesaplanan sonuç, Arduino üzerinden fiziksel bir dot-matrix ekrana aktarılarak dijital işlem somut bir çıktıya dönüşüyor. Furkan Özbek ile birlikte, Doç. Dr. Abdullah Gökyıldırım danışmanlığında yürüttüğümüz lisans bitirme projemiz bu.',
    sections: [
      {
        title: 'Nasıl Çalışıyor?',
        text:
          'Kameradan gelen görüntü OpenCV ile işlenip MediaPipe\'a veriliyor; kütüphane elin 21 uzamsal eklem noktasını gerçek zamanlı çıkarıyor. İşaret parmağının ucu (Landmark 8) ekrandaki sanal tuşların üzerinde belirli bir süre (dwell time) beklediğinde seçim gerçekleşiyor, bu sırada dairesel bir yüzde göstergesiyle kullanıcıya görsel geri bildirim veriliyor. Havada tuşlanan işlem anında hesaplanıyor; sonuç, PySerial ile kurduğum özgün "MatrixBridge" köprü yazılımı üzerinden Arduino Uno\'ya iletiliyor ve 4x8x8 modüler dot-matrix ekranda kayan yazı olarak beliriyor.',
      },
      {
        title: 'Güvenlik Katmanı: QR tabanlı 2FA',
        text:
          'Arayüze gizlenmiş "2015" kodu havada tuşlandığında iki aşamalı doğrulama devreye giriyor. Sistem rastgele bir OTP üretip SMTP üzerinden seçilen yöneticinin (Admin 1 / Admin 2) e-postasına dinamik bir QR kod gönderiyor; bu kod telefondan kameraya okutulduğunda cv2.QRCodeDetector() ile doğrulanıp "canlılık kanıtı" sağlanmış oluyor. Doğrulama başarılıysa ilgili yöneticinin profil fotoğrafı arayüze dahil ediliyor ve sesli karşılama yapılıyor. Geçersiz bir QR kod okutulursa sistem kilitleniyor, tüm yöneticilere uyarı e-postası gidiyor ve dot-matrix ekranda görsel/işitsel bir alarm tetikleniyor.',
      },
      
      {
        title: 'Karşılaştığım zorluklar',
        text:
          'Düşük ışıkta MediaPipe\'ın el takibi kararsızlaşabiliyordu; güven eşiklerini optimize edip imleç hareketine yumuşatma filtresi ekleyerek çözdüm. El titremesinden kaynaklanan yanlış tuş seçimleri için dwell süresini ayarlayıp görsel geri bildirimi güçlendirdim. PySerial üzerinden asenkron haberleşmede zaman zaman veri kaybı yaşandı; hata yakalama ve tampon (buffer) kontrolü ekledim. Kamera işleme, ses motoru, e-posta gönderimi ve Arduino haberleşmesi aynı anda çalıştığı için bloklayıcı işlemleri ayrı thread\'lere taşımam gerekti; aksi halde arayüz kilitleniyordu.',
      },
    ],
    videos: [
      // { title: 'Çalışırken', src: '/projects/hmi/video.mp4' },
    ],
    gallery: [
      '/projects/hmi/gallery/01-mimari.jpg',
      '/projects/hmi/gallery/02-duzenek.jpg',
      '/projects/hmi/gallery/03-guvenlik-alarm.jpg',
    ],
    code: [
      { name: 'Python', language: 'main.py', path: '/projects/hmi/code/main.py' },
      { name: 'Arduino', language: 'arduino_matrix.ino', path: '/projects/hmi/code/arduino_matrix.ino' },
      { name: 'Bridge', language: 'matrix_bridge.py', path: '/projects/hmi/code/matrix_bridge.py' },
    ],
    files: [
      // { name: 'Proje raporu (PDF)', path: '/projects/hmi/files/rapor.pdf' },
    ],
  },
  {
    slug: 'spotify',
    title: 'RFID Kontrollü Spotify Çalar',
    category: 'Gömülü Sistemler & IoT',
    summary:
      'Telefonla bir RFID karta yazdığım Spotify linkini ESP32 ile okuyan, Wi-Fi üzerinden şarkı adını çekip OLED ekranda dönen plak animasyonuyla gösteren donanım projesi.',
    tags: ['ESP32', 'Arduino', 'Python', 'RFID / NFC', 'OLED', 'Wi-Fi', 'Spotify API'],
    cover: '/projects/spotify/cover.jpg',
    purpose:
      'Bir anahtarlığı okutarak, ekrana dokunmadan Spotify\'da bir şarkıyı başlatmak istedim. Kart üzerine telefonumla yazdığım Spotify linkini MFRC522 RFID modülüyle ESP32\'ye okutuyorum; ESP32 bu linki bilgisayara iletip şarkıyı açtırıyor, aynı zamanda Wi-Fi ile Spotify\'dan şarkının adını çekip küçük bir OLED ekranda dönen bir plak animasyonuyla birlikte kaydırarak gösteriyor.',
    sections: [
      {
        title: 'Nasıl çalışıyor?',
        text:
          'Telefonumla NFC kartın üzerine Spotify şarkı linkini (NDEF formatında) yazıyorum. ESP32 üzerindeki MFRC522 modülü kartı okutulduğunda içindeki ham veriyi tarıyor, linki ayıklayıp seri port üzerinden bilgisayara "URL:..." şeklinde gönderiyor. Bilgisayardaki küçük bir Python betiği bu satırı dinleyip geleni doğrudan tarayıcıda/Spotify uygulamasında açıyor. Eşzamanlı olarak ESP32, Wi-Fi\'a bağlanıp Spotify\'ın herkese açık oEmbed API\'sinden o linke ait şarkı adını ve sanatçıyı çekiyor; OLED ekranda dönen bir plak animasyonuyla birlikte alt satırda kayan yazı olarak gösteriyor.',
      },
      {
        title: 'Teknik engel: kartın şifrelenmiş hafızası',
        text:
          'İlk denemede kart okutulduğunda sürekli "Timeout in communication" hatası aldım. Sebebi şu: telefon karta NDEF verisi yazarken, kartın fabrika şifresini (FF FF FF FF FF FF) otomatik olarak NFC\'nin evrensel NDEF şifresine (D3 F7 D3 F7 D3 F7) çeviriyor. Basit bir çözüm olarak önce kartın değişmeyen donanım kimlik numarasını (UID) okuyup sabit bir şarkıyla eşleştirmeyi denedim, ama bu her yeni şarkı için koda elle müdahale gerektiriyordu. Bunun yerine doğru yolu seçip C++ tarafında bu evrensel NDEF şifresiyle kimlik doğrulaması yaparak kartın gerçek hafıza sektörlerini okumayı ve içindeki linki ham veriden ayıklamayı başardım.',
      },
      {
        title: 'Şarkı adını ekranda göstermek',
        text:
          'Başta ekranda sabit "Spotify\'da Çalınıyor..." yazıyordu; ESP32 internete bağlı olmadığı için linkin hangi şarkıya ait olduğunu bilmiyordu. Her yeni kart için şarkı adını koda elle yazmak istemediğim için ESP32\'yi Wi-Fi\'a bağlayıp Spotify\'ın oEmbed API\'sine HTTP isteği atacak şekilde genişlettim; dönen JSON\'dan şarkı adı ve sanatçı adını ayrıştırıp OLED\'de kaydırıyorum. Böylece sistem tamamen otomatik hale geldi, yeni bir anahtarlık için Python veya Arduino tarafında hiçbir ekleme yapmaya gerek kalmadı.',
      },
    ],
    videos: [
      // { title: 'Çalışırken', src: '/projects/spotify/video.mp4' },
    ],
    gallery: [
      '/projects/spotify/gallery/01-baglanti-semasi.jpg',
    ],
    code: [
      { name: 'ESP32', language: 'esp32_rfid_oled.ino', path: '/projects/spotify/code/esp32_rfid_oled.ino' },
      { name: 'Python', language: 'player.py', path: '/projects/spotify/code/player.py' },
    ],
    files: [],
  },
  {
    slug: 'otomasyon',
    title: 'Endüstriyel Renk Ayırma ve Paketleme Sistemi',
    category: 'Otomasyon',
    summary:
      'Siemens TIA Portal (S7-1200) ve Factory I/O simülasyonu ile geliştirdiğim, parçaları renklerine göre ayırıp robot kollarla kutulayan ladder logic tabanlı bir otomasyon sistemi.',
    tags: ['TIA Portal', 'S7-1200', 'PLC', 'Ladder Logic', 'Factory I/O'],
    cover: '/projects/otomasyon/cover.jpg',
    purpose:
      'Hat üzerinden gelen Mavi, Yeşil ve Gri parçaları görüntü sensörleriyle tanıyıp iki eksenli robot kollarla kutulara dizen, tamamlanan kutuları döner mekanizmayla çıkışa yönlendiren bir üretim hattını baştan sona PLC ile kontrol etmek istedim. Sistemi Factory I/O ortamında modelleyip Siemens TIA Portal\'da LADDER dilinde programladım.',
    sections: [
      {
        title: 'Sistem nasıl işliyor?',
        text:
          'Ana kontrolör olarak Siemens S7-1200 (CPU 1215DC/DC/DC) kullandım. Üç bağımsız konveyör hattı üzerindeki vizyon sensörleri gelen parçaların rengini (Mavi, Yeşil, Gri) anlık olarak okuyor; kapasitif sensörler parçanın hat üzerindeki varlığını, retroreflektif sensörler ise parçanın robot kolunun çalışma alanına ulaştığını doğruluyor. Bu verilere göre üç adet iki eksenli Pick & Place robot kolu, kendi renk grubundaki parçayı vantuzla hattan alıp boş kutulara yerleştiriyor. Sistemin hedefi her kutuya tam olarak 1 Mavi, 1 Yeşil ve 1 Gri parça dizmek; tamamlanan kutular çıkış konveyörüne ilerleyip döner bir mekanizmayla 90° döndürülerek hattan tahliye ediliyor.',
      },
      {
        title: 'Güvenlik ve kararlılık lojiği',
        text:
          'Endüstriyel standartlara uygun olmasına özen gösterdim: Stop ve acil durdurma (E-Stop) butonlarını Normalde Kapalı (NC) kontak lojiğiyle programladım, böylece bir kablo kopması ya da arıza durumunda sistem otomatik olarak güvenli duruşa geçiyor. Konveyör motorlarının çalışma durumu ve robot kollarının adım takibi için SR/RS (Set/Reset) flip-flop blokları kullandım; aynı anda hem Set hem Reset sinyali geldiğinde hangisinin baskın olacağını TIA Portal\'ın blok üzerindeki harf indisiyle (S/R) belirleyerek olası sistem kilitlenmelerinin önüne geçtim. Her renk için ayrı sayaçlar (CTU) ve tamamlanan kutuları takip eden bir kutu sayacı ekleyip üretim verilerini Data Block (DB) içinde tuttum.',
      },
    ],
    videos: [
      // { title: 'Çalışırken', src: '/projects/otomasyon/video.mp4' },
    ],
    gallery: [
      '/projects/otomasyon/cover.jpg',
    ],
    code: [],
    files: [
      { name: 'Ladder logic çıktısı — FB1 (PDF)', path: '/projects/otomasyon/files/ladder-logic-fb1.pdf' },
      { name: 'TIA Portal + Factory I/O proje dosyaları (.zip)', path: '/projects/otomasyon/files/tia-portal-ve-factoryio-projesi.zip' },
    ],
  },
]
