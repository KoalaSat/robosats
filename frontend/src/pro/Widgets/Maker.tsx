import React, { useContext } from 'react';
import { AppContext, type UseAppStoreType } from '../../contexts/AppContext';

import MakerForm from '../../components/MakerForm';
import { Paper } from '@mui/material';
import { FederationContext, UseFederationStoreType } from '../../contexts/FederationContext';
import { GarageContext, UseGarageStoreType } from '../../contexts/GarageContext';

interface MakerWidgetProps {
  style?: React.StyleHTMLAttributes<HTMLElement>;
  className?: string;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}

const MakerWidget = React.forwardRef(function Component(
  { style, className, onMouseDown, onMouseUp, onTouchEnd }: MakerWidgetProps,
  ref,
) {
  const { fav } = useContext<UseAppStoreType>(AppContext);
  const { federation } = useContext<UseFederationStoreType>(FederationContext);
  const { maker } = useContext<UseGarageStoreType>(GarageContext);
  return React.useMemo(() => {
    return (
      <Paper elevation={3} style={{ padding: 8, overflow: 'auto', width: '100%', height: '100%' }}>
        <MakerForm />
      </Paper>
    );
  }, [maker, limits, fav]);
});

export default MakerWidget;
