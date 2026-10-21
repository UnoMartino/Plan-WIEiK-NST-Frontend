# Plan Zajęć WIEiK PK (Studia Niestacjonarne)

Nowoczesny, szybki i responsywny interfejs webowy do przeglądania planu zajęć dla studentów studiów niestacjonarnych (zaocznych) **Wydziału Inżynierii Elektrycznej i Komputerowej Politechniki Krakowskiej**.

Projekt został zaprojektowany w oparciu o wytyczne **Apple Human Interface Guidelines (HIG)** – oferuje minimalistyczny, czytelny design, automatyczne wsparcie dla ciemnego i jasnego motywu, pełną responsywność oraz wsparcie dla urządzeń mobilnych (w tym bezpieczne strefy iOS i Dynamic Island).

---

## ✨ Kluczowe funkcjonalności

- 📅 **Trzy widoki kalendarza:**
  - **Dzień** – szczegółowa oś czasu dnia z informacjami o okienkach i kolizjach.
  - **Tydzień (Pt–Nd)** – dedykowany widok zjazdu weekendowego (piątek, sobota, niedziela).
  - **Miesiąc** – pełny kalendarz miesięczny z oznaczeniem zjazdów, liczby zajęć i skrótami nawigacyjnymi.
- 🎯 **Zaawansowane filtrowanie:**
  - Filtrowanie po kierunku i semestrze (np. *Informatyka w Inżynierii Komputerowej – Semestr 3*).
  - Wybór grup laboratoryjnych, projektowych i audytoryjnych.
  - Filtrowanie sal oraz wykładowców/prowadzących.
  - Zapisywanie preferencji filtrów w pamięci lokalnej (`localStorage`).
- 🎨 **Kolorystyka przedmiotów w stylu Apple:**
  - Automatyczne, spójne pastelowe barwy przypisywane per przedmiot za pomocą algorytmu haszującego FNV-1a.
  - Oznaczenie typu zajęć (Wykład, Ćwiczenia, Laboratorium, Projekt, Seminarium).
  - Wykrywanie i wizualne ostrzeganie o kolizjach czasowych.
  - Oznaczenia długości okienek między zajęciami (np. `Okienko: 30m`).
- 📲 **Dedykowany dla urządzeń mobilnych:**
  - Płynne wylewanie koloru nagłówka na obszar paska statusu i Dynamic Island na iPhone (`safe-area-inset-top`).
  - Responsywne przyciski nawigacyjne (kompaktowa pastylka na telefonach, osobne pastylki na desktopie).
  - Przystosowane modale i widoki dotykowe.
- 📆 **Eksport do Kalendarza (.ics):**
  - Możliwość pobrania przefiltrowanego planu w formacie `.ics` (kompatybilnego z Apple Calendar, Google Calendar, Microsoft Outlook).
- 🌓 **Obsługa motywów:**
  - Tryb automatyczny (dostosowany do systemu operacyjnego z dedykowaną ikoną), tryb ciemny oraz tryb jasny.
- 🔄 **Aktualizacja danych:**
  - Możliwość odświeżenia danych wprost z poziomu aplikacji lub za pomocą skryptu CLI pobierającego surowe dane z [DokuWiki WIEiK PK](https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan).

---

## 🛠️ Stos technologiczny

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Ikony:** [Lucide React](https://lucide.dev/)
- **Stylowanie:** Vanilla CSS z systemem tokenów projektowych (CSS Variables, Apple HIG)
- **Konteneryzacja:** [Docker](https://www.docker.com/) & [Nginx](https://nginx.org/) (Multi-stage build, kompresja Gzip, SPA fallback)

---

## 🚀 Uruchomienie lokalne (Development)

### Wymagania wstępne
- [Node.js](https://nodejs.org/) (wersja 20 LTS lub nowsza)
- `npm`

### Krok po kroku:
1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/UnoMartino/Plan-WIEiK-NST-Frontend.git
   cd Plan-WIEiK-NST-Frontend
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem: `http://localhost:5173/`

4. Budowanie wersji produkcyjnej:
   ```bash
   npm run build
   ```

---

## 🐳 Uruchomienie w Dockerze

Aplikacja posiada gotową konfigurację multi-stage Dockerfile oraz `docker-compose.yml`, serwując zoptymalizowane statyki przez lekki serwer Nginx.

### Uruchomienie za pomocą Docker Compose:
```bash
docker compose up -d --build
```
Aplikacja zostanie wystawiona domyślnie na porcie `8080`:
```
http://localhost:8080/
```

### Budowanie i uruchomienie samego kontenera Docker:
```bash
docker build -t plan-wieik-pk .
docker run -d -p 8080:80 --name plan-wieik plan-wieik-pk
```

> **Wskazówka:** Port oraz konfigurację reverse proxy (np. Traefik, Caddy, Nginx Proxy Manager) można dostosować wedle własnych potrzeb.

---

## 🔄 Pobieranie aktualnych danych planu

Do pobierania najświeższego planu bezpośrednio ze strony uczelni służy skrypt:
```bash
node scripts/fetch-plan.js public/schedule_data.json
```
Skrypt wyciąga zawartość znacznika `<pre>` z oficjalnego DokuWiki PK, dekoduje encje HTML i zapisuje zwalidowany JSON do wskazanego pliku.

---

## 📂 Struktura projektu

```text
├── Dockerfile                  # Wieloetapowy build Dockera (Node -> Nginx)
├── docker-compose.yml          # Konfiguracja uruchomienia kontenera
├── nginx.conf                  # Konfiguracja Nginx (SPA routing, cache, gzip)
├── scripts/
│   └── fetch-plan.js           # Skrypt Node.js do parsowania planu z PK DokuWiki
├── public/
│   ├── schedule_data.json      # Baza danych planu zajęć
│   └── favicon.svg             # Ikona aplikacji
├── src/
│   ├── components/             # Komponenty interfejsu użytkownika
│   │   ├── DayView.tsx         # Widok pojedynczego dnia (oś czasu)
│   │   ├── FilterModal.tsx     # Okno modalne zaawansowanych filtrów
│   │   ├── Header.tsx          # Główny nagłówek (akcje, motyw, widoki)
│   │   ├── MonthView.tsx       # Widok miesiąca
│   │   ├── NavigationToolbar.tsx # Pasek nawigacyjny (Wstecz/Dalej, Tydzień X)
│   │   ├── SessionDetailModal.tsx # Szczegóły pojedynczych zajęć
│   │   ├── SyncInfoModal.tsx   # Modal informacyjny o synchronizacji
│   │   └── WeekView.tsx        # Widok zjazdu weekendowego (Pt-Nd)
│   ├── types/
│   │   └── schedule.ts         # Typy TypeScript modeli zajęć i filtrów
│   ├── utils/
│   │   ├── dateUtils.ts        # Narzędzia formatowania dat i harmonogramu zjazdów
│   │   ├── icsExport.ts        # Generator plików iCalendar (.ics)
│   │   └── scheduleStorage.ts  # Zarządzanie localStorage
│   ├── App.tsx                 # Główny komponent aplikacji i stan globalny
│   ├── index.css               # Design system, style Apple HIG i zmienne CSS
│   └── main.tsx                # Punkt wejścia React
└── vite.config.ts              # Konfiguracja bundlera Vite
```

---

## 📄 Licencja

Projekt powstał na potrzeby ułatwienia dostępu do planu zajęć studentom WIEiK Politechniki Krakowskiej.
Może być swobodnie rozwijany i dostosowywany.
