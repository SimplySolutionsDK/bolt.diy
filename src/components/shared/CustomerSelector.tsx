import React from 'react';
import { Control } from 'react-hook-form';
import ComboBox from '@/components/ui/ComboBox';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuthStore } from '@/stores/authStore';
import { getCompanyCustomers } from '@/lib/db/customerCompanyRelations';

interface CustomerSelectorProps {
  name: string;
  control: Control<any>;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function CustomerSelector({
  name,
  control,
  label = "Customer",
  error,
  required = false,
  placeholder = "Search customers..."
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredCustomerIds, setFilteredCustomerIds] = React.useState<string[]>([]);
  const { customers, loading: loadingCustomers } = useCustomers(searchQuery);
  const { user } = useAuthStore();

  React.useEffect(() => {
    async function fetchCompanyCustomers() {
      if (user?.companyId) {
        const customerIds = await getCompanyCustomers(user.companyId);
        setFilteredCustomerIds(customerIds);
      }
    }
    fetchCompanyCustomers();
  }, [user]);

  const filteredCustomers = React.useMemo(() => 
    customers.filter(customer => 
      customer.role === 'customer' && 
      filteredCustomerIds.includes(customer.id)
    ),
    [customers, filteredCustomerIds]
  );

  return (
    <ComboBox
      label={label}
      required={required}
      error={error}
      name={name}
      control={control}
      options={filteredCustomers.map(customer => ({
        value: customer.id,
        label: `${customer.name} (${customer.email})`
      }))}
      onSearch={setSearchQuery}
      placeholder={placeholder}
      isLoading={loadingCustomers || !filteredCustomerIds.length}
    />
  );
}