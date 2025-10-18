import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'sm';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variantClasses = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    const sizeClasses = {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3',
    }
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

type CardProps = React.HTMLAttributes<HTMLDivElement>;
export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return <div className={`bg-white rounded-2xl shadow-soft p-6 ${className}`} {...props} />;
};
export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => {
  return <div className={`mb-4 ${className}`} {...props} />;
};
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
  return <h3 className={`text-xl font-semibold text-slate-800 ${className}`} {...props} />;
};
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
  return <p className={`text-sm text-slate-500 ${className}`} {...props} />;
};
export const CardContent: React.FC<CardProps> = (props) => {
  return <div {...props} />;
};


export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return <label className={`text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} ref={ref} {...props} />;
  }
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
 ({ className, children, ...props }, ref) => {
    return (
      <select
        className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);


export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
    <div className="relative w-full overflow-auto"><table className={`w-full caption-bottom text-sm ${className}`} {...props} /></div>
);
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
    <thead className={`[&_tr]:border-b ${className}`} {...props} />
);
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
);
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
    <tr className={`border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 ${className}`} {...props} />
);
export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
);
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
);


type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'warning' | 'danger';
};
export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
    const variants = {
        default: 'border-transparent bg-slate-200 text-slate-800',
        success: 'border-transparent bg-green-100 text-green-800',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        danger: 'border-transparent bg-red-100 text-red-800',
    };
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} {...props} />
    );
};

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-lg">
                <div className="p-6">{children}</div>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 ${className}`}
      {...props}
    />
  );
};


// Custom styles for soft shadow
const customStyles = `
  .shadow-soft {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  }
`;
export const GlobalStyles = () => <style>{customStyles}</style>;
