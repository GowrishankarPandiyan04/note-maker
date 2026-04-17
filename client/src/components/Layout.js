import { Outlet } from 'react-router-dom';
import PersistentDrawerLeft from './PersistentDrawerLeft';

export default function Layout() {
  return (
    <PersistentDrawerLeft>
      <Outlet />
    </PersistentDrawerLeft>
  );
}
