'use client';
import Link from 'next/link';
import { NavigationItem } from '@/types/navigation';

type NavigationProps = {
  items: NavigationItem[];
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  className?: string;
  itemClassName?: string;
};

const Navigation = ({
  items,
  activeMenu,
  onMenuClick,
  className = '',
  itemClassName = '',
}: NavigationProps) => (
  <nav className={className}>
    {items.map(item => (
      <Link
        key={item.id}
        href={item.path}
        className={`btn ${itemClassName} ${activeMenu === item.id ? 'btn-active' : ''}`}
        onClick={() => onMenuClick(item.id)}
      >
        {item.label}
      </Link>
    ))}
  </nav>
);

export default Navigation;
