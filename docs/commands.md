# Komut Defteri

## Docker Compose

```bash
# Başlat (image yoksa build et)
docker compose up --build

# Arka planda başlat
docker compose up -d --build

# Durdur ve container/network temizle
docker compose down

# Servis durumları
docker compose ps

# Tüm loglar
docker compose logs

# Belirli servis logu
docker compose logs portfolio-service
docker compose logs market-service
docker compose logs kratos
docker compose logs redis
docker compose logs web

# Son 30 satır
docker compose logs portfolio-service --tail=30

# Canlı log takibi
docker compose logs -f portfolio-service

# Container içine gir
docker compose exec market-service sh
docker compose exec portfolio-service sh
docker compose exec redis sh
docker compose exec kratos sh

# Container içinden çık
exit

# Sadece bir servisi yeniden başlat
docker compose restart kratos
```

---

## Docker

```bash
# Çalışan container'lar
docker ps

# Tüm container'lar (durmuş dahil)
docker ps -a

# Container detayları (network, IP, env)
docker inspect <container-name>

# Network listesi
docker network ls

# Network detayı (hangi container'lar bağlı)
docker network inspect investment-tracker_default

# Image listesi
docker images

# Kullanılmayan her şeyi temizle (container, image, network, cache)
docker system prune -a

# Sadece durdurulmuş container'ları sil
docker container prune

# Environment variable'ları gör (container içinde)
docker compose exec market-service env
```

---

## Redis

```bash
# Redis'e bağlan ve ping at
docker compose exec redis redis-cli ping
# Beklenen: PONG

# Redis shell'ine gir
docker compose exec redis redis-cli

# Cache'deki tüm key'leri listele
docker compose exec redis redis-cli keys '*'

# Belirli key'i oku
docker compose exec redis redis-cli get currency:USD

# Key sil
docker compose exec redis redis-cli del currency:USD

# Tüm cache'i temizle
docker compose exec redis redis-cli flushall

# Redis bilgisi (port, versiyon)
docker compose exec redis redis-cli INFO server | grep port
```

---

## Ory Kratos

```bash
# Kratos public API — session kontrol
curl http://localhost:4433/sessions/whoami

# Kratos admin API — tüm kullanıcıları listele
curl http://localhost:4434/admin/identities

# Belirli kullanıcıyı getir (admin API)
curl http://localhost:4434/admin/identities/<identity-id>

# Kullanıcı sil (admin API)
curl -X DELETE http://localhost:4434/admin/identities/<identity-id>

# Kratos version
curl http://localhost:4433/version

# Kratos health check
curl http://localhost:4433/health/ready
curl http://localhost:4433/health/alive

# Login flow başlat (tarayıcıda)
# http://localhost:4433/self-service/login/browser

# Registration flow başlat (tarayıcıda)
# http://localhost:4433/self-service/registration/browser

# Kratos logları
docker compose logs kratos --tail=50
docker compose logs kratos-migrate --tail=20

# Kratos container içine gir
docker compose exec kratos sh

# Kratos DB'sine bağlan (Postgres container üzerinden)
docker compose exec postgres psql -U kratos -d kratos
```

---

## API Test

```bash
# Portfolio servisi (session cookie gerekir)
curl -b "ory_session=<token>" http://localhost:5001/api/portfolios
curl -b "ory_session=<token>" http://localhost:5001/api/dashboard

# Market servisi (session cookie gerekir)
curl -b "ory_session=<token>" "http://localhost:5002/api/market/prices?symbols=USD,AAPL,BTC"
```

---

## Linux / WSL2

```bash
# Hangi process hangi portu kullanıyor
sudo lsof -i :6379
sudo lsof -i :5001
sudo lsof -i :5002
sudo lsof -i :4433

# WSL2 IP adresi
hostname -I

# RAM durumu
free -h

# Servis durdur/başlat (WSL2 native servisler)
sudo service redis-server stop
sudo service redis-server start
sudo service docker start
sudo service docker status

# Dosya kopyala (Windows → WSL2) — tek dosya
cp /mnt/c/Users/acer/Desktop/investment-tracker/docker-compose.yml ~/investment-tracker/

# Birden fazla dosya kopyala
cp /mnt/c/Users/acer/Desktop/investment-tracker/kratos/kratos.yml ~/investment-tracker/kratos/
cp -r /mnt/c/Users/acer/Desktop/investment-tracker/kratos ~/investment-tracker/

# Gizli dosyaları göster
ls -a

# Dosya içeriği oku
cat .env
cat docker-compose.yml

# Dizin yapısını göster
ls -la

# Dosya içinde metin değiştir
sed -i 's|eski_metin|yeni_metin|g' dosya.txt
```

---

## EF Core Migration

```bash
# Migration oluştur (Windows'ta çalıştır)
cd portfolio-service
dotnet ef migrations add <MigrationAdi>

# Migration geri al
dotnet ef migrations remove

# Migration uygula
dotnet ef database update

# Migration listesi
dotnet ef migrations list
```

---

## Hata Ayıklama Sırası

Bir şey çalışmıyorsa bu sırayı takip et:

```bash
# 1. Container'lar ayakta mı?
docker compose ps

# 2. Hatalı servisin loguna bak
docker compose logs <servis-adı> --tail=50

# 3. Environment variable'lar doğru mu?
docker compose exec <servis-adı> env

# 4. Network sorunuysa — sıfırla
docker compose down
docker compose up --build

# 5. Port çakışması varsa — kimin kullandığını bul
sudo lsof -i :<port>

# 6. Kratos session geçerli mi?
curl http://localhost:4433/sessions/whoami

# 7. Kratos restart et
docker compose restart kratos
```
