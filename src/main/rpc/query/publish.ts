/* eslint-disable no-console */
import { fastRelease } from './release';
import { uploadBundle } from './publishUploadBundle';
import { newTerminalSession, wrapTaskFunction } from './terminal';

/**
 * Create release upload to remote server.
 *
 * Available steps are:
 * - `Creating Release Bundle`
 *    - `Creating Code Bundle`
 *       - `Building Code`
 *       - `Bundling Artifacts`
 *    - `Creating Media Bundle`
 *       - `Building Database`
 *       - `Copying Media`
 *    - `Creating Player Data Bundle`
 *       - `Creating Data Files`
 *       - `Extracting Artifacts`
 *    - `Creating Android APK`
 *       - `Copying application template`
 *       - `Transferring Act Point Artifacts`
 *       - `Bundling Media Resources Without a Episode`
 *       - `Creating Resource Zip for Each Episode`
 * - `Uploading To Remote Server`
 *    - `Environment Checkup`
 *    - `Uploading Media Files`
 *    - `Uploading Code Files`
 *    - `Uploading Database Files`
 *
 * @param ifCreateMediaRelease create a new media release if true.
 * @param ifCreateCodeRelease create a new code bundle if true.
 * @param notes Some information for the human.
 * @param terminalId Output information to which terminal.
 */
export const fastPublish = async (
  ifCreateMediaRelease: boolean,
  ifCreateCodeRelease: boolean,
  notes: string,
  terminalId = 'fastPublish'
) => {
  if (terminalId === 'fastPublish') {
    newTerminalSession('fastPublish', [
      'Building Code',
      'Bundling Artifacts',
      'Building Database',
      'Copying Media',
    ]);
  }

  const bundleReleaseId = await wrapTaskFunction(
    terminalId,
    'Creating Media Bundle',
    async () => {
      return fastRelease(ifCreateMediaRelease, ifCreateCodeRelease, notes);
    }
  )();

  await wrapTaskFunction(terminalId, 'Creating Media Bundle', async () => {
    if (bundleReleaseId !== null) {
      return uploadBundle(
        bundleReleaseId,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      );
    }

    throw new Error('Unable to upload an unfinished bundle');
  })();
};