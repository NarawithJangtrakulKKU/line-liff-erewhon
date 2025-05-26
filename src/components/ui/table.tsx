export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <table className="min-w-full bg-white">{children}</table>;
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead>{children}</thead>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tr className="whitespace-nowrap">{children}</tr>;
};

export const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <td className="px-6 py-4 text-sm text-gray-900">{children}</td>;
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
}; 