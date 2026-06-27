import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserDataRepository } from '../services/UserDataRepository';
import { MongoUserDataRepository } from '../services/MongoUserDataRepository';
import { FirebaseUserDataRepository } from '../services/FirebaseUserDataRepository';

export const useUserDataRepository = (): UserDataRepository => {
  const { user } = useAuth();

  const repository = useMemo(() => {
    // Select the repository provider based on active authentication provider
    if (user && user.provider === 'mongo-email') {
      return new MongoUserDataRepository();
    } else {
      return new FirebaseUserDataRepository();
    }
  }, [user?.provider, user?.id]);

  return repository;
};
export default useUserDataRepository;
