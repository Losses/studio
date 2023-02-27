import * as React from 'react';

import { IconTabs } from 'components/Tabs/IconTabs';
import { RecativeBlock } from 'components/Block/RecativeBlock';
import { NodeInputFilled } from 'components/Icons/NodeInputFilled';
import { EditIconOutline } from 'components/Icons/EditIconOutline';
import { NodeOutputIconFilled } from 'components/Icons/NodeOutputIconFilled';
import { NodeCategoryDebugIconOutline } from 'components/Icons/NodeCategoryDebugIconOutline';
import { NodeCategoryRoutineIconOutline } from 'components/Icons/NodeCategoryRoutineIconOutline';
import {
  IconSidePanel,
  IconSidePanelPosition,
} from 'components/Tabs/IconSidePanel';
import {
  ComparisonEditor,
  ICompareTypedData,
} from 'components/ComparisonEditor/ComparisonEditor';

import { useEvent } from 'utils/hooks/useEvent';

import { BaseNode } from './Nodes/components/BaseNode';

interface ISidebarItem {
  id: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  colorId: number;
}

export const SideBarItem: React.FC<ISidebarItem> = React.memo(
  ({ id, Icon, title, colorId }) => {
    const onDragStart = useEvent((event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData('application/reactflow', id);
      event.dataTransfer.effectAllowed = 'move';
    });

    return (
      <div className="dndnode" onDragStart={onDragStart} draggable>
        <BaseNode
          id={id}
          Icon={Icon}
          title={title}
          colorId={colorId}
          titleOnly
          isConnectable={false}
        />
      </div>
    );
  }
);

const FlowSegment = () => {
  return (
    <RecativeBlock marginLeft="-12px" marginRight="-12px" marginTop="-8px">
      <SideBarItem id="i" Icon={NodeInputFilled} title="Input" colorId={2} />
      <SideBarItem
        id="o"
        Icon={NodeOutputIconFilled}
        title="Output"
        colorId={3}
      />
    </RecativeBlock>
  );
};

const DevelopmentSegment = () => {
  return (
    <RecativeBlock marginLeft="-12px" marginRight="-12px" marginTop="-8px">
      <SideBarItem id="demo" Icon={NodeInputFilled} title="Demo" colorId={1} />
    </RecativeBlock>
  );
};

const ICON_TABS_CONFIG = [
  {
    id: 'flow',
    title: 'Flow',
    Icon: NodeCategoryRoutineIconOutline,
    Content: FlowSegment,
  },
  {
    id: 'development',
    title: 'Development',
    Icon: NodeCategoryDebugIconOutline,
    Content: DevelopmentSegment,
  },
];

const ToolboxSection = React.memo(() => (
  <IconTabs config={ICON_TABS_CONFIG} initialActiveKey="flow" />
));
const DemoSection = React.memo(() => {
  const [value, setValue] = React.useState<ICompareTypedData>({
    type: 'string',
    value: '121',
    operator: 'gt',
  });

  return (
    <div>
      <ComparisonEditor value={value} onChange={setValue} />
    </div>
  );
});

const SIDE_PANEL_CONFIG = [
  {
    id: 'flow',
    title: 'Flow',
    Icon: NodeCategoryRoutineIconOutline,
    Content: ToolboxSection,
  },
  {
    id: 'edit',
    title: 'Edit',
    Icon: EditIconOutline,
    Content: DemoSection,
  },
];

export const Sidebar = React.memo(() => {
  return (
    <RecativeBlock
      minWidth="25%"
      paddingLeft="8px"
      paddingTop="4px"
      overflow="auto"
    >
      <IconSidePanel
        config={SIDE_PANEL_CONFIG}
        position={IconSidePanelPosition.Right}
      />
    </RecativeBlock>
  );
});
