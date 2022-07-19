import * as React from 'react';

import { Client as Styletron } from 'styletron-engine-monolithic';
import { BaseProvider, createTheme, useStyletron } from 'baseui';
import { Provider as StyletronProvider } from 'styletron-react';
import { Routes, Route } from 'react-router-dom';

import type { StandardEngine } from 'styletron-react';

import { Block } from 'baseui/block';
// @ts-ignore: We just don't have a type definition for this yet
import { TitleBar } from 'react-desktop/windows';

import { server } from 'utils/rpc';
import { useDatabaseLockChecker } from 'utils/hooks/useDatabaseLockChecker';

import { Login } from './pages/User/Login';
import { Cloud } from './pages/Cloud/Cloud';
import { Series } from './pages/Series/Series';
import { Welcome } from './pages/Welcome/Welcome';
import { Publish } from './pages/Publish/Publish';
import { Episode } from './pages/Episode/Episode';
import { Release } from './pages/Release/Release';
import { Setting } from './pages/Setting/Setting';
import { Preview } from './pages/Preview/Preview';
import { Resource } from './pages/Resource/Resource';
import { ActPoint } from './pages/ActPoint/ActPoint';
import { UserInfo } from './pages/User/UserInfo';
import { NewResource } from './pages/Welcome/NewResource';
import { ImportResource } from './pages/Welcome/ImportResource';
import { InitializeErrorModal } from './pages/Server/components/InitializeErrorModal';
import { MergeResourceDatabase } from './pages/Utils/MergeResourceDatabase';

import { User } from './components/ContextMenu/User';
import { ResourceSearchModal } from './components/ResourceSearchModal/ResourceSearchModal';

import './App.global.css';
import './resources/fonts/raleway/raleway.css';
import './resources/fonts/redHatMono/redHatMono.css';
import './resources/fonts/notoColorEmoji/notoColorEmoji.css';

type FixedStyletronProviderType = React.Provider<StandardEngine> & {
  children: React.ReactNode;
};

const FixedStyletronProvider = StyletronProvider as FixedStyletronProviderType;

const engine = new Styletron();

const CustomizedTheme = createTheme(
  {
    primaryFontFamily: 'Raleway, Noto Color Emoji',
  },
  {
    borders: {
      useRoundedCorners: false,
      radius100: '0px',
      radius200: '0px',
      radius300: '0px',
      radius400: '0px',
      radius500: '0px',
      buttonBorderRadius: '0px',
    },
    typography: {
      DisplayLarge: {
        fontFamily: 'Raleway',
      },
      DisplayMedium: {
        fontFamily: 'Raleway',
      },
      DisplaySmall: {
        fontFamily: 'Raleway',
      },
      DisplayXSmall: {
        fontFamily: 'Raleway',
      },
    },
  }
);

const ScrollbarStyles: React.FC = () => {
  const [, theme] = useStyletron();
  return (
    <style>{`
    /* Works on Chrome, Edge, and Safari */
    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    *::-webkit-scrollbar-track {
      background: ${theme.colors.backgroundPrimary};
    }

    *::-webkit-scrollbar-thumb {
      border: solid ${theme.colors.backgroundPrimary};
      border-width: 0 2px 0 2px;
      background-color: ${theme.colors.contentTertiary};
      transition: background-color ${theme.animation.timing300};
    }

    *::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.colors.contentPrimary};
    }
    `}</style>
  );
};

export const InternalStudioTitleBar = () => {
  const [windowIsMaximized, setWindowIsMaximized] = React.useState(false);

  const handleMaximizeClick = React.useCallback(() => {
    server.maximizeMainWindow();
    setWindowIsMaximized(true);
  }, []);

  const handleUnMaximizeClick = React.useCallback(() => {
    server.unmaximizeMainWindow();
    setWindowIsMaximized(false);
  }, []);

  return (
    <TitleBar
      className="app-title-bar"
      controls
      title="Resource Manager"
      isMaximized={windowIsMaximized}
      onCloseClick={() => server.closeMainWindow()}
      onMaximizeClick={handleMaximizeClick}
      onMinimizeClick={() => server.minimizeMainWindow()}
      onRestoreDownClick={handleUnMaximizeClick}
    >
      <User />
    </TitleBar>
  );
};

export const StudioTitleBar = React.memo(InternalStudioTitleBar);

export default function App() {
  useDatabaseLockChecker();

  return (
    <FixedStyletronProvider value={engine}>
      <Block width="100vw" height="30px" />
      <Block top="0" left="0" width="100vw" position="fixed">
        <StudioTitleBar />
      </Block>
      <div
        style={{
          top: 0,
          left: 0,
          width: 'calc(100vw - 240px)',
          height: '32px',
          position: 'fixed',
          // @ts-ignore: For electron
          WebkitAppRegion: 'drag',
        }}
      />
      <BaseProvider theme={CustomizedTheme}>
        <Routes>
          <Route path="import" element={<ImportResource />} />
          <Route path="new" element={<NewResource />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="publish" element={<Publish />} />
          <Route path="setting" element={<Setting />} />
          <Route path="resource" element={<Resource />} />
          <Route path="episode" element={<Episode />} />
          <Route path="cloud" element={<Cloud />} />
          <Route path="series" element={<Series />} />
          <Route path="act-point" element={<ActPoint />} />
          <Route path="release" element={<Release />} />
          <Route path="preview" element={<Preview />} />
          <Route path="merge-resource-db" element={<MergeResourceDatabase />} />
          <Route path="/" element={<Welcome />} />
        </Routes>
        <ScrollbarStyles />
        <Login />
        <UserInfo />
        <InitializeErrorModal />
        <ResourceSearchModal />
      </BaseProvider>
    </FixedStyletronProvider>
  );
}
