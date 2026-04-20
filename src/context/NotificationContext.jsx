import { createContext, useContext, useMemo } from "react";

const NotificationContext = createContext(null);

// This context receives pre-loaded data as props and derives counts
export const useNotificationCounts = (chores, maintenance, expenses, userId) => {
  return useMemo(
    () => ({
      chores: chores.filter(
        (c) =>
          c.assignedTo === userId &&
          c.status === "pending" &&
          new Date(c.dueDate) < new Date()
      ).length,
      maintenance: maintenance.filter((m) => m.status === "PENDING").length,
      expenses: 0,
    }),
    [chores, maintenance, userId]
  );
};

export const NotificationProvider = ({ children, value }) => {
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
