// Required Firestore Indexes

/*
collection: cards
fields:
  - customerId: ASC
  - status: ASC
  - createdAt: DESC

collection: cards
fields:
  - status: ASC
  - remainingHoursPercentage: ASC

collection: cards
fields:
  - status: ASC
  - expiryDate: ASC

collection: timeEntries
fields:
  - cardId: ASC
  - serviceDate: DESC,
  - __name__: DESC

collection: timeEntries
fields:
  - customerId: ASC
  - serviceDate: DESC,
  - __name__: DESC
*/

export const requiredIndexes = [
  {
    collectionGroup: 'cards',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'customerId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
      { fieldPath: 'remainingHoursPercentage', order: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'timeEntries',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'customerId', order: 'ASCENDING' },
      { fieldPath: 'serviceDate', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'DESCENDING' }
    ]
  }
];