import MealPlanner from './MealPlanner';
import AdSlot from './AdSlot';

const SideBar = () => {
  return (
    <aside className='vr-sidebar'>
      <MealPlanner />
      <AdSlot
        id='101'
        position='home-sidebar'
        placement='sticky'
        height='auto'
      />
    </aside>
  );
};

export default SideBar;
