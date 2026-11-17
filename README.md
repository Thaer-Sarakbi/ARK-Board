# ARK Board

Live room status (empty / occupied / online) for ARK DE GLORY hotels.
Next.js (App Router) · TypeScript · Tailwind · Zustand · Firebase Auth + Firestore.

## Run
```
npm install
npm run dev        # http://localhost:3000
```
Firebase config is read from `.env.local` (`NEXT_PUBLIC_FIREBASE_*`). On Vercel, add the same variables in Project → Settings → Environment Variables.

## Firestore
- `/users/{uid}`: `placeName` (default hotel, must match a name in `src/lib/constants.ts`), `role`, `fullName`
- `/rooms/{hotelName}/{double|triple|quad}/{roomNumber}`:
  `hotelName, category, roomNumber, status, guest, idNumber, phoneNumber, nights, paid, checkIn, checkOut`
  (`checkIn` / `checkOut` are Firestore Timestamps). Setting a room to empty clears the guest fields.

Signed-in users need read/write access to `rooms/**` and read access to their own `users/{uid}`.

## Pages
- `/login`: email + password sign-in
- `/board`: live board, room panel, status change and guest forms
- `/add-room`: create a room (starts as empty)
