import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  DialogContent,
  Box,
  Button,
  Tooltip,
  Grid,
  TextField,
  useTheme,
  Typography,
  FormHelperText,
} from '@mui/material';

import Countdown from 'react-countdown';

import currencies from '../../../static/assets/currencies.json';
import { apiClient } from '../../services/api';

import { type Order, type Info } from '../../models';
import { ConfirmationDialog } from '../Dialogs';
import { LoadingButton } from '@mui/lab';
import { computeSats } from '../../utils';
import { GarageContext, UseGarageStoreType } from '../../contexts/GarageContext';

interface TakeButtonProps {
  baseUrl: string;
  info?: Info;
  onClickGenerateRobot?: () => void;
}

interface OpenDialogsProps {
  inactiveMaker: boolean;
  confirmation: boolean;
}
const closeAll = { inactiveMaker: false, confirmation: false };

const TakeButton = ({
  baseUrl,
  info,
  onClickGenerateRobot = () => null,
}: TakeButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { garage, orderUpdatedAt } = useContext<UseGarageStoreType>(GarageContext);

  const [takeAmount, setTakeAmount] = useState<string>('');
  const [badRequest, setBadRequest] = useState<string>('');
  const [loadingTake, setLoadingTake] = useState<boolean>(false);
  const [open, setOpen] = useState<OpenDialogsProps>(closeAll);
  const [satoshis, setSatoshis] = useState<string>('');

  const satoshisNow = (): string | undefined => {
    const order = garage.getOrder();

    if (order === null) return;

    const tradeFee = info?.taker_fee ?? 0;
    const defaultRoutingBudget = 0.001;
    const btcNow = order.satoshis_now / 100000000;
    const rate = order.amount != null ? order.amount / btcNow : order.max_amount / btcNow;
    const amount = order.currency === 1000 ? Number(takeAmount) / 100000000 : Number(takeAmount);
    const satoshis = computeSats({
      amount,
      routingBudget: order.is_buyer ? defaultRoutingBudget : 0,
      fee: tradeFee,
      rate,
    });
    return satoshis;
  };

  useEffect(() => {
    setSatoshis(satoshisNow() ?? '');
  }, [orderUpdatedAt, takeAmount, info]);

  const currencyCode: string =
    garage.getOrder()?.currency === 1000 ? 'Sats' : currencies[`${garage.getOrder()?.currency}`];

  const InactiveMakerDialog = function (): JSX.Element {
    return (
      <Dialog
        open={open.inactiveMaker}
        onClose={() => {
          setOpen({ ...open, inactiveMaker: false });
        }}
      >
        <DialogTitle>{t('The maker is away')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'By taking this order you risk wasting your time. If the maker does not proceed in time, you will be compensated in satoshis for 50% of the maker bond.',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(closeAll);
            }}
            autoFocus
          >
            {t('Go back')}
          </Button>
          <Button
            onClick={() => {
              setOpen({ inactiveMaker: false, confirmation: true });
            }}
          >
            {t('Sounds fine')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  interface countdownTakeOrderRendererProps {
    seconds: number;
    completed: boolean;
  }

  const countdownTakeOrderRenderer = function ({
    seconds,
    completed,
  }: countdownTakeOrderRendererProps): JSX.Element {
    if (isNaN(seconds) || completed) {
      return takeOrderButton();
    } else {
      return (
        <Tooltip enterTouchDelay={0} title={t('Wait until you can take an order')}>
          <Grid container sx={{ width: '100%' }} padding={1} justifyContent='center'>
            <LoadingButton loading={loadingTake} disabled={true} variant='outlined' color='primary'>
              {t('Take Order')}
            </LoadingButton>
          </Grid>
        </Tooltip>
      );
    }
  };

  const handleTakeAmountChange = function (e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target.value !== '' && e.target.value != null) {
      setTakeAmount(`${parseFloat(e.target.value)}`);
    } else {
      setTakeAmount(e.target.value);
    }
  };

  const amountHelperText = useMemo(() => {
    const order = garage.getOrder();

    if (order === null) return;

    const amount = order.currency === 1000 ? Number(takeAmount) / 100000000 : Number(takeAmount);
    if (amount < Number(order.min_amount) && takeAmount !== '') {
      return t('Too low');
    } else if (amount > Number(order.max_amount) && takeAmount !== '') {
      return t('Too high');
    } else {
      return null;
    }
  }, [orderUpdatedAt, takeAmount]);

  const onTakeOrderClicked = function (): void {
    if (garage.getOrder()?.maker_status === 'Inactive') {
      setOpen({ inactiveMaker: true, confirmation: false });
    } else {
      setOpen({ inactiveMaker: false, confirmation: true });
    }
  };

  const invalidTakeAmount = useMemo(() => {
    const order = garage.getOrder();
    const amount = order?.currency === 1000 ? Number(takeAmount) / 100000000 : Number(takeAmount);
    return (
      amount < Number(order?.min_amount) ||
      amount > Number(order?.max_amount) ||
      takeAmount === '' ||
      takeAmount == null
    );
  }, [takeAmount, orderUpdatedAt]);

  const takeOrderButton = function (): JSX.Element {
    if (garage.getOrder()?.has_range) {
      return (
        <Box
          sx={{
            padding: '0.5em',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderRadius: '4px',
            borderColor: theme.palette.mode === 'dark' ? '#434343' : '#c4c4c4',
            '&:hover': {
              borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#2f2f2f',
            },
          }}
        >
          <Grid container direction='column' alignItems='center'>
            <Grid
              item
              container
              direction='row'
              alignItems='flex-start'
              justifyContent='space-evenly'
            >
              <Grid item sx={{ width: '12em' }}>
                <Tooltip
                  placement='top'
                  enterTouchDelay={500}
                  enterDelay={700}
                  enterNextDelay={2000}
                  title={t('Enter amount of fiat to exchange for bitcoin')}
                >
                  <TextField
                    error={takeAmount === '' ? false : invalidTakeAmount}
                    helperText={amountHelperText}
                    label={t('Amount {{currencyCode}}', { currencyCode })}
                    size='small'
                    type='number'
                    required={true}
                    value={takeAmount}
                    inputProps={{
                      min: garage.getOrder()?.min_amount,
                      max: garage.getOrder()?.max_amount,
                      style: { textAlign: 'center' },
                    }}
                    onChange={handleTakeAmountChange}
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <div
                  style={{
                    display: invalidTakeAmount ? '' : 'none',
                  }}
                >
                  <Tooltip
                    placement='top'
                    enterTouchDelay={0}
                    enterDelay={500}
                    enterNextDelay={1200}
                    title={t('You must specify an amount first')}
                  >
                    <div>
                      <LoadingButton
                        loading={loadingTake}
                        sx={{ height: '2.8em' }}
                        variant='outlined'
                        color='primary'
                        disabled={true}
                      >
                        {t('Take Order')}
                      </LoadingButton>
                    </div>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: invalidTakeAmount ? 'none' : '',
                  }}
                >
                  <LoadingButton
                    loading={loadingTake}
                    sx={{ height: '2.8em' }}
                    variant='outlined'
                    color='primary'
                    onClick={onTakeOrderClicked}
                  >
                    {t('Take Order')}
                  </LoadingButton>
                </div>
              </Grid>
            </Grid>
            {satoshis !== '0' && satoshis !== '' && !invalidTakeAmount ? (
              <Grid item>
                <FormHelperText sx={{ position: 'relative', top: '0.15em' }}>
                  {garage.getOrder()?.type === 1
                    ? t('You will receive {{satoshis}} Sats (Approx)', { satoshis })
                    : t('You will send {{satoshis}} Sats (Approx)', { satoshis })}
                </FormHelperText>
              </Grid>
            ) : null}
          </Grid>
        </Box>
      );
    } else {
      return (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            bottom: '0.25em',
          }}
        >
          <LoadingButton
            loading={loadingTake}
            sx={{ height: '2.71em' }}
            variant='outlined'
            color='primary'
            onClick={onTakeOrderClicked}
          >
            {t('Take Order')}
          </LoadingButton>
        </Box>
      );
    }
  };

  const takeOrder = function (): void {
    setLoadingTake(true);
    apiClient
      .post(
        baseUrl,
        `/api/order/?order_id=${String(garage.getOrder()?.id)}`,
        {
          action: 'take',
          amount: garage.getOrder()?.currency === 1000 ? takeAmount / 100000000 : takeAmount,
        },
        { tokenSHA256: garage.getRobot().tokenSHA256 },
      )
      .then((data) => {
        setLoadingTake(false);
        if (data?.bad_request !== undefined) {
          setBadRequest(data.bad_request);
        } else {
          garage.updateOrder(data as Order);
          setBadRequest('');
        }
      })
      .catch(() => {
        setBadRequest('Request error');
      });
  };

  return (
    <Box>
      <Countdown
        date={new Date(garage.getOrder()?.penalty ?? '')}
        renderer={countdownTakeOrderRenderer}
      />
      {badRequest !== '' ? (
        <Box style={{ padding: '0.5em' }}>
          <Typography align='center' color='secondary'>
            {t(badRequest)}
          </Typography>
        </Box>
      ) : (
        <></>
      )}

      <ConfirmationDialog
        open={open.confirmation}
        onClose={() => {
          setOpen({ ...open, confirmation: false });
        }}
        onClickDone={() => {
          takeOrder();
          setLoadingTake(true);
          setOpen(closeAll);
        }}
        hasRobot={garage.getRobot().avatarLoaded}
        onClickGenerateRobot={onClickGenerateRobot}
      />
      <InactiveMakerDialog />
    </Box>
  );
};

export default TakeButton;
