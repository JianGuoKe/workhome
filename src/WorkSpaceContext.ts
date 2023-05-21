import React from 'react';
export interface WorkSpaceApi {
  showKeyModal: () => void;
  hideKeyModal: () => void;
  showWorkSpacModal: () => void;
  hideWorkSpaceModal: () => void;
  showSettingsDrawer: () => void;
  closeSettingsDrawer: () => void;
  showCardModal: () => void;
  hideCardModal: () => void;
}
const WorkSpaceContext = React.createContext<WorkSpaceApi | null>(null);
export default WorkSpaceContext;
