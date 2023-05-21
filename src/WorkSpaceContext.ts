import React from 'react';
import { Card } from './Data';
export interface WorkSpaceApi {
  showKeyModal: () => void;
  hideKeyModal: () => void;
  showWorkSpacModal: () => void;
  hideWorkSpaceModal: () => void;
  showSettingsDrawer: () => void;
  closeSettingsDrawer: () => void;  
  showCardDesignerModal: (card?: Card) => void; 
  hideCardDesignerModal: () => void; 
}
const WorkSpaceContext = React.createContext<WorkSpaceApi | null>(null);
export default WorkSpaceContext;
