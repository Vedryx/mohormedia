import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

/**
 * Holds the "is the booking form open?" state at page level, so any call to
 * action — nav, hero, footer — can open the form directly rather than only
 * scrolling the visitor to a second button.
 */
export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => setOpen(true), []);
  const closeBooking = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openBooking, closeBooking }),
    [open, openBooking, closeBooking],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used inside <BookingProvider>');
  return context;
}
