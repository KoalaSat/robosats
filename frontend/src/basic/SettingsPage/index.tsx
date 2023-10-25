import React, { useContext } from 'react';
import { Grid, Paper } from '@mui/material';
import SettingsForm from '../../components/SettingsForm';
import { AppContext, type UseAppStoreType } from '../../contexts/AppContext';
import FederationTable from '../../components/FederationTable';
import { FederationContext, UseFederationStoreType } from '../../contexts/FederationContext';

const SettingsPage = (): JSX.Element => {
  const { windowSize, navbarHeight, settings, setOpen, open, hostUrl } =
    useContext<UseAppStoreType>(AppContext);
  const maxHeight = (windowSize.height - navbarHeight) * 0.85 - 3;

  return (
    <Paper
      elevation={12}
      sx={{
        padding: '0.6em',
        width: '20.5em',
        maxHeight: `${maxHeight}em`,
        overflow: 'auto',
        overflowX: 'clip',
      }}
    >
      <Grid container>
        <Grid item>
          <SettingsForm showNetwork={!(window.NativeRobosats === undefined)} />
        </Grid>
        <Grid item>
          <FederationTable
            openCoordinator={() => {
              setOpen({ ...open, coordinator: true });
            }}
            baseUrl={hostUrl}
            maxHeight={14}
            network={settings.network}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SettingsPage;
