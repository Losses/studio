import * as React from 'react';

import { useAsync } from '@react-hookz/web';

import { Input } from 'baseui/input';
import { Block } from 'baseui/block';
import { Button, KIND as BUTTON_KIND } from 'baseui/button';
import { StatefulTooltip, TRIGGER_TYPE } from 'baseui/tooltip';

import { AddIconOutline } from 'components/Icons/AddIconOutline';
import { Select } from 'components/Select/Select';
import type { GetOptionLabel, GetValueLabel } from 'components/Select/Select';

import { server } from 'utils/rpc';

import { ISimpleRelease } from '@recative/definitions';

interface ICommitFormProps {
  disabled?: boolean;
  label: string;
  selectBundles?: boolean;
  onSubmit: (x: ICommitFormInputs) => void;
}

export interface ICommitFormInputs {
  codeBuildId?: number;
  mediaBuildId?: number;
  message: string;
}

const getValueLabel: GetValueLabel<ISimpleRelease> = ({ option }) => {
  return (
    <Block display="flex">
      <Block color="contentTertiary" marginRight="8px">
        #{option?.id}
      </Block>
      <Block>{option?.notes}</Block>
    </Block>
  );
};

const getOptionLabel: GetOptionLabel<ISimpleRelease> = ({ option }) => {
  return (
    <Block>
      <Block color="contentTertiary">#{option?.id}</Block>
      <Block>{option?.notes}</Block>
    </Block>
  );
};

const useSearchRelease = (type: 'media' | 'code') => {
  const [state, actions] = useAsync(async (query: string) => {
    return server.searchRelease(query, type);
  });

  const handleInputChange = React.useCallback(
    (event?: React.FormEvent<HTMLInputElement>) => {
      actions.execute(event?.currentTarget.value || '');
    },
    []
  );

  const queryResult = state.result || [];
  const loading = state.status === 'loading';

  return [queryResult, loading, handleInputChange] as const;
};

const useSelectValue = <T,>() => {
  const [selectedItem, setSelectedItem] = React.useState<readonly T[] | null>(
    null
  );

  const handleValueChange = React.useCallback(
    ({ value }: { value: readonly T[] }) => {
      setSelectedItem(value);
    },
    []
  );

  return [selectedItem, handleValueChange] as const;
};

const useInputProps = () => {
  const [value, setValue] = React.useState('');

  const handleValueChange = (event: React.FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  return [value, handleValueChange] as const;
};

export const CommitForm: React.FC<ICommitFormProps> = ({
  disabled,
  label,
  selectBundles,
  onSubmit,
}) => {
  const [message, handleMessageChange] = useInputProps();
  const [mediaOptions, mediaLoading, handleMediaSearchInputChange] =
    useSearchRelease('media');
  const [codeOptions, codeLoading, handleCodeSearchInputChange] =
    useSearchRelease('code');

  const [selectedMedia, setSelectedMedia] = useSelectValue<ISimpleRelease>();
  const [selectedCode, setSelectedCode] = useSelectValue<ISimpleRelease>();

  const handleSubmit = React.useCallback(
    () =>
      onSubmit({
        codeBuildId: selectedCode?.[0]?.id,
        mediaBuildId: selectedMedia?.[0]?.id,
        message,
      }),
    [onSubmit, message, selectedMedia, selectedCode]
  );

  React.useEffect(() => {
    if (selectBundles) {
      handleMediaSearchInputChange();
      handleCodeSearchInputChange();
    }
  }, [selectBundles]);

  return (
    <StatefulTooltip
      overrides={{
        Arrow: {
          style: ({ $theme }) => ({
            outline: `${$theme.colors.borderOpaque} solid`,
            backgroundColor: $theme.colors.backgroundPrimary,
          }),
        },
        Body: {
          style: ({ $theme }) => ({
            outline: `${$theme.colors.borderOpaque} solid`,
          }),
        },
        Inner: {
          style: ({ $theme }) => ({
            backgroundColor: $theme.colors.backgroundPrimary,
          }),
        },
      }}
      content={() => (
        <Block paddingTop="12px" paddingBottom="12px">
          {selectBundles && (
            <>
              <Block marginTop="8px" marginBottom="8px">
                <Select<ISimpleRelease>
                  disabled={disabled}
                  options={mediaOptions}
                  value={selectedMedia}
                  placeholder="Media Bundle"
                  isLoading={mediaLoading}
                  getOptionLabel={getOptionLabel}
                  getValueLabel={getValueLabel}
                  onChange={setSelectedMedia}
                  onInputChange={handleMediaSearchInputChange}
                />
              </Block>
              <Block marginTop="8px" marginBottom="8px">
                <Select<ISimpleRelease>
                  disabled={disabled}
                  options={codeOptions}
                  value={selectedCode}
                  placeholder="Code Bundle"
                  isLoading={codeLoading}
                  getOptionLabel={getOptionLabel}
                  getValueLabel={getValueLabel}
                  onChange={setSelectedCode}
                  onInputChange={handleCodeSearchInputChange}
                />
              </Block>
            </>
          )}
          <Input
            disabled={disabled}
            placeholder="Commit Message"
            overrides={{ Input: { style: { width: '256px' } } }}
            onChange={handleMessageChange}
          />
          <Block paddingTop="12px" display="flex" justifyContent="flex-end">
            <Button disabled={disabled} onClick={handleSubmit}>
              Commit
            </Button>
          </Block>
        </Block>
      )}
      triggerType={TRIGGER_TYPE.click}
      showArrow
      autoFocus
    >
      <Button
        disabled={disabled}
        kind={BUTTON_KIND.tertiary}
        startEnhancer={<AddIconOutline width={20} />}
      >
        {label}
      </Button>
    </StatefulTooltip>
  );
};