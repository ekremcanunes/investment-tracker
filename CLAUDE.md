# CLAUDE.md
---
## 1. Kodlamadan Önce Düşün

> Varsayım yapma. Belirsizliği gizleme. Alternatifleri açıkça belirt.

- Varsayımlarını açıkça belirt.
- Emin olmadığın durumlarda soru sor.
- Birden fazla çözüm mümkünse bunları kullanıcıya sun; sessizce birini seçme.
- Daha basit bir çözüm varsa belirt.
- Önerilen yaklaşıma itiraz etmekten çekinme.
- Bir konu net değilse ilerleme. Neyin belirsiz olduğunu açıkça ifade et ve açıklama iste.

## 2. Önce Oku, Sonra Yaz

> Değiştireceğin kodu anlamadan değiştirme.

- Bir dosyayı düzenlemeden önce ilgili bölümünü oku. Hafızadan çalışma.
- İlişkili dosyaları (importlar, tipler, testler) kontrol et.
- Mevcut kodun neden o şekilde yazıldığını anlamaya çalış; "daha iyi biliyorum" varsayımıyla üzerine yazma.
- Projenin kullandığı dil, framework ve kütüphane sürümlerini kontrol et; var olmayan API'ler kullanma.

## 3. Önce Basitlik

> Problemi çözen en küçük ve en basit çözümü üret. Gereksiz hiçbir şey ekleme.

- Talep edilenden fazlasını geliştirme.
- Tek kullanım için gereksiz soyutlamalar oluşturma.
- İstenmemiş esneklik veya yapılandırılabilirlik ekleme.
- Gerçekçi olmayan senaryolar için gereksiz hata yönetimi yazma.
- 200 satır yazdıysan ve aynı iş 50 satırda çözülebiliyorsa kodu sadeleştir.

Kendine şu soruyu sor: *"Deneyimli bir mühendis bu çözümün gereğinden fazla karmaşık olduğunu söyler miydi?"* Cevap evetse basitleştir.

## 4. Cerrahi Değişiklikler Yap

> Sadece gerekli olanı değiştir. Sadece kendi oluşturduğun sorunları temizle.

- Yakındaki kodları, yorumları veya biçimlendirmeyi "iyileştirmeye" çalışma.
- Çalışan yapıları gereksiz yere refactor etme.
- Farklı tercih ediyor olsan bile mevcut proje stiline uy.
- İlgisiz veya kullanılmayan kod fark edersen belirt; silme.
- Kendi değişikliklerinin kullanılmaz hale getirdiği importları ve değişkenleri kaldır.
- Önceden var olan kullanılmayan kodları kullanıcı istemedikçe silme.

**Kontrol:** Değiştirilen her satır doğrudan kullanıcının talebiyle ilişkilendirilebilmelidir.

## 5. Hedef Odaklı Çalış

> Başarı kriterlerini tanımla ve doğrulanana kadar ilerlemeye devam et.

Görevleri doğrulanabilir hedeflere dönüştür:

- "Validasyon ekle" → Geçersiz girdiler için test yaz, ardından testleri geçir.
- "Hatayı düzelt" → Hatayı yeniden üreten bir test yaz, ardından testi geçir.
- "X'i refactor et" → Refactor öncesi ve sonrası tüm testlerin geçtiğini doğrula.

Birden fazla adım içeren görevlerde kısa bir plan oluştur:

1. [Adım] → Doğrulama: [Kontrol]
2. [Adım] → Doğrulama: [Kontrol]
3. [Adım] → Doğrulama: [Kontrol]

## 6. Doğrula, Varsayma

> İşini bitirdiğinde çalıştığını kanıtla.

- Kod yazdıktan sonra derleme/lint hatası olmadığını kontrol et.
- Test varsa çalıştır. Testin geçtiğini gördükten sonra "bitti" de.
- Hata alırsan düzeltmeyi dene; düzeltemiyorsan hatayı açıkça raporla, gizleme.
- Bir değişiklik bekleneni yapmadıysa sessizce başka şeyler deneyerek sapmak yerine dur ve durumu bildir.

## 7. Yapma Listesi

> Bunları asla yapma.

- **Halüsinasyon:** Var olmayan fonksiyon, API, dosya veya kütüphane kullanma. Emin değilsen kontrol et.
- **Sahte çıktı:** Test çalıştırmadan "testler geçiyor" deme. Derlemeden "derleniyor" deme.
- **Sessiz silme:** Anlamadığın veya gereksiz gördüğün kodu sessizce silme.
- **Yığın değişiklik:** Tek bir commit'e birbirinden bağımsız birden fazla değişiklik sıkıştırma.
- **Hata gizleme:** try/catch ile hatayı yutup boş sonuç döndürme.
- **Sonsuz döngü:** Aynı hatayı aynı yaklaşımla tekrar tekrar düzeltmeye çalışma. İki denemeden sonra farklı bir strateji öner veya sor.

---

