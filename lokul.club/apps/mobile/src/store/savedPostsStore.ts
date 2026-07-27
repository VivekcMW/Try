// Local-only saved/bookmarked posts (no backend model for bookmarks yet)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface State {
  savedIds: string[];
  isSaved: (postId: string) => boolean;
  toggleSaved: (postId: string) => void;
}

export const useSavedPostsStore = create<State>()(
  persist(
    (set, get) => ({
      savedIds: [],
      isSaved: (postId) => get().savedIds.includes(postId),
      toggleSaved: (postId) =>
        set((s) => ({
          savedIds: s.savedIds.includes(postId)
            ? s.savedIds.filter((id) => id !== postId)
            : [postId, ...s.savedIds],
        })),
    }),
    { name: 'lokul.savedPosts', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
