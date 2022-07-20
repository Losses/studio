import * as React from 'react';

import { Block } from 'baseui/block';
import { LabelMedium, ParagraphXSmall } from 'baseui/typography';
import { Button, KIND as BUTTON_KIND } from 'baseui/button';
import type { ButtonOverrides } from 'baseui/button';

import { formatReleaseNumber } from 'utils/formatReleaseNumber';
import { YYYYMMDD } from 'utils/formatDate';

import { IBundleRelease } from '@recative/definitions';

export interface IReleaseBundleButtonProps extends IBundleRelease {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const buttonOverrides: ButtonOverrides = {
  Root: {
    style: {
      flexDirection: 'column',
    },
  },
  BaseButton: {
    style: {
      width: '100%',
      height: '120px',
      flexDirection: 'column',
    },
  },
};

export const ReleaseBundleButton: React.FC<IReleaseBundleButtonProps> = (
  props
) => {
  const { commitTime, onClick } = props;

  return (
    <Button
      overrides={buttonOverrides}
      kind={BUTTON_KIND.secondary}
      onClick={onClick}
    >
      <Block paddingTop="12px">
        <LabelMedium>{formatReleaseNumber(props)}</LabelMedium>
      </Block>
      <ParagraphXSmall>{YYYYMMDD(commitTime)}</ParagraphXSmall>
    </Button>
  );
};