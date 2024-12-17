import { db } from '@/lib/firebase';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

interface CustomerCompanyRelation {
  customerId: string;
  companyId: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

/**
 * Creates a relationship between a customer and a company
 * @param customerId The ID of the customer
 * @param companyId The ID of the company
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function createCustomerCompanyRelation(
  customerId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!customerId || !companyId) {
      return { 
        success: false, 
        error: 'Customer ID and Company ID are required' 
      };
    }

    // Check if customer exists and has correct role
    const customerDoc = await getDoc(doc(db, 'users', customerId));
    if (!customerDoc.exists()) {
      return { 
        success: false, 
        error: 'Customer not found' 
      };
    }

    const customerData = customerDoc.data();
    if (customerData.role !== 'customer') {
      return { 
        success: false, 
        error: 'User must have customer role' 
      };
    }

    // Check if company exists
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (!companyDoc.exists()) {
      return { 
        success: false, 
        error: 'Company not found' 
      };
    }

    // Check for existing relationship
    const relationQuery = query(
      collection(db, 'customerCompanyRelations'),
      where('customerId', '==', customerId),
      where('companyId', '==', companyId)
    );

    const existingRelations = await getDocs(relationQuery);
    if (!existingRelations.empty) {
      return { 
        success: false, 
        error: 'Relationship already exists' 
      };
    }

    // Create the relationship
    const relationData: CustomerCompanyRelation = {
      customerId,
      companyId,
      createdAt: new Date(),
      status: 'active'
    };

    const relationRef = doc(collection(db, 'customerCompanyRelations'));
    await setDoc(relationRef, {
      ...relationData,
      createdAt: Timestamp.fromDate(relationData.createdAt)
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating customer-company relation:', error);
    return { 
      success: false, 
      error: 'Failed to create relationship' 
    };
  }
}

/**
 * Removes a relationship between a customer and a company
 * @param customerId The ID of the customer
 * @param companyId The ID of the company
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function removeCustomerCompanyRelation(
  customerId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!customerId || !companyId) {
      return { 
        success: false, 
        error: 'Customer ID and Company ID are required' 
      };
    }

    // Find the existing relationship
    const relationQuery = query(
      collection(db, 'customerCompanyRelations'),
      where('customerId', '==', customerId),
      where('companyId', '==', companyId)
    );

    const relations = await getDocs(relationQuery);
    if (relations.empty) {
      return { 
        success: false, 
        error: 'Relationship not found' 
      };
    }

    // Delete the relationship
    await deleteDoc(relations.docs[0].ref);

    return { success: true };
  } catch (error) {
    console.error('Error removing customer-company relation:', error);
    return { 
      success: false, 
      error: 'Failed to remove relationship' 
    };
  }
}

/**
 * Gets all companies associated with a customer
 * @param customerId The ID of the customer
 * @returns Promise<string[]> Array of company IDs
 */
export async function getCustomerCompanies(
  customerId: string
): Promise<string[]> {
  try {
    const relationQuery = query(
      collection(db, 'customerCompanyRelations'),
      where('customerId', '==', customerId),
      where('status', '==', 'active')
    );

    const relations = await getDocs(relationQuery);
    return relations.docs.map(doc => doc.data().companyId);
  } catch (error) {
    console.error('Error getting customer companies:', error);
    return [];
  }
}

/**
 * Gets all customers associated with a company
 * @param companyId The ID of the company
 * @returns Promise<string[]> Array of customer IDs
 */
export async function getCompanyCustomers(
  companyId: string
): Promise<string[]> {
  try {
    const relationQuery = query(
      collection(db, 'customerCompanyRelations'),
      where('companyId', '==', companyId),
      where('status', '==', 'active')
    );

    const relations = await getDocs(relationQuery);
    return relations.docs.map(doc => doc.data().customerId);
  } catch (error) {
    console.error('Error getting company customers:', error);
    return [];
  }
}