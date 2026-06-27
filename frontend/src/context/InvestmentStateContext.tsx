import React, { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useUserDataRepository } from '../hooks/useUserDataRepository';

export type PositionStatus = "none" | "interested" | "purchased";

export interface Holding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  purchaseDate: string;
  notes?: string;
}

export interface UserAlert {
  id: string;
  symbol?: string; // empty means general market alert
  type: string;
  targetValue?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUserRecord {
  symbol: string;
  positionStatus: PositionStatus;
  watchlisted: boolean;
  holding?: Holding;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentState {
  version: number;
  companyRecords: Record<string, CompanyUserRecord>;
  alerts: Record<string, UserAlert>;
}

const DEFAULT_STATE: InvestmentState = {
  version: 2,
  companyRecords: {},
  alerts: {}
};

type Action =
  | { type: 'HYDRATE'; payload: Omit<InvestmentState, 'version'> }
  | { type: 'UPDATE_RECORD'; payload: { symbol: string; changes: Partial<CompanyUserRecord> } }
  | { type: 'SET_ALERT'; payload: UserAlert }
  | { type: 'UPDATE_ALERT'; payload: { alertId: string; changes: Partial<UserAlert> } }
  | { type: 'DELETE_ALERT'; payload: string }
  | { type: 'DELETE_COMPANY_ALERTS'; payload: string }
  | { type: 'RESET' };

function stateReducer(state: InvestmentState, action: Action): InvestmentState {
  let newState = { ...state };

  switch (action.type) {
    case 'HYDRATE':
      return {
        version: DEFAULT_STATE.version,
        companyRecords: action.payload.companyRecords || {},
        alerts: action.payload.alerts || {}
      };

    case 'UPDATE_RECORD': {
      const { symbol, changes } = action.payload;
      const cleanSymbol = symbol.toUpperCase().trim();
      const existing = state.companyRecords[cleanSymbol] || {
        symbol: cleanSymbol,
        positionStatus: 'none',
        watchlisted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedRecord: CompanyUserRecord = {
        ...existing,
        ...changes,
        updatedAt: new Date().toISOString()
      };

      newState.companyRecords = { ...state.companyRecords };

      // Clean up records with no active state
      const hasAlerts = Object.values(state.alerts).some(a => a.symbol === cleanSymbol);
      const isMeaningless =
        updatedRecord.positionStatus === 'none' &&
        !updatedRecord.watchlisted &&
        !hasAlerts &&
        !updatedRecord.notes;

      if (isMeaningless) {
        delete newState.companyRecords[cleanSymbol];
      } else {
        newState.companyRecords[cleanSymbol] = updatedRecord;
      }

      break;
    }

    case 'SET_ALERT': {
      const alert = action.payload;
      newState.alerts = {
        ...state.alerts,
        [alert.id]: alert
      };
      
      // Ensure company record is initialized if it's a company alert
      if (alert.symbol) {
        const cleanSymbol = alert.symbol.toUpperCase().trim();
        if (!state.companyRecords[cleanSymbol]) {
          newState.companyRecords = {
            ...state.companyRecords,
            [cleanSymbol]: {
              symbol: cleanSymbol,
              positionStatus: 'none',
              watchlisted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
        }
      }
      break;
    }

    case 'UPDATE_ALERT': {
      const { alertId, changes } = action.payload;
      if (state.alerts[alertId]) {
        newState.alerts = {
          ...state.alerts,
          [alertId]: {
            ...state.alerts[alertId],
            ...changes,
            updatedAt: new Date().toISOString()
          }
        };
      }
      break;
    }

    case 'DELETE_ALERT': {
      const alertId = action.payload;
      newState.alerts = { ...state.alerts };
      delete newState.alerts[alertId];

      // Garbage collect records that are now meaningless
      newState.companyRecords = { ...state.companyRecords };
      Object.keys(newState.companyRecords).forEach(sym => {
        const record = newState.companyRecords[sym];
        const symAlerts = Object.values(newState.alerts).some(a => a.symbol === sym);
        if (record.positionStatus === 'none' && !record.watchlisted && !symAlerts && !record.notes) {
          delete newState.companyRecords[sym];
        }
      });

      break;
    }

    case 'DELETE_COMPANY_ALERTS': {
      const symbol = action.payload.toUpperCase().trim();
      newState.alerts = {};
      Object.keys(state.alerts).forEach(id => {
        if (state.alerts[id].symbol !== symbol) {
          newState.alerts[id] = state.alerts[id];
        }
      });

      // Garbage collect company record if meaningless
      newState.companyRecords = { ...state.companyRecords };
      const record = newState.companyRecords[symbol];
      if (record && record.positionStatus === 'none' && !record.watchlisted && !record.notes) {
        delete newState.companyRecords[symbol];
      }
      break;
    }

    case 'RESET':
      return { ...DEFAULT_STATE };

    default:
      return state;
  }

  // LocalStorage persistence removed to avoid plain caching when unauthenticated.
  return newState;
}

interface InvestmentContextProps {
  state: InvestmentState;
  hydrated: boolean;
  getCompanyRecord: (symbol: string) => CompanyUserRecord;
  setInterested: (symbol: string) => Promise<void>;
  clearInterest: (symbol: string) => Promise<void>;
  markPurchased: (symbol: string, holding: Holding) => Promise<void>;
  updateHolding: (symbol: string, holding: Holding) => Promise<void>;
  removePurchased: (symbol: string, nextStatus: "none" | "interested") => Promise<void>;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  setCompanyNotes: (symbol: string, notes: string) => Promise<void>;
  createAlert: (alert: Omit<UserAlert, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlert: (alertId: string, changes: Partial<UserAlert>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  deleteCompanyAlerts: (symbol: string) => Promise<void>;
  resetAllData: () => void;
  getPortfolioHoldings: () => Holding[];
  getWatchlistSymbols: () => string[];
  getInterestedSymbols: () => string[];
  getPurchasedSymbols: () => string[];
  getCompanyAlerts: (symbol: string) => UserAlert[];
  getAlertBuckets: () => {
    watchlistAlerts: UserAlert[];
    interestedAlerts: UserAlert[];
    portfolioAlerts: UserAlert[];
    marketAlerts: UserAlert[];
  };
}

const InvestmentStateContext = createContext<InvestmentContextProps | undefined>(undefined);

export const InvestmentStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();
  const repository = useUserDataRepository();

  // Load User Data State upon login context syncs
  useEffect(() => {
    if (user?.isAuthenticated) {
      const loadState = async () => {
        try {
          const dbState = await repository.getInvestmentState();
          dispatch({ type: 'HYDRATE', payload: dbState });
        } catch (err) {
          console.error("Failed to load user state from repository:", err);
        } finally {
          setHydrated(true);
        }
      };
      loadState();
    } else {
      dispatch({ type: 'RESET' });
      setHydrated(true);
    }
  }, [user?.isAuthenticated, repository]);

  const getCompanyRecord = (symbol: string): CompanyUserRecord => {
    const clean = symbol.toUpperCase().trim();
    return state.companyRecords[clean] || {
      symbol: clean,
      positionStatus: 'none',
      watchlisted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const setInterested = async (symbol: string) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { positionStatus: 'interested', holding: undefined } }
    });
    await repository.setInterested(symbol);
  };

  const clearInterest = async (symbol: string) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { positionStatus: 'none' } }
    });
    await repository.clearInterest(symbol);
  };

  const markPurchased = async (symbol: string, holding: Holding) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { positionStatus: 'purchased', holding } }
    });
    await repository.markPurchased(symbol, holding);
  };

  const updateHolding = async (symbol: string, holding: Holding) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { holding } }
    });
    await repository.updatePurchasedHolding(symbol, holding);
  };

  const removePurchased = async (symbol: string, nextStatus: "none" | "interested") => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { positionStatus: nextStatus, holding: undefined } }
    });
    await repository.removePurchased(symbol);
  };

  const addToWatchlist = async (symbol: string) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { watchlisted: true } }
    });
    await repository.addToWatchlist(symbol);
  };

  const removeFromWatchlist = async (symbol: string) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { watchlisted: false } }
    });
    await repository.removeFromWatchlist(symbol);
  };

  const setCompanyNotes = async (symbol: string, notes: string) => {
    dispatch({
      type: 'UPDATE_RECORD',
      payload: { symbol, changes: { notes } }
    });
    await repository.saveNote(symbol, notes);
  };

  const createAlert = async (alert: Omit<UserAlert, 'createdAt' | 'updatedAt'>) => {
    const newAlert = await repository.createAlert(alert);
    dispatch({ type: 'SET_ALERT', payload: newAlert });
  };

  const updateAlert = async (alertId: string, changes: Partial<UserAlert>) => {
    const updated = await repository.updateAlert(alertId, changes);
    dispatch({ type: 'UPDATE_ALERT', payload: { alertId, changes: updated } });
  };

  const deleteAlert = async (alertId: string) => {
    dispatch({ type: 'DELETE_ALERT', payload: alertId });
    await repository.deleteAlert(alertId);
  };

  const deleteCompanyAlerts = async (symbol: string) => {
    const clean = symbol.toUpperCase().trim();
    dispatch({ type: 'DELETE_COMPANY_ALERTS', payload: clean });
    
    // Delete individual alerts belonging to this company from db
    const targetAlerts = Object.values(state.alerts).filter(a => a.symbol === clean);
    for (const alert of targetAlerts) {
      await repository.deleteAlert(alert.id);
    }
  };

  const resetAllData = () => {
    dispatch({ type: 'RESET' });
  };

  // Selector functions (reads sync from hydrated local state cache)
  const getPortfolioHoldings = (): Holding[] => {
    return Object.values(state.companyRecords)
      .filter(r => r.positionStatus === 'purchased' && r.holding)
      .map(r => r.holding!);
  };

  const getWatchlistSymbols = (): string[] => {
    return Object.values(state.companyRecords)
      .filter(r => r.watchlisted)
      .map(r => r.symbol);
  };

  const getInterestedSymbols = (): string[] => {
    return Object.values(state.companyRecords)
      .filter(r => r.positionStatus === 'interested')
      .map(r => r.symbol);
  };

  const getPurchasedSymbols = (): string[] => {
    return Object.values(state.companyRecords)
      .filter(r => r.positionStatus === 'purchased')
      .map(r => r.symbol);
  };

  const getCompanyAlerts = (symbol: string): UserAlert[] => {
    const clean = symbol.toUpperCase().trim();
    return Object.values(state.alerts).filter(a => a.symbol === clean);
  };

  const getAlertBuckets = () => {
    const allAlerts = Object.values(state.alerts);
    const watchlistSymbols = getWatchlistSymbols();
    const interestedSymbols = getInterestedSymbols();
    const purchasedSymbols = getPurchasedSymbols();

    return {
      watchlistAlerts: allAlerts.filter(a => a.symbol && watchlistSymbols.includes(a.symbol)),
      interestedAlerts: allAlerts.filter(a => a.symbol && interestedSymbols.includes(a.symbol)),
      portfolioAlerts: allAlerts.filter(a => a.symbol && purchasedSymbols.includes(a.symbol)),
      marketAlerts: allAlerts.filter(a => !a.symbol)
    };
  };

  const value = useMemo(() => ({
    state,
    hydrated,
    getCompanyRecord,
    setInterested,
    clearInterest,
    markPurchased,
    updateHolding,
    removePurchased,
    addToWatchlist,
    removeFromWatchlist,
    setCompanyNotes,
    createAlert,
    updateAlert,
    deleteAlert,
    deleteCompanyAlerts,
    resetAllData,
    getPortfolioHoldings,
    getWatchlistSymbols,
    getInterestedSymbols,
    getPurchasedSymbols,
    getCompanyAlerts,
    getAlertBuckets
  }), [state, hydrated]);

  return (
    <InvestmentStateContext.Provider value={value}>
      {children}
    </InvestmentStateContext.Provider>
  );
};

export const useInvestmentState = () => {
  const context = useContext(InvestmentStateContext);
  if (context === undefined) {
    throw new Error('useInvestmentState must be used within an InvestmentStateProvider');
  }
  return context;
};
