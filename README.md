# Investment Tracker

Kişisel finans takibi için yazdığım bir web uygulaması. Başka platformlar üzerinden aldığım hisse, kripto ve dövizi burada kayıt altında tutuyorum: neyi kaçtan aldım, kaçtan sattım, şu an ne durumda, toplam bakiyeme nasıl yansıyor. Yanına bir de gelir/gider takibi ekledim, böylece aylık nakit akışını da aynı yerden görebiliyorum.

Aynı zamanda bir öğrenme projesi — mikroservis mimarisi, Docker, kimlik doğrulama ve CI/CD gibi konuları gerçek bir uygulama üzerinde denemek için kullanıyorum. O yüzden bazı yerler bilinçli olarak "üretim standardının" altında, bazı yerler ise bir kişisel projeye göre fazla detaylı.

## Ne yapıyor

**Varlık takibi:** Bir varlığı alırken adet, alış fiyatı, para birimi (TRY/USD) ve alım tarihi girilir. Aynı varlıktan tekrar alınca ortalama maliyet ağırlıklı olarak güncellenir. Satışta gerçekleşen kâr/zarar hesaplanıp kaydedilir. Güncel fiyatlar dış API'lerden çekilir; her varlık için alış fiyatı, güncel fiyat, maliyet, güncel değer ve kâr/zarar tabloda görünür.

**Gelir/gider takibi:** Kategorili gelir ve gider kaydı, giderlerde etiket ve taksit bilgisi tutulabiliyor. Genel bakış sayfası aylık gelir, gider ve net akışı gösteriyor.

**İşlem defteri:** Her alış, satış, gelir ve gider arka planda tek bir transaction tablosuna yazılır. Varlık silinse bile işlem geçmişi kalır. Uygulamanın veri modeli bu tabloya dayanıyor — ileride analiz özellikleri bunun üzerine kurulacak.

**Diğer:** Türkçe/İngilizce arayüz, varlık dağılımı ve kategori bazlı gider grafikleri.

## Mimari

```text
Tarayıcı
   |
   v
Nginx (web container, :80)
   |  /api/  -> portfolio-service
   |  /.ory/ -> kratos
   |  diğer  -> React static dosyaları
   |
   +--> Ory Kratos ---- Postgres (Kratos DB)
   |
   +--> Portfolio Service ---- Neon (PostgreSQL)
              |
              v
        Market Service ---- Redis (5 dk cache)
              |
              +--> Frankfurter API (döviz kurları)
              +--> Twelve Data API (hisse ve kripto fiyatları)
```

İki backend servisi var:

- **portfolio-service** (.NET 9, EF Core): varlıklar, işlemler, gelir/gider, dashboard hesapları. Veriyi Neon'daki PostgreSQL'de tutar.
- **market-service** (.NET 9): dış API'lerden fiyat çeker. Sonuçları 5 dakikalığına Redis'e yazar; böylece ücretsiz API limitlerine takılmadan sık sık fiyat gösterilebiliyor.

Kimlik doğrulama **Ory Kratos** ile: cookie tabanlı session, her istekte servisler cookie'yi Kratos'a doğrulatır (`/sessions/whoami`) ve dönen kimlik ID'siyle kullanıcının kendi verisi filtrelenir. Kayıt/giriş akışları Kratos'un self-service flow'larıyla çalışır.

Frontend React 19 + Vite, Tailwind CSS v4 ve shadcn/ui bileşenleriyle yazıldı. Grafikler için Recharts kullanılıyor.

## Çalıştırma

Tüm servisler Docker Compose ile ayağa kalkar:

```bash
docker compose up --build -d
```

| Container | İmaj | Port |
|---|---|---|
| web | nginx (custom) | 80 |
| portfolio-service | .NET 9 (custom) | 5001 |
| market-service | .NET 9 (custom) | 5002 |
| kratos | oryd/kratos:v1.2.0 | 4433, 4434 |
| postgres | postgres:16-alpine | 5432 |
| redis | redis:alpine | 6379 |

Gerekli ortam değişkenleri (`.env`): `DB_CONNECTION_STRING` (Neon bağlantısı) ve `TWELVEDATA_API_KEY`.

Deploy için basit bir kurulum var: `test` branch'ine push atınca WSL üzerinde çalışan self-hosted GitHub Actions runner'ı projeyi çekip `docker compose up --build -d` çalıştırıyor. EF Core migration'ları servis açılışında otomatik uygulanıyor.

## Kapsam dışı

Bu proje kişisel kullanım için; şunlar bilinçli olarak yok:

- E-posta doğrulama, şifre sıfırlama
- Rol bazlı yetkilendirme
- API Gateway, message queue, background job
- Sembol arama (desteklenen semboller şimdilik sabit bir liste: USD/EUR/GBP, AAPL/MSFT/NVDA/GOOGL, BTC/ETH/SOL)
