import { useLiveQuery } from 'dexie-react-hooks';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { db } from './Data';
import { useEffect, useMemo, useState } from 'react';
import { Layout, Drawer, message } from 'antd';
import PPKModal from './PPKModal';
import Settings from './Settings';
import FolderModal from './FolderModal';
import WorkSpaceContext from './WorkSpaceContext';
import { components as cardComponents } from './cards';
import './WorkSpace.less';
import { Responsive, WidthProvider } from 'react-grid-layout';
import EmptyCard from './cards/EmptyCard';

export default function WorkSpace() {
  const [openPPK, setOpenPPK] = useState(false);
  const [createBook, setCreateBook] = useState('add');
  const [openFolder, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );

  const { workspace, cards } =
    useLiveQuery(async () => {
      const workspace = await db.workspacs.filter((ws) => ws.enabled).first();
      const cards = await db.cards
        .filter((card) => card.wsId === workspace?.id)
        .toArray();
      return { workspace, cards };
    }) || {};
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
      <Layout className="workhome-grid">
        <Layout>
          {workspace && (
            <ResponsiveReactGridLayout
              className="workhome-grid-layout"
              layouts={workspace.layouts}
              cols={workspace.cols}
              rowHeight={workspace.rowHeight}
              width={workspace.width}
              compactType={workspace.compactType}
              onBreakpointChange={(newBreakpoint: string, newCols: number)=>{
                db.updateWorkSpaceBreakpoint(workspace, newBreakpoint, newCols).catch(e=>message.error(e.message))
              }}
              onLayoutChange={(_layout, allLayouts) => {
                db.updateWorkSpaceLayout(workspace, allLayouts).catch(e=>message.error(e.message))
              }}
              onDragStop={(
                _layout,
                _oldItem,
                newItem,
                _placeholder,
                e: MouseEvent,
                _element: HTMLElement
              ) => {
                // 拖动鼠标超出grid区域认为是删除卡片
                const client = document.querySelector(
                  '#root'
                );
                if (
                  (e.clientX <= 0 || e.clientX >= client!.clientWidth)  ||
                  (e.clientY <= 0 || e.clientY >= client!.clientHeight)
                ) {
                  db.deleteCardByName(newItem.i).catch(e=>message.error(e.message))
                }
              }}
            >
              {cards?.map((card: any) => {
                const Card = cardComponents[card.type] || EmptyCard;
                return (
                  <div key={card.name} className="workhome-card">
                    <Card {...card.props}></Card>
                  </div>
                );
              })}
            </ResponsiveReactGridLayout>
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
