import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Paper,
  Switch,
  useTheme,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  Slider,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Settings } from '../../models';
import SelectLanguage from './SelectLanguage';
import {
  Translate,
  Palette,
  LightMode,
  DarkMode,
  SettingsOverscan,
  Link,
} from '@mui/icons-material';

interface SettingsFormProps {
  dense?: boolean;
  settings: Settings;
  setSettings: (state: Settings) => void;
  showNetwork?: boolean;
}

const SettingsForm = ({
  dense = false,
  settings,
  setSettings,
  showNetwork = false,
}: SettingsFormProps): JSX.Element => {
  const theme = useTheme();
  const { t } = useTranslation();
  const fontSizes = [
    { label: 'XS', value: { basic: 12, pro: 10 } },
    { label: 'S', value: { basic: 13, pro: 11 } },
    { label: 'M', value: { basic: 14, pro: 12 } },
    { label: 'L', value: { basic: 15, pro: 13 } },
    { label: 'XL', value: { basic: 16, pro: 14 } },
  ];

  return (
    <Grid container spacing={1}>
      <Grid item>
        <List dense={dense}>
          <ListItem>
            <ListItemIcon>
              <Translate />
            </ListItemIcon>
            <SelectLanguage
              language={settings.language}
              setLanguage={(language) => setSettings({ ...settings, language })}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <Palette />
            </ListItemIcon>
            <FormControlLabel
              labelPlacement='end'
              label={settings.mode === 'dark' ? t('Dark') : t('Light')}
              control={
                <Switch
                  checked={settings.mode === 'dark'}
                  checkedIcon={
                    <Paper
                      elevation={3}
                      sx={{
                        width: '1.2em',
                        height: '1.2em',
                        borderRadius: '0.4em',
                        backgroundColor: 'white',
                        position: 'relative',
                        top: `${7 - 0.5 * theme.typography.fontSize}px`,
                      }}
                    >
                      <DarkMode sx={{ width: '0.8em', height: '0.8em', color: '#666' }} />
                    </Paper>
                  }
                  icon={
                    <Paper
                      elevation={3}
                      sx={{
                        width: '1.2em',
                        height: '1.2em',
                        borderRadius: '0.4em',
                        backgroundColor: 'white',
                        padding: '0.07em',
                        position: 'relative',
                        top: `${7 - 0.5 * theme.typography.fontSize}px`,
                      }}
                    >
                      <LightMode sx={{ width: '0.67em', height: '0.67em', color: '#666' }} />
                    </Paper>
                  }
                  onChange={(e) =>
                    setSettings({ ...settings, mode: e.target.checked ? 'dark' : 'light' })
                  }
                />
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SettingsOverscan />
            </ListItemIcon>
            <Slider
              value={settings.fontSize}
              min={settings.frontend == 'basic' ? 12 : 10}
              max={settings.frontend == 'basic' ? 16 : 14}
              step={1}
              onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
              valueLabelDisplay='off'
              marks={fontSizes.map(({ label, value }) => ({
                label: <Typography variant='caption'>{t(label)}</Typography>,
                value: settings.frontend === 'basic' ? value.basic : value.pro,
              }))}
              track={false}
            />
          </ListItem>
          {showNetwork ? (
            <ListItem>
              <ListItemIcon>
                <Link />
              </ListItemIcon>
              <ToggleButtonGroup
                exclusive={true}
                value={settings.network}
                onChange={(e, value) => setSettings({ ...settings, network: value })}
              >
                <ToggleButton value='mainnet' color='primary'>
                  {t('Mainnet')}
                </ToggleButton>
                <ToggleButton value='testnet' color='secondary'>
                  {t('Testnet')}
                </ToggleButton>
              </ToggleButtonGroup>
            </ListItem>
          ) : (
            <></>
          )}
        </List>
      </Grid>
    </Grid>
  );
};

export default SettingsForm;