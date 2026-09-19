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

| Pole | Wartość |
|---|---|
| Build context | `.` (root repo) |
| Dockerfile | `Dockerfile` |
| Port | `3000` |
| `PORT` | `3000` |
| `DATA_DIR` | `/data` |

### Bind mount (obowiązkowy)

W usłudze → **Mounts** → **Add Bind Mount**:

| Pole | Wartość |
|---|---|
| Type | Bind |
| Host path | np. `/etc/easypanel/projects/trader/data` |
| Mount path | `/data` |

Bez tego `store.json` siedzi w warstwie kontenera i znika przy każdym redeployu. Host path może być dowolny na serwerze — ważne, żeby mount path był dokładnie `/data`.
