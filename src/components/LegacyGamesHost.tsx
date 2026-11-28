import React from 'react';
import { LEGACY_VIEWS_HTML } from './legacyViewsHtml';

interface LegacyGamesHostProps {
  visible: boolean;
}

export const LegacyGamesHost = React.memo(
  function LegacyGamesHost({ visible }: LegacyGamesHostProps) {
    return (
      <div
        id="legacy-views-host"
        className={visible ? 'block' : 'hidden'}
        dangerouslySetInnerHTML={{ __html: LEGACY_VIEWS_HTML }}
      />
    );
  },
  (prev, next) => prev.visible === next.visible
);
