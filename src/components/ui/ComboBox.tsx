import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useController, Control } from 'react-hook-form';
import { useClickAway } from '@/hooks/useClickAway';

interface Option {
  value: string;
  label: string;
}

interface ComboBoxProps {
  options: Option[];
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  control?: Control<any>;
  label?: string;
  error?: string;
  required?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ComboBox({
  options,
  value,
  onChange,
  onSearch,
  label,
  error,
  required,
  isLoading,
  name,
  control,
  placeholder = 'Select an option...',
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [width, setWidth] = React.useState<number>(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const controlled = name && control;
  const { field } = controlled 
    ? useController({ name, control }) 
    : { field: { value, onChange } };

  useClickAway([inputRef, dropdownRef], () => {
    setIsOpen(false);
  });

  const selectedOption = options.find(option => option.value === field.value);

  React.useEffect(() => {
    if (inputRef.current) {
      setWidth(inputRef.current.offsetWidth);
    }
  }, []);

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch?.(newQuery);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={inputRef}>
        <div
          className={cn(
            'relative w-full cursor-pointer rounded-md border bg-white px-3 py-2 text-left shadow-sm sm:text-sm',
            'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
            'dark:bg-gray-800 dark:border-gray-700',
            error ? 'border-red-300' : 'border-gray-300',
          )}
        >
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'w-full border-0 bg-transparent p-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'dark:text-gray-100'
            )}
            placeholder={placeholder}
            value={selectedOption?.label || query}
            onChange={handleSearch}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
          />
          
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : field.value ? (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  field.onChange('');
                  setQuery('');
                  setIsOpen(false);
                }}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    field.onChange('');
                    setQuery('');
                    setIsOpen(false);
                  }
                }}
              >
                <X className="h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700 focus:outline-none"
            style={{ width }}
            tabIndex={-1}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    option.value === field.value && 'bg-gray-100 dark:bg-gray-700'
                  )}
                  onClick={() => {
                    field.onChange(option.value);
                    setQuery(option.label);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.value === field.value && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Check className="h-4 w-4 text-blue-500" />
                    </span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}