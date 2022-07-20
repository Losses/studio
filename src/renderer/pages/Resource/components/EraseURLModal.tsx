import * as React from 'react';

import { useSet } from 'react-use';
import { useAsync } from '@react-hookz/web';

import { Block } from 'baseui/block';
import { LabelXSmall } from 'baseui/typography';
import { ListItem, ListItemLabel } from 'baseui/list';
import { Button, KIND as BUTTON_KIND } from 'baseui/button';
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalButton,
  ROLE,
  SIZE,
} from 'baseui/modal';

import { server } from 'utils/rpc';

export interface IEraseURLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const useExtensionList = (isOpen: boolean) => {
  const [erasedUploaders, erasedUploadersOp] = useSet<string>();
  const [selectedUploaderId, setSelectedUploaderId] = React.useState('');
  const [extensionList, extensionListAction] = useAsync(
    server.getExtensionMetadata
  );

  React.useEffect(() => {
    if (isOpen) {
      extensionListAction.execute();
    } else {
      extensionListAction.reset();
    }
  }, [isOpen, extensionListAction]);

  const clearURLs = React.useMemo(() => {
    const result: Record<string, () => void> = {};

    extensionList.result?.uploader.forEach(({ id }) => {
      result[id] = async () => {
        if (id === selectedUploaderId) {
          await server.eraseResourceUrl(id);
          setSelectedUploaderId('');
          erasedUploadersOp.add(id);
        } else {
          setSelectedUploaderId(id);
        }
      };
    });

    return result;
  }, [erasedUploadersOp, extensionList.result?.uploader, selectedUploaderId]);

  return {
    extensionList: extensionList.result,
    clearURLs,
    erasedUploaders,
    selectedUploaderId,
  };
};

export const EraseURLModal: React.FC<IEraseURLModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { erasedUploaders, selectedUploaderId, extensionList, clearURLs } =
    useExtensionList(isOpen);

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      animate
      autoFocus
      closeable={false}
      size={SIZE.default}
      role={ROLE.dialog}
    >
      <ModalHeader>Erase Resource URL</ModalHeader>
      <ModalBody>
        <Block marginBottom="20px">
          This will erase resource URL of specific episode. It does not delete
          files that are already deployed online, only the data entries in the
          local database. This operation is irrevocable.
        </Block>
        {extensionList?.uploader.map((uploader) => (
          <ListItem
            key={uploader.id}
            endEnhancer={
              <Button
                kind={BUTTON_KIND.tertiary}
                onClick={clearURLs[uploader.id]}
                disabled={erasedUploaders.has(uploader.id)}
                overrides={
                  selectedUploaderId === uploader.id
                    ? {
                        BaseButton: {
                          style: ({ $theme }) => ({
                            backgroundColor: $theme.colors.negative,
                            color: 'white',

                            ':hover': {
                              backgroundColor: $theme.colors.negative300,
                            },
                          }),
                        },
                      }
                    : undefined
                }
              >
                {erasedUploaders.has(uploader.id) && 'Erased'}
                {!erasedUploaders.has(uploader.id) &&
                  (selectedUploaderId === uploader.id ? 'Sure?' : 'Erase')}
              </Button>
            }
          >
            <ListItemLabel
              description={<LabelXSmall>{uploader.id}</LabelXSmall>}
            >
              {uploader.label}
            </ListItemLabel>
          </ListItem>
        ))}
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={onClose} kind={BUTTON_KIND.tertiary}>
          Close
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};