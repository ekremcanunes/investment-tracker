# Tasarım Sistemi — "Pirinç / Ink"

Bu doküman uygulamanın görsel dilini ve **gelecekteki tüm tasarım geliştirmelerinde sabit kalacak** kuralları tanımlar. Yeni bir sayfa/bileşen eklerken buraya uy; token dışına çıkma.

> Kaynak dosya: [`src/index.css`](src/index.css) — tüm token'lar burada. Değişiklik önce burada yapılır, bileşenler token'ı kullanır.

---

## 1. Felsefe

- **AI-vari olmayan, zarif, sakin bir işlem enstrümanı.** Jenerik şablon görünümünden kaçınılır.
- **Vurgu tek yerde harcanır**, gerisi sessiz kalır. Pirinç vurgu az ve dozunda.
- **Rakamlar birinci sınıf vatandaştır** — mono + tabular, sütunlar hizalı.
- **Semantik renk (kâr/zarar) vurgudan ayrıdır.** Pirinç asla "artı/eksi" anlamı taşımaz.

---

## 2. Renk (token'lar)

Renkler `index.css`'te HSL `H S% L%` formatında tanımlı (shadcn yapısı). **Bileşenlerde token kullan, hex/`gray-950`/`blue-400` gibi ad-hoc renk YAZMA.**

| Token | Değer (hex) | Kullanım |
|-------|-------------|----------|
| `background` | `#100E0A` | Ana zemin (sıcak neredeyse-siyah) |
| `card` / `popover` | `#17140F` | Panel, kart, dropdown |
| `secondary` / `muted` / `accent` | koyu kahve-gri | Hover, ikincil yüzey |
| `foreground` | `#ECE4D6` | Ana metin (sıcak kırık beyaz) |
| `muted-foreground` | `#9A9083` | İkincil metin, etiket |
| `border` / `input` | `#2C261C` | Hairline çizgiler, input kenarı |
| `primary` (vurgu) | `#C8A66A` | **Mat pirinç** — aktif nav, ana buton, focus, link |
| `primary-foreground` | koyu ink | Pirinç üstündeki metin |
| `up` (semantik) | `#5CBF95` | Kâr / artış (zümrüt) |
| `down` (semantik) | `#E2867A` | Zarar / düşüş (gül) |
| `destructive` | gül tonu | Hata, silme |

**Kullanım sınıfları:** `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary`, `text-up`, `text-down`, `bg-up/10`, `bg-down/10`.

### Renk kuralları
- Vurgu (`primary`/pirinç) yalnızca: aktif nav, birincil aksiyon, focus halkası, link. Dekorasyon için değil.
- Kâr/zarar **her zaman** `up`/`down` — pirinç veya mavi değil.
- Yeni yüzey mi lazım? `card` → `secondary/40` → `background` sırası. Yeni gri icat etme.

---

## 3. Tipografi

| Rol | Font | Nerede |
|-----|------|--------|
| UI / metin | **Hanken Grotesk** (`--font-sans`) | Varsayılan, `body`'de |
| Rakam / ticker | **JetBrains Mono** (`--font-mono`) | `.tabular` sınıfıyla |

- Fontlar `@fontsource-variable/*` ile **self-host** ([`src/main.jsx`](src/main.jsx)) — CDN yok.
- **Tüm sayısal değerlere `.tabular` sınıfı ver** (fiyat, tutar, adet, %, ticker). Bu sınıf mono + `tabular-nums` + hafif letter-spacing verir → sütunlar hizalı.
- Başlıklar: `font-semibold tracking-tight`. Büyük başlıkta `text-balance`.
- Uppercase etiketler: `text-[11px] uppercase tracking-[0.14em] text-muted-foreground`.
- Font değişimi tek yerden: `index.css` → `--font-sans` / `--font-mono`.

---

## 4. Layout & boşluk

- **Kabuk:** sol sidebar (`w-60`, `bg-card`, `border-r`), sağda `main`. İçerik `max-w-7xl mx-auto px-8 py-10` ([`Layout.jsx`](src/components/Layout.jsx)).
- **Sayfa genişliği:**
  - Geniş/tablo sayfaları (Portföy) → tüm genişliği kullanır, **yatay scroll'dan kaçın** (sütunlar sığsın).
  - Okuma/özet sayfaları (Overview) → kendi içinde `max-w-3xl`.
- **Radius:** `--radius: 0.625rem`. Kartlar `rounded-xl`, küçük öğeler `rounded-lg`/`rounded-md`.
- **Kenarlıklar:** her zaman `border-border` — ince, hairline. Ağır gölge yok; gerekiyorsa `shadow-xl` sadece drawer/overlay'de.
- **Boşluk:** grid/flex + `gap`. Per-element margin yığma.

---

## 5. Bileşen kuralları

- **shadcn bileşenleri** (`src/components/ui/*`) token tabanlıdır — onları kullan, yeniden renklendirme.
- Tablo: `border-border/60` satır çizgisi, `hover:bg-secondary/40`, başlık `text-[11px] uppercase tracking-wider text-muted-foreground`.
- Chip/rozet: küçük, `rounded-full`, semantik renk + `/10` zemin (`text-up bg-up/10`).
- Buton: birincil = `bg-primary text-primary-foreground hover:opacity-90`. İkincil = `variant="outline"`/`ghost`.
- Tıklanabilir satır/kart `cursor-pointer` + hover yüzeyi almalı; aksiyon butonları satır tıklamasını yutmasın (`stopPropagation`).

---

## 6. Hareket (motion)

- Yumuşak geçiş: `a/button/[role=button]` için `.18s ease` (index.css'te global). Ekstra için `.transition-smooth`.
- **`prefers-reduced-motion` her zaman respekt edilir** — dekoratif animasyon bu blokta kalır.
- Az = çok. Aşırı animasyon "AI-vari" hissi verir; kaçın.

---

## 7. Tek tema (bilinçli)

- Sadece **koyu** tema — Pirinç/Ink dünyasına bağlı bilinçli tercih. Şu an açık tema yok.
- İleride açık tema istenirse: token'ları `@media (prefers-color-scheme: light)` + `:root[data-theme=...]` ile yeniden tanımla, bileşenlere dokunma.

---

## 8. YAPMA listesi (AI-vari kaçınma)

- ❌ Ad-hoc renk (`gray-950`, `blue-400`, `#111827`) — sadece token.
- ❌ Jenerik shadcn mavisi / mor-mavi gradient / acid-green pop.
- ❌ Rakamı normal fontla yazmak — `.tabular` kullan.
- ❌ Vurgu rengini kâr/zarar için kullanmak.
- ❌ Her yere gölge/`rounded-full` kart, emoji section başlığı, ortalanmış her şey.
- ❌ Yeni gri/ara renk icat etmek — mevcut yüzey merdivenini kullan.

---

## 9. Değişiklik akışı

1. Renk/font/radius → **önce `index.css` token'ı**.
2. Bileşen → token sınıfını kullan.
3. Yeni sayısal alan → `.tabular`.
4. Yeni sayfa → doğru `max-w` (tablo geniş, özet dar).
5. Bittiğinde `npm run build` ile doğrula.
