import { useLiveQuery } from 'dexie-react-hooks';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { db } from './Data';
import { useEffect, useState } from 'react';
import { Layout, Drawer } from 'antd';
import PPKModal from './PPKModal';
import Settings from './Settings';
import FolderModal from './FolderModal';
import './WorkSpace.less';
import DefaultCard from './cards/DefaultCard';
import WorkSpaceContext from './WorkSpaceContext';
import SettingCard from './cards/SettingCard';

export default function WorkSpace() {
  const [openPPK, setOpenPPK] = useState(false);
  const [createBook, setCreateBook] = useState('add');
  const [openBook, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const workspace = useLiveQuery(() =>
    db.workspacs.filter((ws) => ws.enabled).first()
  );
  const nokey = useLiveQuery(
    async () => !(await db.getActiveKey()) && !!(await db.getActaiveNode())
  );

  useEffect(() => {
    nokey && setOpenPPK(true);
  }, [nokey]);

  const showKeyModal = () => {
    setOpenPPK(true);
  };

  const hideKeyModal = () => {
    setOpenPPK(false);
  };

  const showWorkSpacModal = (createFolder = 'add') => {
    setCreateBook(createFolder);
  };

  const hideWorkSpaceModal = () => {
    setOpenModal(false);
  };

  const showSettingsDrawer = () => {
    setOpenSettings(true);
  };

  const closeSettingsDrawer = () => {
    setOpenSettings(false);
  };

  return (
    <WorkSpaceContext.Provider
      value={{
        showKeyModal, 
        hideKeyModal,
        showWorkSpacModal,
        hideWorkSpaceModal,
        showSettingsDrawer,
        closeSettingsDrawer,
      }}
    >
      <Layout hasSider={true} className="workhome-grid">
        <Layout hasSider={true}>
          {workspace && (
            <GridLayout
              className="layout"
              layout={workspace.layout}
              cols={workspace.cols}
              rowHeight={workspace.rowHeight}
              width={workspace.width}
              onLayoutChange={(layout) =>
                db.updateWorkSpaceLayout(workspace, layout)
              }
            >
              <div key="a">
                <DefaultCard></DefaultCard>
              </div>
              <div key="b">
                <DefaultCard></DefaultCard>
              </div>
              <div key="c">
                <SettingCard></SettingCard>
              </div>
            </GridLayout>
          )}
        </Layout>
        <Drawer
          title="设置"
          placement="right"
          onClose={closeSettingsDrawer}
          open={openSettings}
        >
          <Settings
            onPPKAdd={showKeyModal}
            onFolderAdd={showWorkSpacModal}
          ></Settings>
        </Drawer>
      </Layout>
      <FolderModal
        open={openBook}
        mode={createBook}
        onClose={hideWorkSpaceModal}
      ></FolderModal>
      <PPKModal open={openPPK} onClose={hideKeyModal}></PPKModal>
    </WorkSpaceContext.Provider>
  );
}
