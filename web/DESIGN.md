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
| `up` (kâr) | `#147C4A` | Kâr |
| `down` (zarar) | `#BE3A2E` | Zarar |
| `destructive` | `#7B2D26` | Silme (K/Z değil) |

Sınıflar: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-up`, `text-down`, `bg-brass`, `text-margin`. **Ad-hoc renk yazma.**

### 2.1 Kategori renkleri

Varlık türünü **ayırt etmek** için. Rozet, halka dilimi, KPI şeridi.

| Token | Hex | Kategori |
|-------|-----|----------|
| `cat-stock` | `#2F5DA8` | Hisse |
| `cat-gold` | `#C69B58` | Altın |
| `cat-fx` | `#17706B` | Döviz |
| `cat-cash` | `#6B4E9B` | Nakit |
| `cat-index` | `#C25E3A` | Endeks |
| `cat-other` | `#8C897E` | Diğer |

> **Kural:** kategori rengi asla artı/eksi anlamı taşımaz; `up`/`down` asla kategori göstermez. İkisi karışırsa "yeşil kutu" hem altın hem kâr demeye başlar.

### 2.2 Şasi (koyu kabuk)

Sidebar ve auth ekranları koyu; sayfa içeriği bone kalır ve şasinin üstünde ayrı bir tuval olarak durur.

| Token | Hex | Kullanım |
|-------|-----|----------|
| `shell` | `#0B0D10` | Sidebar/auth zemini |
| `shell-panel` | `#15151A` | Hover yüzeyi, auth kartı |
| `shell-border` | `#212127` | Şasi kenarı |
| `shell-fg` | `#F2F2F3` | Şasi metni |
| `shell-muted` | `#878791` | Şasi ikincil metni |
| `foil` | `#D4B483` | Şampanya aksan — **yalnızca şasi içinde** |

---

## 3. Tipografi

| Rol | Font | Nerede |
|-----|------|--------|
| Başlık | **Bricolage Grotesque** | `font-display` |
| UI / gövde | **Instrument Sans** | Varsayılan (`--font-sans`) |
| Rakam / etiket | **Geist Mono** | `.tabular`, `font-mono` |

Self-host (`@fontsource`), CDN yok. Tüm sayısal değerlere `.tabular`. Tablolar/etiketler çoğunlukla `font-mono uppercase tracking-wider`.

---

## 4. Yapısal imzalar (kimliğin özü)

CSS yardımcıları [`index.css`](src/index.css)'te:

- **`.margin-rule`** — panelin solunda dikey kırmızı marj çizgisi (içerik `pl-4 md:pl-6` ile açılır).
- **`.shadow-ledger`** — panel offset gölge `4px 4px`. **`.shadow-ledger-strong`** — modal/drawer `8px 8px` full ink.
- **`.border-double-bottom`** — tablo toplam satırı 3px çift çizgi.
- **Keskin köşeler** — `--radius: 2px` (bone tuval içindeki bileşenler).
- **Cetvelli tablo** — mono, tabular, `border-b-2 border-foreground` başlık, `divide-border` satırlar, `tfoot` toplam çift-çizgi.

Şasi imzaları (yalnızca sidebar/auth; bunlar yumuşak köşelidir):

- **`.foil-tile`** — gradyanlı şampanya kare: marka rozeti + birincil buton.
- **`.nav-active`** — aktif nav satırı: yumuşak dolgu + solda ışıyan 2.5px foil şerit, ikon foil'e döner.
- **`.canvas-inset`** — bone içerik tuvalinin şasi üstündeki gölgesi.
- **`.auth-bg`** / **`.auth-card`** — ızgara + foil ışıma zemin, üstünde yüzen auth kartı.

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

## 7. İki katman, tek tema

Kullanıcıya seçtirilen bir tema **yok**. Bunun yerine iki sabit katman var:

- **Şasi** (koyu): sidebar, login, register. `shell-*` + `foil` token'ları, yumuşak köşe.
- **Tuval** (bone): tüm sayfa içeriği. LEDGER token'ları, keskin köşe.

İçerik her zaman bone kalır — şasi onu taşıyan çerçevedir.

---

## 8. YAPMA listesi

- ❌ Ad-hoc renk (`gray-950`, `#111` vb.) — sadece token.
- ❌ Rakamı normal fontla — `.tabular`.
- ❌ Vurgu/marj rengini kâr-zarar için kullanmak.
- ❌ Kategori rengini kâr/zarar, `up`/`down`'ı kategori için kullanmak.
- ❌ `foil`'i bone tuval içinde kullanmak — foil yalnızca şasiye ait.
- ❌ Bone tuval içinde yuvarlak köşe/yumuşak gölge — orası keskin + offset gölge. Yuvarlaklık şasiye ait.
- ❌ `window.confirm` — ortak `Modal`.
