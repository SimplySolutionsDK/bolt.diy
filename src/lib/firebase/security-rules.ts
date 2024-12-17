rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isStaff() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isCardCustomer(cardData) {
      return isAuthenticated() && request.auth.uid == cardData.customerId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isStaff() || isOwner(userId);
      allow delete: if isStaff();
    }
    
    // Cards collection
    match /cards/{cardId} {
      allow read: if isStaff() || isCardCustomer(resource.data);
      allow create: if isStaff();
      allow update: if isStaff();
      allow delete: if isStaff();
    }
    
    // Time entries collection
    match /timeEntries/{entryId} {
      allow read: if isStaff() || 
        isCardCustomer(get(/databases/$(database)/documents/cards/$(resource.data.cardId)).data);
      allow create: if isStaff();
      allow update: if isStaff();
      allow delete: if isStaff();
    }
    
    // Notification preferences collection
    match /notificationPreferences/{prefId} {
      allow read: if isOwner(resource.data.userId);
      allow write: if isOwner(resource.data.userId);
    }
    
    // Features collection
    match /features/{featureId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        (isStaff() || request.auth.uid == resource.data.createdBy ||
         request.auth.uid == resource.data.customerId);
      allow delete: if isStaff();
    }
    
    match /messages/{messageId} {
      allow read: if isAuthenticated() &&
        (isStaff() || request.auth.uid == get(/databases/$(database)/documents/features/$(resource.data.featureId)).data.customerId);
      allow create: if isAuthenticated() &&
        (isStaff() || request.auth.uid == get(/databases/$(database)/documents/features/$(request.resource.data.featureId)).data.customerId);
      allow update: if isAuthenticated() && request.auth.uid == resource.data.createdBy;
      allow delete: if isStaff();
    }
  }
}