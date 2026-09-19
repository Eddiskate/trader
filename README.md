# FX Desk

Kursy NBP, saldo walut vs PLN, wpływy z wypłaty i zysk z wymian.

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja: http://localhost:3000

Saldo zapisuje się w `data/store.json`.

## Easypanel

Jeden serwis **App** (Dockerfile w katalogu głównym). UI i API są w jednym kontenerze.

| Zmienna | Przykład |
|--------|----------|
| `PORT` | port z panelu (np. `3000`) |
| `DATA_DIR` | `/data` |

Dodaj wolumen na `/data`, żeby wymiany nie zniknęły po redeployu. Host = nazwa serwisu (nie `localhost`).
