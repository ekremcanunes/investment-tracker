# Docker Öğrenim Notları

## Temel Kavramlar

### Image vs Container
- **Image** → Tarif. Dockerfile'dan build edilir. Çalışmaz, sadece şablondur.
- **Container** → Çalışan kopya. Image'dan oluşturulur. Birden fazla container aynı image'dan çalışabilir.

### Dockerfile
Her satır bir katman (layer) oluşturur. Docker bu katmanları cache'ler — değişmeyen katmanlar tekrar build edilmez.

```dockerfile
FROM        # Hangi image'dan başla (base image)
WORKDIR     # Container içinde çalışma dizini oluştur ve gir
COPY        # Dosyaları host'tan container'a kopyala
RUN         # Build sırasında komut çalıştır (sonuç image'a işlenir)
CMD         # Container başladığında çalışacak komut
```

### Multi-Stage Build
Büyük build araçlarını (SDK, Node) production image'ına taşımamak için kullanılır.

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /publish
# -c Release → production modu, optimize, debug sembolü yok
# -o /publish → çıktıyı bu klasöre yaz

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /publish .
CMD ["dotnet", "market-service.dll"]
# CMD array formatı → shell olmadan direkt çalıştır, sinyaller düzgün iletilir
```

```dockerfile
# Web için (React)
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build
# npm install → bağımlılıkları kur
# npm run build → /app/dist klasörüne statik dosyalar üretir

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx statik dosyaları /usr/share/nginx/html'den sunar
# CMD yazmıyoruz — nginx image kendi CMD'sini taşıyor
```

### Image Tag
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk        # latest → tehlikeli, her build farklı versiyon gelebilir
FROM mcr.microsoft.com/dotnet/sdk:9.0    # sabit versiyon → güvenli
```

### CMD: Shell Form vs Exec Form
```dockerfile
CMD dotnet app.dll              # shell form → /bin/sh üzerinden çalışır, sinyal iletimi bozuk
CMD ["dotnet", "app.dll"]       # exec form → direkt çalışır, docker stop düzgün çalışır
```

---

## Docker Networking

### Container İletişimi
- Container'lar birbirini **servis adıyla** bulur, IP ile değil.
- `docker-compose.yml`'de her servis adı otomatik DNS kaydı olur.
- `portfolio-service` → `market-service`'e `http://market-service:5002` ile erişir.

### 0.0.0.0 vs localhost
```
localhost   → sadece kendi container'ı dinler, dışarıdan erişilemez
0.0.0.0     → tüm arayüzleri dinler, dışarıdan erişilebilir
```

### Port Expose Zinciri
```
Windows tarayıcı → localhost:5001
→ WSL2 otomatik forward
→ Docker port binding (ports: 5001:5001)
→ Container 0.0.0.0:5001
→ Uygulama
```

### Web Container Farkı
React uygulaması **tarayıcıda** çalışır, container içinde değil.
`api.js`'teki `localhost:5001` → kullanıcının makinesinin 5001 portunu kasteder → expose edildiği için çalışır.

---

## Docker Compose

### Environment Variables
```yaml
environment:
  - ASPNETCORE_URLS=http://0.0.0.0:5001     # UseUrls'ü ezer
  - ASPNETCORE_ENVIRONMENT=Production
  - ConnectionStrings__DefaultConnection=${DB_CONNECTION_STRING}  # .env'den okur
```

`.env` dosyası compose ile aynı klasörde olmalı. Hassas bilgiler buraya, gitignore'a ekli.

### depends_on
```yaml
depends_on:
  - redis     # redis başlamadan bu servis başlamaz
```

### appsettings Hiyerarşisi (.NET)
1. `appsettings.json` → default değerler, commit'lenebilir
2. `appsettings.Development.json` → yerel credentials, gitignore'da
3. Environment variables → compose'dan gelir, appsettings'i ezer

---

## Karşılaşılan Sorunlar ve Çözümler

### UseUrls localhost sorunu
**Sorun:** `builder.WebHost.UseUrls("http://localhost:5001")` container dışından erişilmesini engeller.
**Çözüm:** `ASPNETCORE_URLS=http://0.0.0.0:5001` environment variable ile ez.

### latest tag versiyonu
**Sorun:** `FROM dotnet/sdk` → .NET 10 geldi, proje .NET 9 ile yazılmış, uyumsuzluk.
**Çözüm:** `FROM dotnet/sdk:9.0` ile sabit versiyon kullan.

### Port çakışması
**Sorun:** WSL2'de Redis servisi 6379'u tutuyordu, Docker Redis container'ı başlayamadı.
**Çözüm:** `sudo service redis-server stop`

### Network dışı container
**Sorun:** Redis container eski network'te kaldı, yeni container'lar onu bulamadı.
**Çözüm:** `docker compose down && docker compose up` — her şeyi sıfırlar.
