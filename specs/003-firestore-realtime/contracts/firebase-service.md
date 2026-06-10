# Contract: Firestore Service (`src/services/firebase.js`)

**Version**: 1.0.0 | **Feature**: `003-firestore-realtime`

## Module Contract

| Export | Type | Description |
|--------|------|-------------|
| `db` | `Firestore` | Instancia singleton de Cloud Firestore |

## Initialization

MUST use `initializeApp(firebaseConfig)` with:

| Config key | Env var |
|------------|---------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

`databaseURL` MAY estar presente en env pero NO se usa para Firestore.

## SDK Surface

```js
import { getFirestore } from 'firebase/firestore'
export const db = getFirestore(app)
```

## Prohibitions

- MUST NOT export RTDB (`getDatabase`, `ref`, `onValue`).
- MUST NOT hardcode credentials.
- MUST NOT initialize Firebase fuera de este módulo.

## Consumers

| Consumer | Usage |
|----------|-------|
| `Dashboard.jsx` | `collection(db, 'sensors')`, `collection(db, 'readings')` |
