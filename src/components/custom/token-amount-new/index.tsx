import React from 'react';
import BigNumber from 'bignumber.js';
import cn from 'classnames';

import { DropdownList } from 'components/custom/dropdown';
import Icon, { TokenIconNames } from 'components/custom/icon';
import { Slider } from 'components/custom/slider';
import { Text } from 'components/custom/typography';
import { KnownTokens, getTokenBySymbol } from 'components/providers/known-tokens-provider';

import s from './s.module.scss';

type TokenAmountType = {
  value: string;
  onChange: (value: string) => void;
  before: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
  classNameBefore?: string;
  placeholder?: string;
  disabled?: boolean;
  max?: BigNumber;
  slider?: boolean;
  decimals?: number;
  name?: string;
};

export const TokenAmount: React.FC<TokenAmountType> = ({
  onChange,
  before,
  secondary,
  className,
  classNameBefore,
  slider,
  decimals = 6,
  name,
  max,
  ...rest
}) => {
  const handlerKeyPress = (event: React.KeyboardEvent) => {
    let validChars = '1234567890';
    if (!rest.value.includes('.')) validChars += '.';

    if (!validChars.includes(event.key)) event.preventDefault();
  };

  return (
    <div className={className}>
      <div className={s.tokenAmount}>
        {before && (
          <div className={cn(s.tokenAmountBefore, classNameBefore)}>
            {before}
            <span className={s.tokenName}>{name}</span>
          </div>
        )}
        <div className={s.tokenAmountValues}>
          <input
            className={s.tokenAmountValue}
            type="text"
            pattern="[0-9]+([\.,][0-9]+)?"
            inputMode="numeric"
            step={1 / 10 ** Math.min(decimals, 6)}
            lang="en"
            onChange={ev => {
              onChange(ev.target.value);
            }}
            onWheel={ev => {
              ev.currentTarget.blur();
            }}
            onKeyPress={handlerKeyPress}
            {...rest}
          />
          <div className={s.tokenAmountHint}>{secondary}</div>
        </div>
        {max?.isFinite() && (
          <button
            type="button"
            className={cn('button-ghost', s.maxBtn)}
            style={{ alignSelf: 'center' }}
            disabled={rest.disabled || max?.isEqualTo(BigNumber.ZERO)}
            onClick={() =>
              onChange(
                (max?.toFormat as any)({
                  groupSeparator: '',
                  decimalSeparator: '.',
                }),
              )
            }>
            <span>Max</span>
          </button>
        )}
      </div>
      {slider && max?.isFinite() ? (
        <Slider
          type="range"
          className={s.tokenAmountSlider}
          min="0"
          max={max?.toNumber()}
          step={1 / 10 ** Math.min(decimals ?? 6, 6)}
          value={Number(rest.value) || 0}
          disabled={rest.disabled || max?.isEqualTo(BigNumber.ZERO)}
          onChange={e => {
            onChange(e.target.value);
          }}
        />
      ) : null}
    </div>
  );
};

type TokenAmountPreviewType = {
  value: React.ReactNode;
  before: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
};

export const TokenAmountPreview: React.FC<TokenAmountPreviewType> = ({ value, before, secondary, className }) => {
  return (
    <div className={cn(s.tokenAmountPreview, className)}>
      {before && <div className={s.tokenAmountPreviewBefore}>{before}</div>}
      <div className={s.tokenAmountPreviewValues}>
        <div className={s.tokenAmountPreviewValue}>{value}</div>
        <div className={s.tokenAmountPreviewHint}>{secondary}</div>
      </div>
    </div>
  );
};

type TokenSelectType = {
  value: KnownTokens;
  onChange: (value: KnownTokens) => void;
  tokens: KnownTokens[];
};

export const TokenSelect: React.FC<TokenSelectType> = ({ value, onChange, tokens }) => {
  const foundToken = getTokenBySymbol(value);

  return (
    <DropdownList
      items={tokens.reduce((acc: React.ButtonHTMLAttributes<HTMLButtonElement>[], token) => {
        const found = getTokenBySymbol(token);
        if (!found) return acc;
        return [
          ...acc,
          {
            onClick: () => {
              onChange(token as KnownTokens);
            },
            children: (
              <>
                <Icon name={getTokenBySymbol(token)?.icon as TokenIconNames} className="mr-8" />
                {getTokenBySymbol(token)?.name}
              </>
            ),
            'aria-selected': foundToken?.symbol === found.symbol ? 'true' : 'false',
          },
        ];
      }, [])}>
      {({ ref, setOpen, open }) => (
        <button
          type="button"
          ref={ref}
          onClick={() => setOpen(isOpen => !isOpen)}
          className="token-amount-select-token">
          {foundToken ? (
            <Icon name={foundToken.icon as TokenIconNames} width={24} height={24} className="mr-16" />
          ) : null}
          <Text type="p1" weight="semibold" color="primary">
            {foundToken?.symbol}
          </Text>
          <Icon
            name="dropdown"
            width="24"
            height="24"
            className="token-select-chevron"
            style={{
              marginLeft: 4,
              transform: open ? 'rotate(180deg)' : '',
            }}
          />
        </button>
      )}
    </DropdownList>
  );
};
