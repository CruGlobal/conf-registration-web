import { lazy, Suspense } from 'react';

const LandingAngularComponent = lazy(() => import('./LandingComponent'));

const HomePage = () => {
  return (
    <>
      <div>Welcome to Next.js!</div>
      <Suspense fallback={<div>Loading...</div>}>
        <LandingAngularComponent />
      </Suspense>
    </>
  );
};

export default HomePage;
