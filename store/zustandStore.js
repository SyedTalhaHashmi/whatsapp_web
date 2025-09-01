import { create } from "zustand";

const useGlobalStore = create((set) => ({
  user: {},
  customer: {},
  provider: {},
  globalData: {},
  Cust: {},
  Supp: {},
  AccountId: {},

  setselectedAccountId: (AccountId) => set({ AccountId }),
  setSupp: (Supp) => set({ Supp }),
  setCust: (Cust) => set({ Cust }),
  setUser: (user) => set({ user }),
  setCustomer: (customer) => set({ customer }),
  setProvider: (provider) => set({ provider }),
  setGlobalData: (globalData) => set({ globalData }),
}));

export default useGlobalStore;
