import SidebarMobile from './mobile/SidebarMobile';
import SidebarDesktop from './desktop/SidebarDesktop';

const Sidebar = ({ selectedKey, setSelectedKey, collapsed, setCollapsed, isMobile }) => {
  if (isMobile) {
    return <SidebarMobile selectedKey={selectedKey} setSelectedKey={setSelectedKey} />;
  }

  return (
    <SidebarDesktop 
      selectedKey={selectedKey} 
      setSelectedKey={setSelectedKey} 
      collapsed={collapsed} 
      setCollapsed={setCollapsed}
    />
  );
};

export default Sidebar;