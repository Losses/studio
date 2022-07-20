import { pick, cloneDeep } from 'lodash';

import type { IConfigUiField } from '@recative/extension-sdk';

import { extensions } from '../../extensions';

interface IExtensionDescription {
  id: string;
  label: string;
  pluginConfigUiFields?: IConfigUiField[];
  resourceConfigUiFields?: IConfigUiField[];
}

const extensionMetadata = {
  uploader: [] as IExtensionDescription[],
  resourceProcessor: [] as IExtensionDescription[],
} as const;

extensions.forEach((extension) => {
  if ('uploader' in extension && extension.uploader) {
    const uploaders = extension.uploader.map((item) => {
      const clonedConfig = cloneDeep(
        pick(item, ['id', 'label', 'configUiFields'])
      );

      const result = {
        id: clonedConfig.id,
        label: clonedConfig.label,
        pluginConfigUiFields: [
          {
            id: 'acceptedFileType',
            type: 'groupedBoolean',
            label: 'Accepted File',
            ids: item.acceptedFileCategory.map((x) => `##${x}`),
            labels: item.acceptedFileCategory.map((x) => x.split(':')[1]),
          } as const,
          ...clonedConfig.configUiFields,
        ],
      };

      return result;
    });

    extensionMetadata.uploader.push(...(uploaders as any));
  }

  if ('resourceProcessor' in extension && extension.resourceProcessor) {
    const extensionList = extension.resourceProcessor.map((item) => {
      const description = cloneDeep(
        pick(item, [
          'id',
          'label',
          'pluginConfigUiFields',
          'resourceConfigUiFields',
        ])
      );

      return description;
    });
    extensionMetadata.resourceProcessor.push(
      ...(extensionList as IExtensionDescription[])
    );
  }
});

export const getExtensionMetadata = () => {
  return extensionMetadata;
};