/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
/* eslint-disable no-await-in-loop */
import { Image, createCanvas } from '@napi-rs/canvas';
import { ResourceProcessor } from '@recative/extension-sdk';

import { IResourceItem } from '@recative/definitions';
import type {
  PostProcessedResourceItemForUpload,
  IPostProcessedResourceFileForUpload,
  IPostProcessedResourceFileForImport,
} from '@recative/extension-sdk';

export interface OfflineBundleConfig {
  enable: string;
}

export class TextureAnalysisProcessor extends ResourceProcessor<
  keyof OfflineBundleConfig
> {
  static id = '@recative/extension-rs-atlas/TextureAnalysisProcessor';

  static label = 'Texture analysis';

  static resourceConfigUiFields = [] as const;

  static nonMergeableResourceExtensionConfiguration = [
    `${TextureAnalysisProcessor.id}~~tw`,
    `${TextureAnalysisProcessor.id}~~th`,
    `${TextureAnalysisProcessor.id}~~ex`,
    `${TextureAnalysisProcessor.id}~~ey`,
    `${TextureAnalysisProcessor.id}~~ew`,
    `${TextureAnalysisProcessor.id}~~eh`,
  ];

  async beforePublishMediaBundle(
    resources: IPostProcessedResourceFileForUpload[]
  ) {
    return resources;
  }

  afterGroupCreated() {
    return null;
  }

  beforePublishApplicationBundle(
    resources: (PostProcessedResourceItemForUpload | IResourceItem)[]
  ) {
    return resources;
  }

  private getImageData = (x: Image) => {
    const canvas = createCanvas(x.width, x.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(x, 0, 0);
    return ctx.getImageData(0, 0, x.width, x.height);
  };

  private calculateImageEnvelope = (
    resource:
      | IPostProcessedResourceFileForImport
      | IPostProcessedResourceFileForUpload,
    image: Image
  ) => {
    const { width, height } = image;

    const imageData = this.getImageData(image);
    const { data } = imageData;
    const paddings = { top: 0, left: 0, right: width - 1, bottom: height - 1 };

    leftSide: for (let i = 0; i < width; i += 1) {
      for (let j = 0; j < height; j += 1) {
        const alpha = data[(j * width + i) * 4 + 3];
        if (alpha > 0) {
          paddings.left = i;
          break leftSide;
        }
      }
    }

    rightSide: for (let i = width - 1; i >= 0; i -= 1) {
      for (let j = height - 1; j >= 0; j -= 1) {
        const alpha = data[(j * width + i) * 4 + 3];
        if (alpha > 0) {
          paddings.right = i;
          break rightSide;
        }
      }
    }

    topSide: for (let j = 0; j < height; j += 1) {
      for (let i = 0; i < width; i += 1) {
        const alpha = data[(j * width + i) * 4 + 3];
        if (alpha > 0) {
          paddings.top = j;
          break topSide;
        }
      }
    }

    bottomSide: for (let j = height - 1; j >= 0; j -= 1) {
      for (let i = width - 1; i >= 0; i -= 1) {
        const alpha = data[(j * width + i) * 4 + 3];
        if (alpha > 0) {
          paddings.bottom = j;
          break bottomSide;
        }
      }
    }

    const numberArray: Array<number> = [];

    for (let j = paddings.top; j <= paddings.bottom; j += 1) {
      for (let i = paddings.left; i <= paddings.right; i += 1) {
        const index = j * width + i;
        numberArray.push(data[index * 4]);
        numberArray.push(data[index * 4 + 1]);
        numberArray.push(data[index * 4 + 2]);
        numberArray.push(data[index * 4 + 3]);
      }
    }

    const result = {
      x: paddings.left,
      y: paddings.top,
      w: paddings.right - paddings.left,
      h: paddings.bottom - paddings.top,
    };

    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~tw`] =
      width.toString();
    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~th`] =
      height.toString();
    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~ex`] =
      result.x.toString();
    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~ey`] =
      result.y.toString();
    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~ew`] =
      result.w.toString();
    resource.extensionConfigurations[`${TextureAnalysisProcessor.id}~~eh`] =
      result.h.toString();

    return result;
  };

  beforeFileImported(resources: IPostProcessedResourceFileForImport[]) {
    for (let i = 0; i < resources.length; i += 1) {
      const resource = resources[i];

      const isImage = resource.mimeType.startsWith('image');

      if (!isImage) {
        continue;
      }

      if (!(resource.postProcessedFile instanceof Buffer)) {
        throw new TypeError(
          `Expected Buffer, got ${typeof resource.postProcessedFile}`
        );
      }

      const image = new Image();
      image.src = resource.postProcessedFile;

      this.calculateImageEnvelope(resource, image);
    }
    return resources;
  }

  beforePreviewResourceBinaryDelivered() {
    return null;
  }

  beforePreviewResourceMetadataDelivered() {
    return null;
  }
}