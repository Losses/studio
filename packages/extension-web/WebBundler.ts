import {
  AcceptedBuildType,
  Bundler,
  IBundleProfile,
} from '@recative/extension-sdk';

export class WebBundler extends Bundler<''> {
  static id = '@recative/extension-web/WebBundler';

  static label = 'Web Bundler';

  static iconId = 'web';

  static appTemplateFromPath = null;

  static appTemplatePublicPath = '';

  static outputPublicPath = '';

  static outputPrefix = 'web';

  static outputExtensionName = 'zip';

  static excludeTemplateFilePaths = [];

  static excludeWebRootFilePaths = [
    'plugins',
    'cordova_plugins.js',
    'cordova.js',
  ];

  beforeBundleFinalized = () => {};

  afterBundleCreated = () => {};

  getBundleMetadata = (profile: IBundleProfile, bundleReleaseId: number) => {
    return {
      fileName: this.dependency.getOutputFileName(
        null,
        bundleReleaseId,
        profile
      ),
      type: AcceptedBuildType.Zip,
    };
  };
}
