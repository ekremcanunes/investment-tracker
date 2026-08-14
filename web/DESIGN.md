# Tasarım Sistemi — "LEDGER" (Muhasebe Defteri)

Uygulamanın görsel dili: **açık/bone, muhasebe defteri** kimliği. Konuya sadık (bu bir portföy defteri), ayırt edici, açık tema. Gelecekteki tüm tasarım işi buna sabit kalır.

> Kaynak: [`src/index.css`](src/index.css) — tüm token'lar burada. Önce token, sonra bileşen.
> Detaylı gerekçe: [`../docs/superpowers/specs/2026-08-10-ledger-redesign-design.md`](../docs/superpowers/specs/2026-08-10-ledger-redesign-design.md)

---

## 1. Felsefe

- **Muhasebe defteri estetiği**: cetvel çizgileri, çift-giriş, makbuz, folio numaraları.
- **AI-vari değil**: kimlik renkten değil **yapı + tipografi + doku + bir riskten** gelir (kırmızı marj çizgisi, sert offset gölge, cetvelli tablolar).
- **Rakamlar birinci sınıf**: mono + tabular, sütunlar hizalı.
- **Semantik (kâr/zarar) vurgudan ayrı**: pirinç/marj-kırmızısı asla artı/eksi anlamı taşımaz.

---

## 2. Renk (token'lar) — açık/bone

| Token | Hex | Kullanım |
|-------|-----|----------|
| `background` | `#EFEDE6` | Ana zemin (bone) |
| `card` | `#F7F6F1` | Panel/kart/popover |
| `foreground` | `#1C1B18` | Ana metin/çizgi (ink) |
| `muted-foreground` | `#6A675E` | İkincil metin |
| `border` | `#D9D6CB` | Cetvel/hairline |
| `primary` | ink `#1C1B18` | Birincil buton (ink-dolu) |
| `brass` | `#8C6A38` | İkincil aksan (işlem/Al butonu) — az |
| `margin` | `#B23A2E` | Kırmızı marj çizgisi, `[X] kapat` |
| `up` (kâr) | `#1B6E43` | Kâr |
| `down` / `destructive` (zarar) | `#7B2D26` | Zarar, silme |

Sınıflar: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-up`, `text-down`, `bg-brass`, `text-margin`. **Ad-hoc renk yazma.**

---

## 3. Tipografi

| Rol | Font | Nerede |
|-----|------|--------|
| UI / metin | **Plus Jakarta Sans** | Varsayılan (`--font-sans`) |
| Wordmark / makbuz başlığı | **Courier Prime** (daktilo) | `font-serif` |
| Rakam / ticker | **JetBrains Mono** | `.tabular` |

Self-host (`@fontsource`), CDN yok. Tüm sayısal değerlere `.tabular`. Tablolar/etiketler çoğunlukla `font-mono uppercase tracking-wider`.

---

## 4. Yapısal imzalar (kimliğin özü)

CSS yardımcıları [`index.css`](src/index.css)'te:

- **`.margin-rule`** — panelin solunda dikey kırmızı marj çizgisi (içerik `pl-4 md:pl-6` ile açılır).
- **`.shadow-ledger`** — panel offset gölge `4px 4px`. **`.shadow-ledger-strong`** — modal/drawer `8px 8px` full ink.
- **`.border-double-bottom`** — tablo toplam satırı 3px çift çizgi.
- **Keskin köşeler** — `--radius: 2px` (tüm bileşenler).
- **Cetvelli tablo** — mono, tabular, `border-b-2 border-foreground` başlık, `divide-border` satırlar, `tfoot` toplam çift-çizgi.
- **Aktif nav/tab** — ink-dolu blok (`bg-foreground text-background`).

---

## 5. Ortak Modal ([`ui/modal.jsx`](src/components/ui/modal.jsx))

Makbuz-stili tek bileşen; her yerde kullanılır (`window.confirm` yerine de).
- Overlay `foreground/50` + blur; panel `border-2 border-foreground` + `shadow-ledger-strong`.
- `title` → daktilo makbuz başlığı (kesikli ayraç), `subtitle`, `children`, `actions`.
- Animasyon `.ledger-modal` (fade + hafif ölçek), `prefers-reduced-motion`'a saygılı.
- Örnek kullanım: Portföy'de silme onayı.

---

## 6. Etkileşim

- **Hover zorunlu**: satır `hover:bg-secondary` + sembol `group-hover:underline`; butonlar `hover:border-foreground` / `hover:bg-foreground hover:text-background`; tab hover.
- Tıklanabilir hisse satırı → drawer; aksiyon butonları `stopPropagation`.
- Login/Register: client-side validasyon (e-posta/parola) + Kratos hataları Türkçe ([`lib/authErrors.js`](src/lib/authErrors.js)).

---

## 7. Tek tema (bilinçli)

Sadece **açık/bone**. Koyu tema yok (bilinçli). İleride istenirse token'lar `@media`/`[data-theme]` ile yeniden tanımlanır, bileşenlere dokunulmaz.

---

## 8. YAPMA listesi

- ❌ Ad-hoc renk (`gray-950`, `#111` vb.) — sadece token.
- ❌ Rakamı normal fontla — `.tabular`.
- ❌ Vurgu/marj rengini kâr-zarar için kullanmak.
- ❌ Yuvarlak köşe/yumuşak gölge dünyasına kayma — ledger keskin + offset gölge.
- ❌ `window.confirm` — ortak `Modal`.
