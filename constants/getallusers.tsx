// import { collection, getDocs, query, where } from 'firebase/firestore';

// /**
//  * Fetch all users from Firestore except the currently logged-in one
//  */
// export const getAllUsersExceptCurrent = async () => {
//   const currentUser = auth.currentUser;

//   if (!currentUser) {
//     console.log("No user logged in.");
//     return [];
//   }

//   const usersRef = collection(db, 'users');
//   const q = query(usersRef, where('userID', '!=', currentUser.uid));

//   try {
//     const snapshot = await getDocs(q);
//     const users = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     return users;
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return [];
//   }
// };
