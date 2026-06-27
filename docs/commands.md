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

# Container içinden çık
exit
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

## API Test

```bash
# Portfolio servisi
curl http://localhost:5001/api/portfolios
curl http://localhost:5001/api/dashboard

# Market servisi
curl http://localhost:5002/api/market/prices?symbols=USD
curl "http://localhost:5002/api/market/prices?symbols=USD,AAPL,BTC"
```

---

## Linux / WSL2

```bash
# Hangi process hangi portu kullanıyor
sudo lsof -i :6379
sudo lsof -i :5001
sudo lsof -i :5002

# WSL2 IP adresi
hostname -I

# Servis durdur/başlat (WSL2 native servisler)
sudo service redis-server stop
sudo service redis-server start
sudo service docker start
sudo service docker status

# Dosya kopyala (Windows → WSL2)
cp /mnt/c/Users/acer/Desktop/investment-tracker/docker-compose.yml ~/investment-tracker/docker-compose.yml

# Tüm proje kopyala
cp -r /mnt/c/Users/acer/Desktop/investment-tracker ~/investment-tracker

# Gizli dosyaları göster
ls -a

# Dosya içeriği oku
cat .env
cat docker-compose.yml

# Dizin yapısını göster
ls -la
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
```
