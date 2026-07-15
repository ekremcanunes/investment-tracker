# Komut Rehberi

Bu projede sık kullanılan komutlar. Tümü WSL2 terminalinde, proje kök dizininde çalıştırılır.

## Docker Compose

```bash
docker compose ps                  # servislerin durumunu göster (ayakta mı?)
docker compose up -d               # tüm servisleri arka planda başlat
docker compose up -d --build       # imajları yeniden build edip başlat (kod değişince)
docker compose down                # tüm servisleri durdur ve container'ları sil
docker compose logs -f kratos      # bir servisin loglarını canlı izle (Ctrl+C ile çık)
docker compose logs --tail 50 web  # son 50 satır log
docker compose restart portfolio-service   # tek servisi yeniden başlat
docker compose exec kratos sh      # çalışan container içinde shell aç
```

> `docker compose exec <servis>` → compose'daki servis adını kullanır (`postgres`, `kratos`, `redis`, `web`, `portfolio-service`, `market-service`). Container'ın tam adını bilmek gerekmez.

## Docker (genel)

```bash
docker ps                          # çalışan container'lar
docker ps -a                       # duranlar dahil hepsi
docker images                      # indirilen imajlar
docker volume ls                   # volume'lar (kratos_postgres_data burada)
docker system df                   # docker'ın kapladığı disk alanı
docker logs <container-adı>        # compose dışı container logları
```

## Kratos Postgres (kullanıcı/kimlik verisi)

```bash
docker compose exec postgres psql -U kratos -d kratos   # veritabanına bağlan
```

Bağlandıktan sonra psql içinde:

```sql
\dt                                          -- tabloları listele
\d identities                                -- bir tablonun kolonlarını göster
SELECT id, traits, created_at FROM identities;   -- kayıtlı kullanıcılar (email traits içinde JSON)
SELECT * FROM sessions ORDER BY issued_at DESC LIMIT 5;  -- son oturumlar
\q                                           -- çık
```

### psql temel komutlar

| Komut | Ne yapar |
|-------|----------|
| `\dt` | Tabloları listeler |
| `\d <tablo>` | Tablonun şemasını gösterir |
| `\l` | Veritabanlarını listeler |
| `\c <db>` | Başka veritabanına geçer |
| `\x` | Geniş satırları dikey gösterir (aç/kapa) |
| `\q` | Çıkar |

> Şifreler `identity_credentials` tablosunda bcrypt hash olarak durur — plaintext yoktur, "şifreyi görmek" diye bir şey mümkün değildir (bu iyi bir şey).

## Redis (market cache)

```bash
docker compose exec redis redis-cli    # redis komut satırına bağlan
```

redis-cli içinde:

```
KEYS *              # tüm cache anahtarları (dev'de ok, prod'da kullanma)
GET <anahtar>       # bir anahtarın değeri
TTL <anahtar>       # kalan yaşam süresi (saniye; -2 = yok, -1 = süresiz)
FLUSHALL            # tüm cache'i temizle (dikkat!)
exit                # çık
```

## Kratos API (hızlı kontrol)

```bash
curl -s http://localhost:4433/health/ready        # kratos ayakta mı?
curl -s http://localhost:4434/admin/identities | head -50   # admin API: kullanıcı listesi (JSON)
```

## GitHub Actions Runner (WSL2)

```bash
sudo systemctl status actions.runner.*   # runner servisi çalışıyor mu?
```

## Sorun Giderme

```bash
docker compose logs kratos-migrate       # migration hatası şüphesinde
docker compose down && docker compose up -d --build   # temiz yeniden başlatma
docker volume rm investment-tracker_kratos_postgres_data  # DİKKAT: tüm kullanıcı kayıtlarını siler
```
