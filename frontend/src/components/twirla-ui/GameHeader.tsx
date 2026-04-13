import React from 'react';
import './GameHeader.css';

interface GameHeaderProps {
  title: string;
  subtitle?: string | null;
  children?: React.ReactNode;
}

export default function GameHeader({ title, subtitle, children }: GameHeaderProps) {
  return (
    <header className="tw-game-header">
      <h2 className="tw-game-header__title">{title}</h2>
      {subtitle ? <p className="tw-game-header__subtitle">{subtitle}</p> : null}
      {children ? <div className="tw-game-header__slot">{children}</div> : null}
    </header>
  );
}
