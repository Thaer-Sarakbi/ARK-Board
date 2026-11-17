"use client";

import { create } from "zustand";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface Profile {
  placeName?: string;
  role?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  init: () => void;
  logout: () => Promise<void>;
}

let started = false;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  init: () => {
    if (started) return;
    started = true;
    onAuthStateChanged(auth(), async (user) => {
      if (!user) return set({ user: null, profile: null, loading: false });
      set({ user, loading: true });
      let profile: Profile = {};
      try {
        const snap = await getDoc(doc(db(), "users", user.uid));
        if (snap.exists()) profile = snap.data() as Profile;
      } catch (e) {
        console.error("Failed to load user profile", e);
      }
      set({ user, profile, loading: false });
    });
  },
  logout: async () => {
    await signOut(auth());
  },
}));
