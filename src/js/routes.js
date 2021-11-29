import HomePage from '../pages/home.vue';
import CatalogPage from '../pages/catalog.vue';
import SettingsPage from '../pages/settings.vue';
import NotesPage from '../pages/notes.vue';
import DevicesPage from '../pages/devices.vue';

var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/catalog/',
    component: CatalogPage,
  },
  {
    path: '/notes/',
    component: NotesPage,
  },
  {
    path: '/devices/',
    component: DevicesPage
  },
  {
    path: '/settings/',
    component: SettingsPage,
  }
];

export default routes;
