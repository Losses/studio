import CrowdinApi from '@crowdin/crowdin-api-client';

import type StreamZip from 'node-stream-zip';

import {
  Scriptlet,
  ScriptType,
  ScriptExecutionMode,
  TerminalMessageLevel,
} from '@recative/extension-sdk';
import { IResourceGroup } from '@recative/definitions';

export interface ICrowdinSyncScriptletConfig {
  personalAccessToken: string;
  projectName: string;
  targetLanguageIds: string;
}

export interface IMetadata {
  id: string;
  key: string;
  entry: StreamZip.ZipEntry;
  hash: string;
}

const languageIdMap: Record<string, string> = {
  'zh-Hans': 'zh-CN',
};

export class CrowdinSyncScriptlet extends Scriptlet<
  keyof ICrowdinSyncScriptletConfig
> {
  static id = '@recative/extension-crowdin/CrowdinSyncScriptlet';

  static label = 'Crowdin';

  static extensionConfigUiFields = [
    {
      id: 'personalAccessToken',
      type: 'string',
      label: 'API Key',
    },
    {
      id: 'projectName',
      type: 'string',
      label: 'Project Name',
    },
    {
      id: 'targetLanguageIds',
      type: 'string',
      label: 'Languages (splited with ";")',
    },
  ] as const;

  static readonly scripts = [
    {
      id: 'syncCrowdinConfig',
      label: 'Sync Crowdin Files',
      type: ScriptType.Resource,
      executeMode: ScriptExecutionMode.Terminal,
      confirmBeforeExecute: true,
    },
  ];

  syncCrowdinConfig = async () => {
    const d = this.dependency;

    const { projectsGroupsApi, sourceFilesApi, translationsApi } =
      new CrowdinApi({
        token: this.config.personalAccessToken,
      });

    try {
      const projects = await projectsGroupsApi.withFetchAll().listProjects();

      const project = projects.data.find(
        (x) => x.data.identifier === this.config.projectName
      );

      if (!project) {
        d.logToTerminal(':: Project Not found', TerminalMessageLevel.Error);

        return {
          ok: false,
          message: 'Project not found',
        };
      }

      const projectId = project.data.id;

      d.logToTerminal(`:: Project ID: ${projectId}`);

      const projectFileMetadata = await sourceFilesApi
        .withFetchAll()
        .listProjectFiles(projectId);

      d.logToTerminal(`:: Project Files:`);

      projectFileMetadata.data.forEach((x) => {
        d.logToTerminal(`:: :: ${x.data.name} (${x.data.id})`);
      });

      d.logToTerminal(`:: Downloading:`);

      await Promise.all(
        projectFileMetadata.data.flatMap((file) => {
          const fileId = file.data.id;
          const fileName = file.data.name;
          const groupId = `@crowdin/${project.data.id}/${file.data.id}`;

          const existedResourceGroup = d.db.resource.resources.find({
            id: groupId,
          });

          if (!existedResourceGroup) {
            const newGroup: IResourceGroup = {
              type: 'group',
              id: groupId,
              label: `@Crowdin/${fileName}`,
              thumbnailSrc: '',
              tags: [],
              importTime: Date.now(),
              files: [],
              removed: false,
              removedTime: -1,
            };

            d.db.resource.resources.insert(newGroup);
            d.logToTerminal(`:: Group "${groupId}" created`);
          } else {
            d.logToTerminal(`:: Group "${groupId}" existed`);
          }

          return this.config.targetLanguageIds
            .split(';')
            .map((x) => x.trim())
            .map(async (language) => {
              const translationUrl =
                await translationsApi.exportProjectTranslation(projectId, {
                  fileIds: [fileId],
                  targetLanguageId: languageIdMap[language] ?? language,
                });

              d.logToTerminal(
                `:: :: [${language}]: ${translationUrl.data.url}`
              );

              const filePath = await d.downloadFile(translationUrl.data.url);
              const fileHash = await d.getXxHashOfFile(filePath);

              const crowdinId = `@@CROWDIN/${this.config.projectName}/${fileId}`;

              const resource = d.db.resource.resources.findOne({
                removed: false,
                [`extensionConfigurations.${CrowdinSyncScriptlet.id}~~crowdinId`]:
                  crowdinId,
              });

              if (resource) {
                if (resource.type === 'group') {
                  throw new Error(`Record is a group, this is a bug`);
                }

                d.logToTerminal(
                  `:: :: :: Found existed record ${resource.label} (${resource.id})`
                );

                if (resource.originalHash === fileHash) {
                  d.logToTerminal(`:: :: :: File not modified, skip`);
                  return;
                }
              }

              const nextResource = await d.importFile(
                filePath,
                resource ? resource.id : undefined
              );

              d.logToTerminal(
                `:: :: [${language}]: File imported ${nextResource
                  .map((x) => x.id)
                  .join(', ')}`
              );

              d.db.resource.resources.findAndUpdate(
                {
                  id: {
                    $in: nextResource.map((x) => x.id),
                  },
                },
                (x) => {
                  const tagSet = new Set(x.tags);
                  tagSet.add(`lang:${language}`);

                  x.tags = [...tagSet];
                  x.label = `@Crowdin/${fileName}/${language}`;
                  if (x.type === 'file') {
                    x.extensionConfigurations[
                      `${CrowdinSyncScriptlet.id}~~crowdinId`
                    ] = crowdinId;

                    x.resourceGroupId = groupId;
                  }

                  return x;
                }
              );
            });
        })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode = error instanceof Error ? error.name : String(error);

      // eslint-disable-next-line no-console
      console.error(error);

      d.logToTerminal(
        `:: Error(${errorCode}): ${errorMessage}`,
        TerminalMessageLevel.Error
      );
      return {
        ok: false,
        message: errorMessage,
      };
    }

    return {
      ok: true,
      message: 'Imported',
    };
  };
}