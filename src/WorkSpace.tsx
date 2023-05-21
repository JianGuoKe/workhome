import { useLiveQuery } from 'dexie-react-hooks';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { db } from './Data';
import { useEffect, useState } from 'react';
import { Layout, Drawer } from 'antd';
import PPKModal from './PPKModal';
import Settings from './Settings';
import FolderModal from './FolderModal';
import WorkSpaceContext from './WorkSpaceContext';
import { components as cardComponents } from './cards';
import './WorkSpace.less';
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

function EmptyCard(){
  return '卡片不存在';
}

export default function WorkSpace() {
  const [openPPK, setOpenPPK] = useState(false);
  const [createBook, setCreateBook] = useState('add');
  const [openFolder, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [cardModal, setCardModal] = useState(false);

  const workspace = useLiveQuery(async () => {
    const ws: any = await db.workspacs.filter((ws) => ws.enabled).first();
    ws.cards = await db.cards
      .filter((card) => card.wsId === ws.id)
      .toArray();
    return ws;
  });
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
    setOpenModal(true);
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

  const showCardModal = ()=>{
    setCardModal(true);
  }

  const hideCardModal = ()=>{
    setCardModal(false)
  }

  return (
    <WorkSpaceContext.Provider
      value={{
        showKeyModal,
        hideKeyModal,
        showWorkSpacModal,
        hideWorkSpaceModal,
        showSettingsDrawer,
        closeSettingsDrawer,
        showCardModal,
        hideCardModal
      }}
    >
      <Layout className="workhome-grid">
        <Layout>
          {workspace && (
            <ResponsiveGridLayout
              className="workhome-grid-layout"
              layouts={workspace.layouts}
              cols={workspace.cols}
              rowHeight={workspace.rowHeight}
              width={workspace.width}
              onLayoutChange={(layout, allLayouts) => {
                db.updateWorkSpaceLayout(workspace, allLayouts);
              }}
            >
              {workspace.cards?.map((card: any) => {
                const Card = cardComponents[card.type] || EmptyCard;
                return (
                  <div key={card.name} className="workhome-card">
                    <Card {...card.props}></Card>
                  </div>
                );
              })}
            </ResponsiveGridLayout>
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
        open={openFolder}
        mode={createBook}
        onClose={hideWorkSpaceModal}
      ></FolderModal>
      <PPKModal open={openPPK} onClose={hideKeyModal}></PPKModal>
    </WorkSpaceContext.Provider>
  );
}
